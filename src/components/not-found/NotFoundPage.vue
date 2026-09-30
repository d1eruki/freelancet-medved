<script setup>
import { sitePath } from '../../utils/site-path'
</script>

<template>
  <section
    class="h-svh bg-foreground text-surface"
    data-header-theme="light"
    aria-labelledby="not-found-title"
  >
    <div class="site-container flex h-full flex-col items-center justify-center text-center">
      <h1 id="not-found-title" class="font-display text-404 uppercase">404</h1>
      <p class="mt-6 max-w-xl text-body-large font-medium text-surface/80">Страница не найдена.</p>
      <a
        class="mt-10 inline-flex min-h-14 w-fit items-center justify-center rounded-full bg-surface px-7 text-label font-extrabold tracking-wide text-foreground uppercase transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-surface"
        :href="sitePath('/')"
      >
        На главную
      </a>
    </div>
  </section>
</template>
