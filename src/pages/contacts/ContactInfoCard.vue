<script setup>
defineProps({
  label: { type: String, required: true },
  title: { type: String, required: true },
  hours: { type: String, required: true },
  phone: { type: String, required: true },
  phoneHref: { type: String, required: true },
  additionalContact: { type: Object, default: null },
  email: { type: String, required: true },
  emailHref: { type: String, required: true },
  tone: { type: String, default: 'surface' },
})
</script>

<template>
  <article
    class="flex min-h-96 flex-col rounded-3xl p-6 sm:p-10"
    :class="tone === 'brand' ? 'bg-brand text-surface' : 'bg-surface'"
  >
    <p class="text-label font-extrabold tracking-widest uppercase" :class="{ 'text-brand': tone === 'surface' }">{{ label }}</p>
    <h3 class="mt-6 font-display text-h4 uppercase">{{ title }}</h3>
    <div class="mt-auto pt-10">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] items-end gap-6">
        <div>
          <p v-if="additionalContact" class="text-body font-medium">Офис</p>
          <p class="text-body font-medium" :class="[tone === 'brand' ? 'text-surface/85' : 'text-subtle', { 'mt-3': additionalContact }]">{{ hours }}</p>
          <a
            class="secondary-action mt-4 inline-flex py-2 text-body-large font-bold focus-visible:outline-4 focus-visible:outline-offset-4"
            :class="tone === 'brand' ? 'focus-visible:outline-surface' : 'text-brand focus-visible:outline-brand'"
            :href="phoneHref"
          >{{ phone }}</a>
        </div>
        <div v-if="additionalContact">
          <p class="text-body font-medium">{{ additionalContact.name }}</p>
          <p class="mt-3 text-body font-medium" :class="tone === 'brand' ? 'text-surface/85' : 'text-subtle'">{{ hours }}</p>
          <a
            class="secondary-action mt-4 inline-flex py-2 text-body-large font-bold focus-visible:outline-4 focus-visible:outline-offset-4"
            :class="tone === 'brand' ? 'focus-visible:outline-surface' : 'text-brand focus-visible:outline-brand'"
            :href="additionalContact.phoneHref"
          >{{ additionalContact.phone }}</a>
        </div>
      </div>
      <a
        class="secondary-action mt-2 inline-flex py-2 text-body-large font-bold focus-visible:outline-4 focus-visible:outline-offset-4"
        :class="tone === 'brand' ? 'focus-visible:outline-surface' : 'text-brand focus-visible:outline-brand'"
        :href="emailHref"
      >{{ email }}</a>
    </div>
  </article>
</template>
