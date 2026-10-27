<!-- Шапка сайта с логотипом, навигацией и мобильным меню. -->
<script setup>
import { sitePath } from '../utils/site-path'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BrandLogo from './BrandLogo.vue'
import { navigation } from '../data/navigation'

const props = defineProps({
  lenis: { type: Object, default: null },
  path: { type: String, default: '/' },
})

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
  if (!props.lenis && !scrollFrame) {
    scrollFrame = window.requestAnimationFrame(updateHeaderVisibility)
  }
}

watch(() => props.lenis, (lenis, _previous, onCleanup) => {
  if (!lenis) return

  const stopListening = lenis.on('scroll', (instance) => {
    if (instance.userData?.initiator === 'snap') {
      lastScrollPosition = Math.max(window.scrollY, 0)
      return
    }

    updateHeaderVisibility()
  })

  onCleanup(stopListening)
}, { immediate: true })

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  isHeaderVisible.value = true
}

function closeMenu() {
  isMenuOpen.value = false
}

function isCurrentPage(href) {
  const currentPath = props.path.replace(/\/+$/, '')
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const targetPath = new URL(href, 'https://medved.beer').pathname.slice(basePath.length).replace(/\/+$/, '')

  return currentPath === targetPath
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
    class="site-header fixed inset-x-0 top-0 z-50 w-full border-b border-surface/15 bg-foreground/75 text-surface backdrop-blur-lg transition-transform duration-300 ease-out"
    :class="isHeaderVisible ? 'translate-y-0' : '-translate-y-full'"
    :inert="!isHeaderVisible || undefined"
  >
    <div class="site-container flex h-16 items-center justify-between sm:h-20">
      <a class="inline-flex shrink-0" :href="sitePath('/')" aria-label="МЁДВЕДЬ — на главную">
        <BrandLogo />
      </a>

      <nav
        id="main-navigation"
        class="absolute inset-x-4 top-20 rounded-2xl bg-surface p-5 text-foreground shadow-xl transition-colors duration-300 ease-out nav:static nav:ml-auto nav:block nav:bg-transparent nav:text-surface nav:p-0 nav:shadow-none"
        :class="isMenuOpen ? 'block' : 'hidden'"
        aria-label="Основная навигация"
      >
        <ul class="flex flex-col gap-1 nav:flex-row nav:items-center nav:gap-6 wide:gap-10">
          <li v-for="item in navigation" :key="item.href">
            <a
              class="secondary-action block py-3 text-label font-extrabold tracking-wide uppercase"
              :class="{ 'nav-link--current': isCurrentPage(item.href) }"
              :href="item.href"
              :aria-current="isCurrentPage(item.href) ? 'page' : undefined"
              @click="closeMenu"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="flex shrink-0 items-center gap-4">
        <button
          class="menu-button grid size-12 place-items-center rounded-full border border-current/60 nav:hidden"
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

.nav-link--current::after {
  transform: scaleX(1);
}
</style>
