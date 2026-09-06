<script setup>
const toneClasses = {
  brand: 'bg-brand text-surface',
  surface: 'bg-surface text-foreground',
}

const sizeClasses = {
  control: 'size-12',
  action: 'size-14',
}

const hoverClasses = {
  none: '',
  brand: 'group-hover:bg-brand group-hover:text-surface group-focus-visible:bg-brand group-focus-visible:text-surface',
  detail: 'group-hover:-rotate-45 group-hover:bg-foreground group-hover:text-surface group-focus-visible:-rotate-45 group-focus-visible:bg-foreground group-focus-visible:text-surface',
}

const arrows = {
  left: '←',
  right: '→',
}

const props = defineProps({
  direction: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value),
  },
  size: {
    type: String,
    default: 'control',
    validator: (value) => ['control', 'action'].includes(value),
  },
  tone: {
    type: String,
    default: 'brand',
    validator: (value) => ['brand', 'surface'].includes(value),
  },
  hover: {
    type: String,
    default: 'none',
    validator: (value) => ['none', 'brand', 'detail'].includes(value),
  },
})
</script>

<template>
  <span
    class="grid shrink-0 place-items-center rounded-full text-body-large transition duration-200"
    :class="[
      sizeClasses[props.size],
      toneClasses[props.tone],
      hoverClasses[props.hover],
    ]"
    aria-hidden="true"
  >
    {{ arrows[props.direction] }}
  </span>
</template>
