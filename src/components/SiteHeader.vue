<script setup>
import { ref } from 'vue'
import logoUrl from '../../materials/customer-design/brand-logo.svg'
import { navigation } from '../data/navigation'

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 bg-brand/95 text-surface shadow-lg backdrop-blur">
    <div class="site-container flex h-20 items-center justify-between border-b border-surface/40 sm:h-24 nav:h-28">
      <a class="inline-flex shrink-0" href="/" aria-label="МЁДВЕДЬ — на главную">
        <img
          class="h-14 w-28 object-contain brightness-0 invert sm:h-16 sm:w-36"
          :src="logoUrl"
          alt="МЁДВЕДЬ"
        >
      </a>

      <nav
        id="main-navigation"
        class="absolute inset-x-4 top-24 rounded-2xl bg-surface p-5 text-foreground shadow-xl nav:static nav:block nav:bg-transparent nav:p-0 nav:text-surface nav:shadow-none"
        :class="isMenuOpen ? 'block' : 'hidden'"
        aria-label="Основная навигация"
      >
        <ul class="flex flex-col gap-1 nav:flex-row nav:items-center nav:gap-6 wide:gap-10">
          <li v-for="item in navigation" :key="item.href">
            <a
              class="nav-link block py-3 text-sm font-bold tracking-wide uppercase nav:text-xs"
              :href="item.href"
              @click="closeMenu"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="flex shrink-0 items-center gap-4">
        <span
          class="hidden size-12 place-items-center rounded-full border border-surface/60 font-display text-xs nav:grid"
          aria-label="Только для лиц старше 18 лет"
        >
          18+
        </span>

        <button
          class="menu-button grid size-12 place-items-center rounded-full border border-surface/60 nav:hidden"
          type="button"
          aria-controls="main-navigation"
          :aria-expanded="isMenuOpen"
          :aria-label="isMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
          @click="toggleMenu"
        >
          <span class="sr-only">{{ isMenuOpen ? 'Закрыть меню' : 'Открыть меню' }}</span>
          <span class="menu-icon" :class="{ 'menu-icon--open': isMenuOpen }" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-link {
  position: relative;
}

.nav-link::after {
  position: absolute;
  right: 0;
  bottom: 6px;
  left: 0;
  height: 2px;
  content: '';
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 180ms ease;
}

.nav-link:hover::after,
.nav-link:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

.menu-icon,
.menu-icon::before,
.menu-icon::after {
  display: block;
  width: 18px;
  height: 2px;
  content: '';
  background: currentColor;
  transition: transform 180ms ease, opacity 180ms ease;
}

.menu-icon::before {
  transform: translateY(-6px);
}

.menu-icon::after {
  transform: translateY(4px);
}

.menu-icon--open {
  background: transparent;
}

.menu-icon--open::before {
  transform: translateY(0) rotate(45deg);
}

.menu-icon--open::after {
  transform: translateY(-2px) rotate(-45deg);
}
</style>
