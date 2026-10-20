<script setup>
import HomeHeroSection from './HomeHeroSection.vue'
import HomeProductsSection from './HomeProductsSection.vue'
import HomeAboutSection from './HomeAboutSection.vue'
import HeroDivider from '../../components/HeroDivider.vue'
import homeDivider from '../../assets/heroes/home/divider.png?responsive'
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
  <HomeProductsSection />
  <HomeAboutSection />
</template>

<style scoped>
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

