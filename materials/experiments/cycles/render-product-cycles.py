"""Сидр для статического слайдера: Blender Cycles, CPU, четыре независимых слоя."""
import argparse
from array import array
import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

ROOT = next(parent for parent in Path(__file__).resolve().parents if (parent / 'package.json').is_file())
ARCHIVE = Path(__file__).resolve().parent
ASSETS = ARCHIVE / 'assets'
ASSETS.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--resume', type=Path, help='Повторно собрать сохранённые EXR после ошибки экспорта, без тяжёлого пересчёта')
parser.add_argument('--samples', type=int, default=96)
parser.add_argument('--only', choices=['glass', 'can', 'glass-shadow', 'can-shadow'], help='Пересчитать один слой; остальные взять из существующих WebP')
parser.add_argument('--seconds', type=float, default=90, help='Предел расчёта одного слоя, без подготовки и денойзинга')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
if args.samples < 1 or args.seconds <= 0:
    parser.error('samples и seconds должны быть положительными')


def node(code, *arguments):
    return subprocess.check_output(['node', '--input-type=module', '-e', code, *map(str, arguments)], cwd=ROOT, text=True)


settings = json.loads(node(r"""
import { productRenderSettings, canLabelPresets } from './src/data/product-render-settings.js';
import { drinkPresets } from './src/data/drink-presets.js';
import { productLightSettings } from './src/three/product/product-light.js';
import fs from 'node:fs';
const frame = JSON.parse(fs.readFileSync('src/data/product-slider-renders.js', 'utf8').match(/productRenderFrame = Object.freeze\((\{[^\n]+\})\)/)[1]);
const model = fs.readFileSync('src/three/product/product-models.js', 'utf8');
const dimensions = Function('return (' + model.match(/const modelDimensions = Object.freeze\(([^\n]+)\)/)[1] + ')')();
const layout = fs.readFileSync('src/three/product/product-renderer.js', 'utf8');
const px = name => Number(layout.match(new RegExp('--product-' + name + ':\\s*(\\d+)px'))[1]);
console.log(JSON.stringify({camera:productRenderSettings.camera, light:productLightSettings, frame, dimensions,
 recipe:drinkPresets[canLabelPresets.antonovka.drink], label:canLabelPresets.antonovka.label,
 layout:{height:px('model-height'),bottom:px('model-bottom'),offset:px('can-offset'),canBottom:px('can-bottom')},
 pixelRatio:Math.min(productRenderSettings.quality.maxPixelRatio,productRenderSettings.quality.maxModelPixels/px('model-height'))}));
"""))


def xyz(value):
    """Three Y-up → Blender Z-up, сохраняя правую систему координат."""
    return Vector((value[0], -value[2], value[1]))


def import_model(path, kind):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    objects = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in objects if o.type == 'MESH']
    points = [o.matrix_world @ Vector(corner) for o in meshes for corner in o.bound_box]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center, size = (high + low) / 2, high - low
    dimensions = settings['dimensions'][kind]
    height = dimensions['height'] * 2 / settings['dimensions']['glass']['height']
    radial = dimensions.get('diameter', 0) * 2 / settings['dimensions']['glass']['height'] / max(size.x, size.y) if kind == 'can' else height / size.z
    transform = Matrix.Translation((0, 0, (height - 2) / 2)) @ Matrix.Rotation(0.35, 4, 'Z') @ Matrix.Diagonal((radial, radial, height / size.z, 1)) @ Matrix.Translation(-center)
    # Разрываем импортированную иерархию после сохранения мировых матриц.
    matrices = {o: o.matrix_world.copy() for o in meshes}
    for o in meshes:
        o.parent = None
        o.matrix_world = transform @ matrices[o]
        o.name = kind + '-' + o.name
        for polygon in o.data.polygons:
            polygon.use_smooth = True
    for o in objects:
        if o.type != 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)
    bpy.context.view_layer.update()
    print('MODEL', kind, 'height', height, 'source_bounds', list(low), list(high), flush=True)
    return meshes, radial


def principled(name, roughness, ior=1.5, transmission=0, metal=0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    shader = nodes.new('ShaderNodeBsdfPrincipled')
    shader.inputs['Base Color'].default_value = (1, 1, 1, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['IOR'].default_value = ior
    shader.inputs['Transmission Weight'].default_value = transmission
    shader.inputs['Metallic'].default_value = metal
    material.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    return material, shader, output


def assign(obj, material):
    obj.data.materials.clear()
    obj.data.materials.append(material)


def area(name, position, target, energy, width, height, color=(1, 1, 1)):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy, data.shape, data.size, data.size_y = energy, 'RECTANGLE', width, height
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = xyz(position)
    obj.rotation_euler = (xyz(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    return obj


def visible(objects, camera=True, render=True):
    for obj in objects:
        obj.hide_render = not render
        obj.visible_camera = camera


bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.render.threads_mode = 'FIXED'
scene.render.threads = 4
scene.cycles.samples = args.samples
scene.cycles.time_limit = args.seconds
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.025
scene.cycles.use_denoising = True
scene.cycles.denoiser = 'OPENIMAGEDENOISE'
scene.cycles.denoising_use_gpu = False
scene.cycles.max_bounces = 16
scene.cycles.transmission_bounces = 16
scene.cycles.transparent_max_bounces = 16
scene.cycles.seed = 42
scene.render.film_transparent = True
scene.cycles.film_transparent_glass = True
scene.cycles.film_transparent_roughness = 0.1
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.resolution_x = settings['frame']['width']
scene.render.resolution_y = settings['frame']['height']
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.8, 0.85, 1, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.035
scene['product_render_source'] = json.dumps(settings, ensure_ascii=False)
scene['product_render_device'] = 'CPU / 4 threads'

from contextlib import nullcontext

with (nullcontext(args.resume) if args.resume else tempfile.TemporaryDirectory(prefix='medved-cycles-', delete=False)) as temporary:
    temporary = Path(temporary)
    glass, model_scale = import_model(ROOT / 'src/assets/models/glass.glb', 'glass')
    can, _ = import_model(ROOT / 'src/assets/models/can-450ml.glb', 'can')
    camera_settings, layout = settings['camera'], settings['layout']
    direction = (Vector(camera_settings['target']) - Vector(camera_settings['position'])).normalized()
    right = direction.cross(Vector((0, 1, 0))).normalized()
    up = right.cross(direction).normalized()
    world_per_css = camera_settings['halfHeight'] * 2 / layout['height']
    offset = right * layout['offset'] * world_per_css + up * (layout['canBottom'] - layout['bottom']) * world_per_css + direction * 0.18 * (camera_settings['far'] - camera_settings['near']) / 2
    offset += direction * (-offset.y / direction.y)
    for obj in can:
        obj.location += xyz(offset)
    frame = settings['frame']
    world_height = frame['height'] / settings['pixelRatio'] * world_per_css
    world_width = frame['width'] / settings['pixelRatio'] * world_per_css
    origin = [float(part.rstrip('%')) / 100 for part in frame['origins']['glass'].split()]
    shift = right * (-(origin[0] - 0.5) * world_width) + up * (Vector((0, -1, 0)).dot(up) - (0.5 - origin[1]) * world_height)
    camera_data = bpy.data.cameras.new('shared-product-camera')
    camera_data.type, camera_data.ortho_scale = 'ORTHO', world_width
    camera = bpy.data.objects.new('shared-product-camera', camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = xyz(Vector(camera_settings['position']) + shift)
    camera.rotation_euler = (xyz(direction)).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = camera

    shell, _, _ = principled('clear-glass-cycles', 0.015, 1.52, 1)
    liquid, _, liquid_output = principled('cider-antonovka-cycles', 0.005, 1.333, 1)
    coefficients = [v * 10 / model_scale for v in settings['recipe']['absorption']]
    density = max(coefficients)
    absorption = liquid.node_tree.nodes.new('ShaderNodeVolumeAbsorption')
    absorption.inputs['Color'].default_value = tuple(1 - v / density for v in coefficients) + (1,)
    absorption.inputs['Density'].default_value = density
    liquid.node_tree.links.new(absorption.outputs['Volume'], liquid_output.inputs['Volume'])
    # Оригинальная поверхность пузырьков заменяется статичными геометрическими пузырьками.
    liquid_object = None
    for obj in glass:
        names = [m.name.lower() for m in obj.data.materials if m]
        if any('golden-mead' in n for n in names):
            liquid_object = obj
            assign(obj, liquid)
        elif any('bubble' in n for n in names):
            obj.hide_render = True
        else:
            assign(obj, shell)
    glass = [o for o in glass if not o.hide_render]
    if liquid_object is None:
        raise RuntimeError('В исходном GLB не найдена жидкость')

    # Та же печатная область и UV из GLB, что у браузерного экспортёра.
    printed_materials = {m for o in can for m in o.data.materials if m and 'label' in m.name.lower()}
    if not printed_materials:
        raise RuntimeError('В исходном GLB не найдена этикетка')
    for material in printed_materials:
        image_nodes = [n for n in material.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image]
        image_node = next((n for n in image_nodes if n.image.colorspace_settings.name == 'sRGB'), image_nodes[0])
        width, height = image_node.image.size
        label_canvas = temporary / 'label.png'
        node("""
import sharp from 'sharp';
const [source, output, w, h] = process.argv.slice(1), width=Number(w), height=Number(h);
const meta=await sharp(source).metadata(), scale=Math.min(width*2376/2696/meta.width,height/meta.height);
const rw=Math.round(meta.width*scale),rh=Math.round(meta.height*scale);
const label=await sharp(source).resize(rw,rh).toBuffer();
await sharp({create:{width,height,channels:4,background:'#ffffff00'}}).composite([{input:label,left:Math.round((width-rw)/2),top:Math.round((height-rh)/2)}]).png().toFile(output);
""", ROOT / f"materials/customer-design/labels/cans-330ml-500ml/{settings['label']}.png", label_canvas, width, height)
        image_node.image = bpy.data.images.load(str(label_canvas))
        image_node.image.pack()
        shader = next(n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        shader.inputs['Roughness'].default_value = 0.32
        shader.inputs['Metallic'].default_value = 0.0
        # Поля печатной области должны открывать металлическую оболочку GLB.
        material.node_tree.links.new(image_node.outputs['Alpha'], shader.inputs['Alpha'])
        if 'Coat Weight' in shader.inputs:
            shader.inputs['Coat Weight'].default_value = 0.12
            shader.inputs['Coat Roughness'].default_value = 0.24
    aluminium, metal_shader, _ = principled('brushed-aluminium-cycles', 0.26, metal=1)
    metal_shader.inputs['Base Color'].default_value = (.72, .74, .76, 1)
    if 'Anisotropic IOR Level' in metal_shader.inputs:
        metal_shader.inputs['Anisotropic IOR Level'].default_value = 0.25
    nodes = aluminium.node_tree.nodes
    coordinates = nodes.new('ShaderNodeTexCoord')
    stretch = nodes.new('ShaderNodeVectorMath')
    stretch.operation = 'MULTIPLY'
    stretch.inputs[1].default_value = (1, 1, 24)
    noise = nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 180
    noise.inputs['Detail'].default_value = 2
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .12
    bump.inputs['Distance'].default_value = .00015
    links = aluminium.node_tree.links
    links.new(coordinates.outputs['Generated'], stretch.inputs[0])
    links.new(stretch.outputs['Vector'], noise.inputs['Vector'])
    links.new(noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], metal_shader.inputs['Normal'])
    for obj in can:
        for index, material in enumerate(obj.data.materials):
            if material and material not in printed_materials:
                obj.data.materials[index] = aluminium

    def random(index, salt):
        value = math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453
        return value - math.floor(value)

    # Снимок пузырьков при t=0; размеры берём из той же формулы лабы.
    vertices = [Vector(v.co) for v in liquid_object.data.vertices]
    # После glTF импорта ось меша может оставаться Y-up: используем мировые координаты.
    points = [liquid_object.matrix_world @ v for v in vertices]
    bottom, top = min(v.z for v in points), max(v.z for v in points)
    rings = {}
    for p in points:
        z = round(p.z, 4)
        rings[z] = max(rings.get(z, 0), math.hypot(p.x, p.y))
    profile = sorted(rings.items())
    def liquid_radius(z):
        for (a, ra), (b, rb) in zip(profile, profile[1:]):
            if a <= z <= b:
                return ra + (rb - ra) * (z - a) / (b - a)
        return profile[0][1] if z < profile[0][0] else profile[-1][1]
    bubble_material, _, _ = principled('air-bubble-cycles', 0.01, 1 / 1.333, 1)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1)
    template = bpy.context.object
    mesh = template.data
    mesh.materials.append(bubble_material)
    for face in mesh.polygons:
        face.use_smooth = True
    bpy.data.objects.remove(template, do_unlink=True)
    for i in range(288):
        attached, cluster = i < 216, i // 12
        angle = cluster * 2.399963 + random(cluster, 1) * 0.4 + (random(i, 3) - 0.5) * 0.38 if attached else random(i, 3) * 2 * math.pi
        start = bottom + (top - bottom) * (max(.025, min(.94, .07 + random(cluster, 2) * .82 + (random(i, 4) - .5) * .12)) if attached else random(i, 4) * .2)
        phase, hold = random(i, 6), .72 + random(i, 8) * .16 if attached else 0
        rising = phase >= hold
        progress = (phase - hold) / (1 - hold) if rising else 0
        ascent = progress * (.65 + .35 * progress)
        z = start + (top - start) * ascent
        growth = 1 + progress * .15 if rising else .65 + .35 * phase / hold
        fade = min(1, (1 - progress) / .04, 1 if attached else progress / .04) if rising else 1
        radius = min((.006 + random(i, 9) ** 2 * .006) * model_scale / 10 * growth * fade, z - bottom, top - z)
        if radius <= 0:
            continue
        wall = max(0, min(liquid_radius(z - radius), liquid_radius(z + radius)) - radius - .0005 * model_scale / 10)
        distance = wall * (1 - ascent * .1 if attached else math.sqrt(random(i, 5)) * .93)
        obj = bpy.data.objects.new(f'static-bubble-{i:03}', mesh)
        bpy.context.collection.objects.link(obj)
        obj.location = (math.cos(angle) * distance, -math.sin(angle) * distance, z)
        obj.scale = (radius,) * 3
        glass.append(obj)

    light = settings['light']
    # Более компактный софтбокс помещает всю боковую тень в существующий кадр.
    key = area('shared-key', light['position'], light['target'], 250, light['width'], light['height'] / 2)
    area('studio-rim', [2.4, 2.8, -2], [0, 0, 0], 90, 1.4, 3)

    def reflection_surface(obj, path, strength):
        # Стена и дерево участвуют в отражениях, но не запекаются в RGBA-фон.
        material = bpy.data.materials.new(obj.name)
        material.use_nodes = True
        nodes = material.node_tree.nodes
        nodes.clear()
        image = nodes.new('ShaderNodeTexImage')
        image.image = bpy.data.images.load(str(path))
        image.image.pack()
        emission = nodes.new('ShaderNodeEmission')
        emission.inputs['Strength'].default_value = strength
        output_node = nodes.new('ShaderNodeOutputMaterial')
        # Рисунок окружения остаётся слабой деталью нейтрального отражения.
        # Дерево не должно окрашивать алюминий, тёмные бочки — давать чёрные пятна.
        tint = nodes.new('ShaderNodeHueSaturation')
        tint.inputs['Saturation'].default_value = .1
        material.node_tree.links.new(image.outputs['Color'], tint.inputs['Color'])
        neutral = nodes.new('ShaderNodeMixRGB')
        neutral.blend_type = 'MIX'
        neutral.inputs[0].default_value = .7
        neutral.inputs[2].default_value = (.35, .35, .35, 1)
        material.node_tree.links.new(tint.outputs['Color'], neutral.inputs[1])
        material.node_tree.links.new(neutral.outputs['Color'], emission.inputs['Color'])
        material.node_tree.links.new(emission.outputs[0], output_node.inputs['Surface'])
        assign(obj, material)
        obj.visible_camera = False
        obj.visible_transmission = False
        obj.visible_shadow = False
        obj.visible_diffuse = False
        obj.visible_glossy = True

    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=8, depth=10, end_fill_type='NOTHING', location=(0, 0, 3.7))
    wall = bpy.context.object
    wall.name = 'slider-wall-reflections'
    reflection_surface(wall, ROOT / 'src/assets/home/product-slider-background.png', .3)
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -1.015))
    wood = bpy.context.object
    wood.name = 'slider-counter-reflections'
    reflection_surface(wood, ROOT / 'src/assets/home/bar-counter-texture.png', .18)
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -1.001))
    floor = bpy.context.object
    floor.name = 'separate-shadow-catcher'
    floor.is_shadow_catcher = True
    ground, shader, _ = principled('neutral-counter', .55)
    shader.inputs['Base Color'].default_value = (.65, .65, .65, 1)
    assign(floor, ground)
    output = ARCHIVE / 'output'
    output.mkdir(parents=True, exist_ok=True)
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(output / 'sidr-cycles-preview.blend'))
    # Два фона измеряют цветное пропускание жидкости; фон не попадает в WebP.
    bpy.ops.mesh.primitive_plane_add(size=40)
    backdrop = bpy.context.object
    backdrop.name = 'transmission-measurement-backdrop'
    backdrop.location = camera.location + xyz(direction) * 12
    backdrop.rotation_euler = camera.rotation_euler
    backdrop.visible_shadow = False
    backdrop.visible_diffuse = False
    backdrop.visible_glossy = False
    background_material = bpy.data.materials.new('transmission-measurement-background')
    background_material.use_nodes = True
    background_material.node_tree.nodes.clear()
    background_output = background_material.node_tree.nodes.new('ShaderNodeOutputMaterial')
    background_emission = background_material.node_tree.nodes.new('ShaderNodeEmission')
    background_material.node_tree.links.new(background_emission.outputs[0], background_output.inputs['Surface'])
    assign(backdrop, background_material)
    backdrop.hide_render = True
    saved_materials = {o: list(o.data.materials) for o in glass}
    shadow_proxy, _, _ = principled('glass-shadow-proxy', .4)
    shadow_masks = {}
    bpy.context.view_layer.update()
    camera_inverse = camera.matrix_world.inverted()
    for kind, objects in [('glass', glass[:2]), ('can', can)]:
        points = []
        for obj in objects:
            if obj.name.startswith('static-bubble'):
                continue
            for corner in obj.bound_box:
                point = obj.matrix_world @ Vector(corner)
                for lx in (-light['width'] / 2, light['width'] / 2):
                    for ly in (-key.data.size_y / 2, key.data.size_y / 2):
                        emitter = key.matrix_world @ Vector((lx, ly, 0))
                        projected = emitter + (point - emitter) * ((-1.001 - emitter.z) / (point.z - emitter.z))
                        view = camera_inverse @ projected
                        points.append(((.5 + view.x / world_width) * frame['width'], (.5 - view.y / world_height) * frame['height']))
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        ordered = sorted(set(points))
        lower, upper = [], []
        for point in ordered:
            while len(lower) >= 2 and cross(lower[-2], lower[-1], point) <= 0:
                lower.pop()
            lower.append(point)
        for point in reversed(ordered):
            while len(upper) >= 2 and cross(upper[-2], upper[-1], point) <= 0:
                upper.pop()
            upper.append(point)
        hull = lower[:-1] + upper[:-1]
        print('SHADOW_SUPPORT', kind, hull, flush=True)
        if any(x < 4 or y < 4 or x > frame['width'] - 4 or y > frame['height'] - 4 for x, y in hull):
            raise RuntimeError(f'{kind}: геометрическая область тени выходит за кадр')
        shadow_masks[kind] = hull
    for layer in ('glass', 'can', 'glass-shadow', 'can-shadow'):
        if args.only and layer != args.only:
            node("import sharp from 'sharp'; await sharp(process.argv[1]).png().toFile(process.argv[2]);", ASSETS / f'sidr-{layer}.webp', temporary / f'{layer}.png')
            continue
        shadow = layer.endswith('-shadow')
        visible(glass, camera=layer == 'glass', render=layer.startswith('glass') or layer == 'can')
        visible(can, camera=layer == 'can', render=layer.startswith('can'))
        floor.hide_render = not shadow
        for lamp in bpy.data.objects:
            if lamp.type == 'LIGHT':
                lamp.hide_render = shadow and lamp != key
        for obj in glass:
            obj.data.materials.clear()
            for material in saved_materials[obj]:
                obj.data.materials.append(material)
        if layer == 'glass-shadow':
            # Та же непрозрачная геометрия отбрасывает тень в старой общей сцене.
            for obj in glass:
                assign(obj, shadow_proxy)
        # Стакан сохраняет тень на банке, но не оставляет в ней отражённый дубль.
        for obj in glass:
            obj.visible_glossy = layer != 'can'
            obj.visible_transmission = layer != 'can'
        scene.cycles.time_limit = args.seconds / 2 if shadow else args.seconds
        scene.cycles.samples = max(32, args.samples // 2) if shadow else args.samples
        scene.render.filepath = str(temporary / f'{layer}.png')
        print('LAYER_START', layer, 'CPU', 'threads=4', flush=True)
        if layer == 'glass':
            backdrop.hide_render = False
            scene.cycles.film_transparent_glass = False
            # Измеряем пропускание в линейном float-буфере, до AgX и sRGB.
            scene.render.image_settings.file_format = 'OPEN_EXR'
            scene.render.image_settings.color_depth = '32'
            buffers = []
            for name, value in [('black', 0), ('white', 1)]:
                background_emission.inputs['Color'].default_value = (value, value, value, 1)
                scene.render.filepath = str(temporary / f'glass-{name}.exr')
                if not args.resume or not Path(scene.render.filepath).is_file():
                    bpy.ops.render.render(write_still=True)
                image = bpy.data.images.load(scene.render.filepath, check_existing=False)
                pixels = array('f', [0]) * (frame['width'] * frame['height'] * 4)
                image.pixels.foreach_get(pixels)
                buffers.append(pixels)
                bpy.data.images.remove(image)
            backdrop.hide_render = True
            scene.cycles.film_transparent_glass = True
            # Отдельный непрозрачный проход даёт маску текущей геометрии.
            # Шум EXR на пустом фоне не должен превращаться в прозрачную плёнку.
            silhouette, silhouette_shader, _ = principled('geometry-export-mask', 1)
            silhouette_shader.inputs['Emission Color'].default_value = (1, 1, 1, 1)
            silhouette_shader.inputs['Emission Strength'].default_value = 1
            for obj in glass:
                assign(obj, silhouette)
            scene.cycles.samples = 16
            scene.cycles.use_denoising = False
            scene.render.filepath = str(temporary / 'glass-mask.exr')
            bpy.ops.render.render(write_still=True)
            mask_image = bpy.data.images.load(scene.render.filepath, check_existing=False)
            mask = array('f', [0]) * (frame['width'] * frame['height'] * 4)
            mask_image.pixels.foreach_get(mask)
            bpy.data.images.remove(mask_image)
            scene.cycles.use_denoising = True
            for obj in glass:
                obj.data.materials.clear()
                for material in saved_materials[obj]:
                    obj.data.materials.append(material)
            black, white = buffers
            rgba = array('f', [0]) * len(black)
            for i in range(0, len(black), 4):
                if mask[i+3] <= 0:
                    continue
                transmission = [max(0, min(1, white[i+c] - black[i+c])) for c in range(3)]
                clear = min(transmission)
                alpha = 1 - clear
                # Фон имеет точно единичное пропускание; порог убирает погрешность float.
                if alpha < .002:
                    continue
                for c in range(3):
                    rgba[i+c] = max(0, (black[i+c] + transmission[c] - clear) / alpha)
                rgba[i+3] = alpha * mask[i+3]
            image = bpy.data.images.new('linear-glass-export', width=frame['width'], height=frame['height'], alpha=True, float_buffer=True)
            image.alpha_mode = 'STRAIGHT'
            image.pixels.foreach_set(rgba)
            image.update()
            scene.render.image_settings.file_format = 'PNG'
            scene.render.image_settings.color_depth = '8'
            # Единственная обработка цвета выполняется после расчёта RGBA.
            image.save_render(str(temporary / 'glass.png'), scene=scene)
            bpy.data.images.remove(image)

        else:
            bpy.ops.render.render(write_still=True)
        if shadow:
            # Прямой свет может давать тень только внутри проекции геометрии
            # от краёв излучателя. Исключаем за её пределами шум shadow catcher.
            node(r"""
import sharp from 'sharp';
const [file,points]=process.argv.slice(1), hull=JSON.parse(points),meta=await sharp(file).metadata();
const svg=Buffer.from(`<svg width="${meta.width}" height="${meta.height}"><polygon fill="white" points="${hull.map(p=>p.join(',')).join(' ')}"/></svg>`);
const mask=await sharp(svg).png().toBuffer();
const {data,info}=await sharp(file).composite([{input:mask,blend:'dest-in'}]).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let i=3;i<data.length;i+=4)data[i]=Math.round(data[i]*.25);
await sharp(data,{raw:info}).png().toFile(file);
""", temporary / f'{layer}.png', json.dumps(shadow_masks[layer.split('-')[0]]))
        print('LAYER_DONE', layer, flush=True)
    # Проверяем все слои до замены; подготовленный результат записывается одним пакетом.
    node("""
import sharp from 'sharp'; import fs from 'node:fs/promises';
const [temp, root]=process.argv.slice(1), layers=['glass','can','glass-shadow','can-shadow'];
for(const layer of layers){
 const image=sharp(`${temp}/${layer}.png`),meta=await image.metadata();
 const {data,info}=await image.ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let count=0,border=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const alpha=data[(y*info.width+x)*4+3];if(alpha)count++;
  if(x===0||y===0||x===info.width-1||y===info.height-1)border=Math.max(border,alpha);
 }
 if(!count||border)throw new Error(`${layer}: empty=${!count}, clipped border alpha=${border}`);
 await sharp(`${temp}/${layer}.png`).webp({lossless:true}).toFile(`${temp}/${layer}.webp`);
 console.log('LAYER_CHECK',layer,meta.width,meta.height,count,'borderAlpha',border);
}
const {width,height}=await sharp(`${temp}/glass.png`).metadata();
await sharp({create:{width,height,channels:4,background:'#00000000'}})
 .composite(['can-shadow','glass-shadow','can','glass'].map(layer=>({input:`${temp}/${layer}.png`})))
 .png().toFile(`${root}/output/sidr-cycles-preview.png`);
for(const layer of layers)await fs.copyFile(`${temp}/${layer}.webp`,`${root}/assets/sidr-${layer}.webp`);
""", temporary, ARCHIVE)
    print('CYCLES_EXPORT_COMPLETE', output / 'sidr-cycles-preview.png', flush=True)
    shutil.rmtree(temporary)
