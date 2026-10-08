// Общие координаты светильника для прямого света, отражений и оптики стакана.
export const productLightSettings = Object.freeze({
  position: [-1.2, 3.8, 2],
  target: [0, -0.15, 0],
  width: 1.5,
  height: 2.5,
  radiance: 0,
  intensity: 48,
})

export function createLightPanel(THREE) {
  const settings = productLightSettings
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(settings.width, settings.height),
    new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(settings.radiance), side: THREE.DoubleSide }))
  panel.position.set(...settings.position)
  panel.lookAt(new THREE.Vector3(...settings.target))
  return panel
}

export function createProductLight(THREE, renderer, scene, groundY) {
  const settings = productLightSettings
  const spotlight = new THREE.SpotLight(0xffffff, settings.intensity, 0, Math.PI / 3, 0.7, 2)
  spotlight.position.set(...settings.position)
  spotlight.target.position.set(...settings.target)
  spotlight.castShadow = true
  spotlight.shadow.mapSize.set(1024, 1024)
  spotlight.shadow.camera.near = 0.1
  spotlight.shadow.camera.far = 30
  spotlight.shadow.bias = -0.0001
  spotlight.shadow.normalBias = 0.015
  scene.add(spotlight, spotlight.target)
  renderer.shadowMap.enabled = true
  // PCSS читает исходную глубину, без предварительного размытия VSM.
  renderer.shadowMap.type = THREE.BasicShadowMap
  renderer.shadowMap.autoUpdate = false

  const shadowCamera = { value: new THREE.Vector2(spotlight.shadow.camera.near, spotlight.shadow.camera.far) }
  const emitterUV = { value: new THREE.Vector2(settings.width, settings.height).multiplyScalar(1 / (4 * Math.tan(spotlight.angle))) }
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
  const material = new THREE.ShadowMaterial({ opacity: 0.25, depthWrite: false })
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
