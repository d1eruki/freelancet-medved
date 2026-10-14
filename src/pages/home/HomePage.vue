<script setup>
import HomeHeroSection from './HomeHeroSection.vue'
import HomeProductsSection from './HomeProductsSection.vue'
import HomeAboutSection from './HomeAboutSection.vue'
import ContactSection from '../../components/ContactSection.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import homeDivider from '../../assets/heroes/home/divider.png?responsive'
</script>

<template>
  <div class="relative isolate z-10 @container">
    <HomeHeroSection />
    <!-- The grass baseline is at 69.1% of the image height, below its transparent top. -->
    <HeroDivider
      class="[&>img]:-translate-y-[69.1%] [&>img]:object-[center_69.1%] wide:[&>img]:h-auto"
      :image-url="homeDivider.src"
      :image-srcset="homeDivider.srcset"
      image-sizes="max(100vw, 412px)"
      fetchpriority="high"
    />
    <div
      class="home-hero-shading pointer-events-none absolute inset-x-0 top-0 z-11"
      :style="{ '--home-grass-mask': `url(${homeDivider.src})` }"
      aria-hidden="true"
    >
      <span class="home-hero-overlay absolute inset-0" />
      <span class="home-hero-corner-overlay absolute inset-0" />
    </div>
  </div>
  <HomeProductsSection />
  <HomeAboutSection />
  <ContactSection
    source="home-contact"
    id="contact-form"
    class="scroll-mt-20"
    title="Связаться с нами"
    description="Оставьте контакты и расскажите о вашем вопросе."
    heading-id="home-contact-title"
    id-prefix="home-contact"
  />
</template>

<style scoped>
.home-hero-shading {
  /* The 2172 × 724 grass image uses cover inside a 16rem-high divider. */
  --home-grass-height: max(16rem, calc(100cqw / 3));
  --home-grass-tail: calc(var(--home-grass-height) * 0.309);
  bottom: calc(-1 * var(--home-grass-tail));
  mask-image: linear-gradient(#000, #000), var(--home-grass-mask);
  mask-size: 100% calc(100% - var(--home-grass-tail)), max(100%, 48rem) auto;
  mask-position: center top, center bottom;
  mask-repeat: no-repeat;
}

.home-hero-overlay {
  background: radial-gradient(ellipse 56% 80% at 50% 24%, rgb(16 16 16 / 28%) 0%, rgb(16 16 16 / 12%) 48%, transparent 100%);
}

.home-hero-corner-overlay {
  background:
    radial-gradient(ellipse 55% 55% at 0% 90%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 28%) 48%, transparent 100%),
    radial-gradient(ellipse 55% 55% at 100% 90%, rgb(16 16 16 / 56%) 0%, rgb(16 16 16 / 28%) 48%, transparent 100%);
}

@media (min-width: 40rem) {
  .home-hero-overlay {
    background: radial-gradient(ellipse 56% 80% at 50% 48%, rgb(16 16 16 / 28%) 0%, rgb(16 16 16 / 12%) 48%, transparent 100%);
  }
}
</style>
