<script setup>
import HomeHeroSection from './HomeHeroSection.vue'
import HomeProductsSection from './HomeProductsSection.vue'
import HomeAboutSection from './HomeAboutSection.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import homeDivider from '../../assets/heroes/home/divider.png?responsive'
import restingPaw from '../../assets/heroes/home/resting-paw.png?responsive'
import { siteVariant } from '../../data/site-variants.js'
</script>

<template>
  <HomeHeroSection />
  <div class="pointer-events-none relative z-10 hidden h-0 sm:block" aria-hidden="true">
    <div class="home-products-awning absolute inset-x-0 -top-px flex">
      <div
        v-for="part in ['left', 'center', 'right']"
        :key="part"
        class="home-products-awning-part relative overflow-hidden"
        :class="`home-products-awning-${part}`"
      >
        <img
          class="absolute top-0 h-full max-w-none"
          :src="homeDivider.src"
          :srcset="homeDivider.srcset"
          sizes="100vw"
          alt=""
          decoding="async"
        >
      </div>
    </div>
  </div>
  <HeroDivider
    class="home-products-divider sm:hidden"
    natural-height
    :image-url="homeDivider.src"
    :image-srcset="homeDivider.srcset"
    image-sizes="(max-width: 639px) max(130vw, 412px), 100vw"
    fetchpriority="high"
  />
  <div v-if="siteVariant.homeRestingPaw" class="home-resting-paw pointer-events-none relative z-10 h-0" aria-hidden="true">
    <img
      class="home-resting-paw-image absolute"
      :src="restingPaw.src"
      :srcset="restingPaw.srcset"
      sizes="(min-width: 80rem) min(25.35vw, 35.646svh), (min-width: 40rem) min(40.56vw, 57.031svh), 50.7vw"
      alt=""
      decoding="async"
    >
  </div>
  <HomeProductsSection />
  <HomeAboutSection />
</template>

<style scoped>
.home-resting-paw-image {
  /* Только пальцы выглядывают из-за верхнего края козырька. */
  top: -1px;
  left: 74%;
  width: 50.7vw;
  transform: translate(-50%, -45%);
}

@media (min-width: 40rem) {
  .home-resting-paw-image {
    left: calc(50% + min(20vw, 28.12svh));
    width: min(40.56vw, 57.031svh);
  }
}

@media (min-width: 80rem) {
  .home-resting-paw-image {
    width: min(25.35vw, 35.646svh);
  }
}

.home-products-divider :deep(.hero-divider-image) {
  top: -1px;
  right: auto;
  left: 50%;
  transform: translate(-50%, -11.2%) scaleX(1.12);
}

.home-products-awning {
  --awning-height: min(calc(100vw / 3), 50svh);
  height: var(--awning-height);
  transform: translateY(-11.2%);
}

/* Границы центра совпадают со швами нижней полосы на x=465 и x=1712. */
.home-products-awning-center {
  --awning-source-start: 465;
  --awning-source-width: 1247;
  flex: 0 0 calc(var(--awning-height) * 1247 / 724);
}

/* Боковые полосы продолжаются от швов к краям, скрывая торцы исходника. */
.home-products-awning-left,
.home-products-awning-right {
  flex: 1 1 0;
  min-width: 0;
}

.home-products-awning-left {
  --awning-source-start: 109;
  --awning-source-width: 356;
}

.home-products-awning-right {
  --awning-source-start: 1712;
  --awning-source-width: 351;
}

.home-products-awning-part img {
  left: calc(-100% * var(--awning-source-start) / var(--awning-source-width));
  width: calc(100% * 2172 / var(--awning-source-width));
  object-fit: fill;
}

@media (width < 40rem) {
  .home-products-divider :deep(.hero-divider-image) {
    width: 150%;
    max-width: none;
  }
}
</style>

