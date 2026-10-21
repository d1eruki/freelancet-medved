<!-- Единая загрузка обычных, фоновых и SVG-изображений. -->
<script setup>
import { computed, mergeProps, ref, useAttrs } from 'vue'
import { useImageLoading } from '../composables/use-image-loading.js'

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
const image = ref(null)
defineExpose({ element: image })
const { shouldLoad } = useImageLoading(image, {
  critical: () => props.critical,
  media: () => props.media,
  enabled: () => props.enabled,
})
const placeholder = computed(() => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${Number(attrs.width) || 1}' height='${Number(attrs.height) || 1}'/%3E`)
const bindings = computed(() => {
  const source = shouldLoad.value ? props.src : undefined
  if (props.as === 'image') return { href: source, 'data-src': props.src }
  if (props.as === 'div') return {
    style: { backgroundImage: shouldLoad.value ? props.background || (source ? `url(${JSON.stringify(source)})` : undefined) : undefined },
    'data-src': props.src,
  }
  return {
    src: source,
    srcset: shouldLoad.value ? props.srcset : undefined,
    sizes: props.sizes,
    loading: props.critical ? 'eager' : undefined,
    decoding: attrs.decoding || 'async',
    'data-src': props.src,
    'data-srcset': props.srcset,
  }
})

function elementAttributes(pictureSource = false) {
  return mergeProps(attrs, bindings.value, pictureSource ? { src: placeholder.value, srcset: undefined } : {})
}
</script>

<template>
  <picture v-if="picture" :class="pictureClass" :style="pictureStyle">
    <source
      v-if="media"
      :media="media"
      :srcset="enabled && (critical || shouldLoad) ? srcset || src : undefined"
      :sizes="sizes"
    >
    <img
      ref="image"
      v-bind="elementAttributes(Boolean(media))"
    >
  </picture>
  <component v-else :is="as" ref="image" v-bind="elementAttributes()" />
</template>
