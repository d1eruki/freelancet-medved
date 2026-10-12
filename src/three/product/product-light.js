import { productRenderSettings } from '../../data/product-render-settings.js'
import { DirectionalLight, VSMShadowMap } from 'three'

export { productLightSettings } from '../../data/product-render-settings.js'
import { productLightSettings } from '../../data/product-render-settings.js'

export function createLightPanel(THREE, settings = productLightSettings) {
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(settings.width, settings.height),
    new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(settings.radiance), side: THREE.DoubleSide }))
  panel.position.set(...settings.position)
  panel.lookAt(new THREE.Vector3(...settings.target))
  return panel
}

// Контактный экспорт повторяет проход старого glass.html: VSM только по
// продукту, затем два прохода Gaussian по альфе. Свет продукта не меняется.
export function renderProductContactShadow(THREE, renderer, scene, camera, lightSource, groundY, hideCasters, settings = productRenderSettings.shadows.contact) {
  const receiver = lightSource.receiver
  const previous = { type: renderer.shadowMap.type, autoUpdate: renderer.shadowMap.autoUpdate,
    material: receiver.material, visible: receiver.visible, castShadow: lightSource.spotlight.castShadow,
    target: renderer.getRenderTarget() }
  const light = new DirectionalLight(0xffffff, 0)
  light.position.set(...settings.position)
  light.target.position.set(0, groundY, 0)
  light.castShadow = true
  light.shadow.mapSize.set(settings.mapSize, settings.mapSize)
  Object.assign(light.shadow.camera, { left: -settings.extent, right: settings.extent,
    top: settings.extent, bottom: -settings.extent, near: 0.1, far: 12 })
  Object.assign(light.shadow, { bias: settings.bias, normalBias: settings.normalBias,
    radius: settings.radius, blurSamples: settings.blurSamples })
  const material = new THREE.ShadowMaterial({ color: 0x242424, opacity: settings.opacity, depthWrite: false })
  const width = renderer.domElement.width, height = renderer.domElement.height
  const targets = Array.from({ length: 3 }, () => new THREE.WebGLRenderTarget(width, height))
  const blur = new THREE.ShaderMaterial({
    uniforms: { image: { value: targets[0].texture },
      stepSize: { value: new THREE.Vector2(height / settings.referenceHeight / width, 0) },
      sigma: { value: settings.blurSigma } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `uniform sampler2D image;uniform vec2 stepSize;uniform float sigma;varying vec2 vUv;
      void main(){float alpha=0.;float total=0.;
        for(int i=-24;i<=24;i++){float f=float(i);float w=exp(-f*f/(2.*sigma*sigma));
          alpha+=texture2D(image,vUv+stepSize*f).a*w;total+=w;}
        gl_FragColor=vec4(0.,0.,0.,alpha/total);}`,
    depthTest: false, depthWrite: false, toneMapped: false,
  })
  const screen = new THREE.Scene()
  const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blur)
  screen.add(quad)
  const composite = new THREE.MeshBasicMaterial({ map: targets[2].texture, transparent: true,
    depthTest: false, depthWrite: false, toneMapped: false })
  scene.add(light, light.target)
  try {
    lightSource.spotlight.castShadow = false
    receiver.material = material
    receiver.visible = false
    renderer.shadowMap.type = VSMShadowMap
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.needsUpdate = true
    renderer.setRenderTarget(targets[0])
    renderer.render(scene, camera)
    hideCasters()
    receiver.visible = true
    renderer.render(scene, camera)
    renderer.setRenderTarget(targets[1])
    renderer.render(screen, screenCamera)
    blur.uniforms.image.value = targets[1].texture
    blur.uniforms.stepSize.value.set(0, 1 / settings.referenceHeight)
    renderer.setRenderTarget(targets[2])
    renderer.render(screen, screenCamera)
    quad.material = composite
    renderer.setRenderTarget(null)
    renderer.render(screen, screenCamera)
  } finally {
    scene.remove(light, light.target)
    renderer.shadowMap.type = previous.type
    renderer.shadowMap.autoUpdate = previous.autoUpdate
    renderer.shadowMap.needsUpdate = true
    lightSource.spotlight.castShadow = previous.castShadow
    receiver.material = previous.material
    receiver.visible = previous.visible
    renderer.setRenderTarget(previous.target)
    light.dispose()
    material.dispose()
    blur.dispose()
    composite.dispose()
    quad.geometry.dispose()
    for (const target of targets) target.dispose()
  }
}

export function createProductLight(THREE, renderer, scene, groundY, settings = productLightSettings, shadow = productRenderSettings.shadows.cast) {
  const spotlight = new THREE.SpotLight(0xffffff, settings.intensity, 0, Math.PI / 3, 0.7, 2)
  spotlight.position.set(...settings.position)
  spotlight.target.position.set(...settings.target)
  spotlight.castShadow = true
  spotlight.shadow.mapSize.set(shadow.mapSize, shadow.mapSize)
  spotlight.shadow.camera.near = 0.1
  spotlight.shadow.camera.far = 30
  spotlight.shadow.bias = shadow.bias
  spotlight.shadow.normalBias = shadow.normalBias
  scene.add(spotlight, spotlight.target)
  renderer.shadowMap.enabled = true
  // PCSS читает исходную глубину, без предварительного размытия VSM.
  renderer.shadowMap.type = THREE.BasicShadowMap
  renderer.shadowMap.autoUpdate = false

  const shadowCamera = { value: new THREE.Vector2(spotlight.shadow.camera.near, spotlight.shadow.camera.far) }
  const emitterUV = { value: new THREE.Vector2(settings.width * shadow.softness, settings.height * shadow.softness).multiplyScalar(1 / (4 * Math.tan(spotlight.angle))) }
  function patchShadow(shader) {
    shader.uniforms.productShadowCamera = shadowCamera
    shader.uniforms.productEmitterUV = emitterUV
    const chunk = THREE.ShaderChunk.shadowmap_pars_fragment.replace(/#else[^\n]*\n(\s*float getShadow\( sampler2D shadowMap,)/, `
    #elif defined( SHADOWMAP_TYPE_BASIC )
      float productLinearDepth(float depth) {
        #ifdef USE_REVERSED_DEPTH_BUFFER
          depth = 1.0 - depth;
        #endif
        return productShadowCamera.x * productShadowCamera.y /
          (productShadowCamera.y - depth * (productShadowCamera.y - productShadowCamera.x));
      }
      vec2 productShadowDisk(int index, int count) {
        float angle = float(index) * 2.39996323;
        return vec2(cos(angle), sin(angle)) * sqrt((float(index) + 0.5) / float(count));
      }
      float getShadow(sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord) {
        vec3 coord = shadowCoord.xyz / shadowCoord.w;
        // Поправка глубины по наклону поверхности исключает ложные тени
        // при выборке соседних текселей на самой банке.
        vec3 dx = dFdx(coord), dy = dFdy(coord);
        float determinant = dx.x * dy.y - dx.y * dy.x;
        vec2 slope = abs(determinant) > 1e-10
          ? vec2(dy.y * dx.z - dx.y * dy.z, dx.x * dy.z - dy.x * dx.z) / determinant
          : vec2(0.0);
        #ifdef USE_REVERSED_DEPTH_BUFFER
          coord.z -= shadowBias;
        #else
          coord.z += shadowBias;
        #endif
        if(any(lessThan(coord, vec3(0.0))) || any(greaterThan(coord, vec3(1.0)))) return 1.0;
        float receiverDepth = productLinearDepth(coord.z);
        vec2 searchRadius = productEmitterUV / receiverDepth;
        float blockerSum = 0.0, blockers = 0.0;
        for(int i = 0; i < 16; i++) {
          vec2 offset = productShadowDisk(i, 16) * searchRadius;
          vec2 uv = coord.xy + offset;
          if(any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) continue;
          float depth = productLinearDepth(texture2D(shadowMap, uv).r);
          float surfaceDepth = productLinearDepth(clamp(coord.z + dot(slope, offset), 0.0, 1.0));
          if(depth < surfaceDepth - 0.002) { blockerSum += depth; blockers += 1.0; }
        }
        // Проверяем центр отдельно, чтобы не потерять узкую контактную тень.
        float centerDepth = productLinearDepth(texture2D(shadowMap, coord.xy).r);
        if(centerDepth < receiverDepth - 0.002) { blockerSum += centerDepth; blockers += 1.0; }
        if(blockers == 0.0) return 1.0;
        float blockerDepth = blockerSum / blockers;
        vec2 radius = max(vec2(0.75) / shadowMapSize,
          productEmitterUV * max(receiverDepth - blockerDepth, 0.0) / (blockerDepth * receiverDepth));
        float visibility = 0.0;
        for(int i = 0; i < 48; i++) {
          vec2 offset = productShadowDisk(i, 48) * radius;
          vec2 uv = coord.xy + offset;
          if(any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) { visibility += 1.0; continue; }
          float depth = productLinearDepth(texture2D(shadowMap, uv).r);
          float surfaceDepth = productLinearDepth(clamp(coord.z + dot(slope, offset), 0.0, 1.0));
          visibility += step(surfaceDepth - 0.002, depth);
        }
        return mix(1.0, visibility / 48.0, shadowIntensity);
      }
    #else
    $1`)
    shader.fragmentShader = 'uniform vec2 productShadowCamera;uniform vec2 productEmitterUV;\n' + shader.fragmentShader
      .replace('#include <shadowmap_pars_fragment>', chunk)
  }

  const clip = { value: new THREE.Vector4(0, 0, 1, 1) }
  const material = new THREE.ShadowMaterial({ opacity: shadow.opacity, depthWrite: false })
  material.onBeforeCompile = shader => {
    patchShadow(shader)
    shader.uniforms.counterClip = clip
    shader.vertexShader = 'varying vec2 counterUV;\n' + shader.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\ncounterUV=gl_Position.xy/gl_Position.w*0.5+0.5;')
    shader.fragmentShader = 'varying vec2 counterUV;uniform vec4 counterClip;\n' + shader.fragmentShader.replace('void main() {',
      'void main() {\nif(any(lessThan(counterUV,counterClip.xy))||any(greaterThan(counterUV,counterClip.zw)))discard;')
  }
  material.customProgramCacheKey = () => 'product-counter-shadow-pcss-v1'
  const receiver = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), material)
  receiver.rotation.x = -Math.PI / 2
  receiver.position.y = groundY - 0.001
  receiver.receiveShadow = true
  scene.add(receiver)

  return {
    spotlight,
    receiver,
    patchShadow,
    setCounterClip(counter, viewport) {
      clip.value.set((counter.left - viewport.left) / viewport.width,
        1 - (counter.bottom - viewport.top) / viewport.height,
        (counter.right - viewport.left) / viewport.width,
        1 - (counter.top - viewport.top) / viewport.height)
    },
    setShadowView() {
      spotlight.position.set(...shadow.position)
      spotlight.target.position.set(...shadow.target)
      spotlight.updateMatrixWorld(true); spotlight.target.updateMatrixWorld(true)
      renderer.shadowMap.needsUpdate = true
    },
    invalidate() { renderer.shadowMap.needsUpdate = true },
    panelFrame(worldToLocal) {
      const position = spotlight.getWorldPosition(new THREE.Vector3())
      const target = spotlight.target.getWorldPosition(new THREE.Vector3())
      const orientation = new THREE.Object3D()
      orientation.position.copy(position)
      orientation.lookAt(target)
      orientation.updateMatrixWorld(true)
      const matrix = worldToLocal.clone().multiply(orientation.matrixWorld)
      const right = new THREE.Vector3().setFromMatrixColumn(matrix, 0)
      const up = new THREE.Vector3().setFromMatrixColumn(matrix, 1)
      return {
        position: position.applyMatrix4(worldToLocal),
        normal: new THREE.Vector3().setFromMatrixColumn(matrix, 2).normalize(),
        right: right.clone().normalize(), up: up.clone().normalize(),
        halfSize: new THREE.Vector2(settings.width * right.length() / 2, settings.height * up.length() / 2),
        radiance: settings.radiance,
      }
    },
    dispose() {
      scene.remove(receiver, spotlight, spotlight.target)
      receiver.geometry.dispose(); material.dispose(); spotlight.dispose()
    },
  }
}
