<!-- Единая загрузка обычных, фоновых и SVG-изображений. -->
<script setup>
import { computed, getCurrentInstance, mergeProps, ref, useAttrs } from 'vue'
import { useImageLoading } from '../composables/use-image-loading.js'
import { getAvifSource, getAvifSrcset, getImageBackground } from '../utils/image-formats.js'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  src: { type: String, default: undefined },
  srcset: { type: String, default: undefined },
  sizes: { type: String, default: undefined },
  as: { type: String, default: 'img', validator: value => ['img', 'image', 'div'].includes(value) },
  critical: { type: Boolean, default: false },
  media: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  picture: { type: Boolean, default: false },
  pictureClass: { type: [String, Array, Object], default: 'contents' },
  pictureStyle: { type: Object, default: undefined },
  background: { type: String, default: undefined },
})
const attrs = useAttrs()
const instance = getCurrentInstance()
const image = ref(null)
defineExpose({ element: image })
const { shouldLoad } = useImageLoading(image, {
  critical: () => props.critical,
  media: () => props.media,
  enabled: () => props.enabled,
})
const placeholder = computed(() => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${Number(attrs.width) || 1}' height='${Number(attrs.height) || 1}'/%3E`)
const avifSource = computed(() => getAvifSource(props.src))
const avifSrcset = computed(() => getAvifSrcset(props.srcset) || avifSource.value)
const usesPicture = computed(() => props.picture || (props.as === 'img' && Boolean(avifSrcset.value)))
const sourceEnabled = computed(() => props.enabled && (props.critical || shouldLoad.value))
const bindings = computed(() => {
  const source = shouldLoad.value ? props.src : undefined
  if (props.as === 'image') return { href: source, 'data-src': props.src }
  if (props.as === 'div') return {
    style: { backgroundImage: shouldLoad.value ? [
      props.background || (source ? `url(${JSON.stringify(source)})` : undefined),
      getImageBackground(source, props.background),
    ] : undefined },
    'data-src': avifSource.value || props.src,
  }
  return {
    src: source,
    srcset: shouldLoad.value ? props.srcset : undefined,
    sizes: props.sizes,
    loading: props.critical ? 'eager' : undefined,
    decoding: attrs.decoding || 'async',
    'data-src': avifSource.value || props.src,
    'data-srcset': props.srcset,
  }
})

function elementAttributes(pictureSource = false) {
  // Новая обёртка не должна забирать scoped-стили, назначенные родителем изображению.
  const scopeAttributes = {}
  if (usesPicture.value && !props.picture) {
    let current = instance
    while (current) {
      for (const scope of [current.vnode.scopeId, ...(current.vnode.slotScopeIds || [])]) {
        if (scope) scopeAttributes[scope] = ''
      }
      const parent = current.parent
      current = parent?.subTree === current.vnode ? parent : undefined
    }
  }
  return mergeProps(attrs, scopeAttributes, bindings.value, pictureSource ? { src: placeholder.value, srcset: undefined } : {})
}
</script>

<template>
  <picture v-if="usesPicture" :class="pictureClass" :style="pictureStyle">
    <source
      v-if="avifSrcset"
      type="image/avif"
      :media="media || undefined"
      :srcset="sourceEnabled ? avifSrcset : undefined"
      :sizes="sizes"
    >
    <source
      v-if="media"
      :media="media"
      :srcset="sourceEnabled ? srcset || src : undefined"
      :sizes="sizes"
    >
    <img
      ref="image"
      v-bind="elementAttributes(Boolean(media))"
    >
  </picture>
  <component v-else :is="as" ref="image" v-bind="elementAttributes()" />
</template>
