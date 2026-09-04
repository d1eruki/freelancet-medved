<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import logoUrl from '../assets/brand-logo.svg'
import { navigation } from '../data/navigation'

const isMenuOpen = ref(false)
const isHeaderVisible = ref(true)

let lastScrollPosition = 0
let scrollFrame = 0

function updateHeaderVisibility() {
  const currentScrollPosition = Math.max(window.scrollY, 0)

  if (isMenuOpen.value || currentScrollPosition <= 16) {
    isHeaderVisible.value = true
  } else if (Math.abs(currentScrollPosition - lastScrollPosition) >= 8) {
    isHeaderVisible.value = currentScrollPosition < lastScrollPosition
  }

  if (Math.abs(currentScrollPosition - lastScrollPosition) >= 8 || currentScrollPosition <= 16) {
    lastScrollPosition = currentScrollPosition
  }

  scrollFrame = 0
}

function handleScroll() {
  if (!scrollFrame) {
    scrollFrame = window.requestAnimationFrame(updateHeaderVisibility)
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  isHeaderVisible.value = true
}

function closeMenu() {
  isMenuOpen.value = false
}

onMounted(() => {
  lastScrollPosition = Math.max(window.scrollY, 0)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)

  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame)
  }
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 bg-brand text-surface transition-transform duration-300 ease-out"
    :class="isHeaderVisible ? 'translate-y-0' : '-translate-y-full'"
    :inert="!isHeaderVisible || undefined"
  >
    <div class="site-container flex h-16 items-center justify-between border-b border-surface/40 sm:h-20">
      <a class="inline-flex shrink-0" href="/" aria-label="МЁДВЕДЬ — на главную">
        <img
          class="h-12 w-24 object-contain brightness-0 invert sm:h-14 sm:w-32"
          :src="logoUrl"
          alt="МЁДВЕДЬ"
        >
      </a>

      <nav
        id="main-navigation"
        class="absolute inset-x-4 top-20 rounded-2xl bg-surface p-5 text-foreground shadow-xl nav:static nav:ml-auto nav:block nav:bg-transparent nav:p-0 nav:text-surface nav:shadow-none"
        :class="isMenuOpen ? 'block' : 'hidden'"
        aria-label="Основная навигация"
      >
        <ul class="flex flex-col gap-1 nav:flex-row nav:items-center nav:gap-6 wide:gap-10">
          <li v-for="item in navigation" :key="item.href">
            <a
              class="secondary-action block py-3 text-label font-extrabold tracking-wide uppercase"
              :href="item.href"
              @click="closeMenu"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="flex shrink-0 items-center gap-4">
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
