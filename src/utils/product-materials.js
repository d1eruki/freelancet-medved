export function createProductPostprocess(THREE, FXAAShader, samples) {
  const finalTarget = new THREE.WebGLRenderTarget(1, 1, { samples, depthBuffer: true })
  const fxaaUniforms = THREE.UniformsUtils.clone(FXAAShader.uniforms)
  fxaaUniforms.tDiffuse.value = finalTarget.texture
  const fxaa = new THREE.ShaderMaterial({ uniforms: fxaaUniforms,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: FXAAShader.fragmentShader, toneMapped: false, depthWrite: false, depthTest: false,
  })
  return { finalTarget, fxaaUniforms, fxaa }
}

export function prepareProductMaterials(THREE, model, environmentTexture, lightSource, bankDisplay) {
  const labelMaterials = new Map()
  const toneChunk = THREE.ShaderChunk.tonemapping_pars_fragment
  const bankTone = toneChunk.slice(toneChunk.indexOf('vec3 RRTAndODTFit'), toneChunk.indexOf('const mat3 LINEAR_REC2020_TO_LINEAR_SRGB')).replaceAll('toneMappingExposure', 'labExposure')
  const bankExposure = { value: 1 }
  model.traverse(node => {
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!material) continue
      if (material.name.endsWith('-printed-label')) {
        labelMaterials.set(material, material.map)
        material.envMap = environmentTexture
        material.envMapIntensity = 0.25
      }
      material.toneMapped = false
      material.onBeforeCompile = shader => {
        lightSource.patchShadow(shader)
        shader.uniforms.labDisplayPass = bankDisplay
        shader.uniforms.labExposure = bankExposure
        shader.fragmentShader = 'uniform bool labDisplayPass;uniform float labExposure;\n#define saturate(a) clamp(a,0.0,1.0)\n' + bankTone + '\n' + shader.fragmentShader
          .replace('#include <tonemapping_fragment>', 'if(labDisplayPass){vec3 c=ACESFilmicToneMapping(gl_FragColor.rgb);gl_FragColor.rgb=mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1./2.4))-0.055,step(vec3(0.0031308),c));}')
      }
      material.customProgramCacheKey = () => 'lab-shared-bank-pcss-v1'
      material.needsUpdate = true
    }
  })
  return labelMaterials
}
