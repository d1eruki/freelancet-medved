<script setup>
import BaseButton from '../../components/BaseButton.vue'
import { sitePath } from '../../utils/site-path'
</script>

<template>
  <section
    class="h-svh bg-foreground text-surface"
    aria-labelledby="not-found-title"
  >
    <div class="site-container flex h-full flex-col items-center justify-center text-center">
      <h1 id="not-found-title" class="font-display text-404 uppercase">404</h1>
      <p class="mt-6 max-w-xl text-body-large font-medium text-surface/80">Страница не найдена.</p>
      <BaseButton
        variant="surface"
        class="mt-10 w-fit focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface"
        :href="sitePath('/')"
      >
        На главную
      </BaseButton>
    </div>
  </section>
</template>
