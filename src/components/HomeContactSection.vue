<script setup>
import ContactForm from './ContactForm.vue'
</script>

<template>
  <section id="contact-form" class="scroll-mt-20 bg-surface py-20 text-foreground sm:py-24 wide:py-28" data-header-theme="dark" aria-labelledby="home-contact-title">
    <div class="site-container">
      <h2 id="home-contact-title" class="font-display text-h2 break-words hyphens-auto uppercase">Связаться с нами</h2>
      <div class="mt-10 grid gap-10 nav:grid-cols-12">
        <p class="max-w-md text-body-large font-medium text-subtle nav:col-span-4">Оставьте контакты и расскажите о вашем вопросе.</p>
        <ContactForm class="nav:col-span-8" id-prefix="home-contact" />
      </div>
    </div>
  </section>
</template>
