<script setup>
import { computed } from 'vue'
import CircleArrow from './CircleArrow.vue'

const props = defineProps({
  partner: { type: Object, required: true },
})

const routeUrl = computed(() => {
  const destination = `Россия, г. ${props.partner.city}, ${props.partner.address}`
  return `https://yandex.ru/maps/?mode=routes&rtext=~${encodeURIComponent(destination)}&rtt=auto`
})
</script>

<template>
  <li>
    <article class="flex h-full min-h-80 flex-col rounded-3xl bg-surface p-6 sm:p-8 wide:min-h-88">
      <p class="text-caption font-extrabold tracking-widest text-brand uppercase">{{ partner.city }}</p>
      <h5 class="mt-6 font-display text-h5 uppercase">{{ partner.name }}</h5>

      <div class="mt-auto pt-10">
        <address class="text-body font-medium text-subtle not-italic">{{ partner.address }}</address>

        <a v-if="partner.phone" class="secondary-action mt-6 inline-flex py-2 text-body font-extrabold text-brand" :href="partner.phoneHref">
          {{ partner.phone }}
        </a>

        <ul v-if="partner.metro" class="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          <li
            v-for="station in partner.metro"
            :key="station.name"
            class="flex items-center gap-2 text-label font-semibold text-subtle"
            :aria-label="`${station.name}, ${station.line}`"
          >
            <span class="size-2 rounded-full" :style="{ backgroundColor: station.color }" aria-hidden="true" />
            <span aria-hidden="true">{{ station.name }}</span>
          </li>
        </ul>

        <a
          class="group mt-10 flex items-center justify-between gap-5 border-t border-foreground/15 pt-6 text-label font-extrabold tracking-wide uppercase focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand"
          :href="routeUrl"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`Построить маршрут до ${partner.name}`"
        >
          <span class="secondary-action py-3">Построить маршрут</span>
          <CircleArrow hover="brand" />
        </a>
      </div>
    </article>
  </li>
</template>
