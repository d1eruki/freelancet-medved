<!-- Шапка сайта с логотипом, навигацией и мобильным меню. -->
<script setup>
import SiteImage from './site-image.vue'
import { sitePath } from '../utils/site-path'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BrandLogo from './BrandLogo.vue'
import { navigation } from '../data/navigation'
import headerRibbon from '../assets/ui/header-ribbon.png?responsive&optimize'
import mobileMenuPaper from '../assets/ui/mobile-menu-paper.png?optimize'

const props = defineProps({
  lenis: { type: Object, default: null },
  path: { type: String, default: '/' },
})

const isMenuOpen = ref(false)
const hasMenuOpened = ref(false)
const isHeaderVisible = ref(true)
const navigationGroups = [navigation.slice(0, 2), navigation.slice(2)]

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
  hasMenuOpened.value = true
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
    class="site-header pointer-events-none fixed inset-x-0 top-0 z-50 w-full pt-6 pb-16 text-surface transition-transform duration-300 ease-out"
    :class="isHeaderVisible ? 'translate-y-0' : '-translate-y-full'"
    :inert="!isHeaderVisible || undefined"
  >
    <div class="pointer-events-none absolute inset-0 z-10 overflow-hidden wide:hidden" aria-hidden="true">
      <SiteImage
        picture critical media="(width < 80rem)"
        :src="headerRibbon.src" :srcset="headerRibbon.srcset" sizes="200vw"
        class="header-ribbon absolute top-14 left-0 h-112 w-[200%] max-w-none -translate-y-1/2 sm:top-16"
        width="2172" height="756" fetchpriority="high" alt=""
      />
    </div>

    <div class="site-container pointer-events-auto relative flex h-16 items-center sm:h-20 wide:grid wide:grid-cols-7 wide:grid-rows-[minmax(0,1fr)]">
      <a class="absolute left-1/2 z-20 inline-flex -translate-x-1/2 wide:static wide:col-start-4 wide:row-start-1 wide:justify-self-center wide:translate-x-0" :href="sitePath('/')" aria-label="МЁДВЕДЬ — на главную">
        <BrandLogo class="max-h-28 sm:max-h-35 wide:max-h-none" />
      </a>

      <nav
        id="main-navigation"
        class="mobile-navigation absolute inset-x-4 top-12 z-0 rounded-2xl rounded-tl-[4rem] bg-surface px-5 pt-12 pb-5 text-foreground shadow-xl transition-colors duration-300 ease-out sm:top-16 sm:pt-16 wide:relative wide:inset-auto wide:col-span-7 wide:col-start-1 wide:row-start-1 wide:grid wide:w-full wide:max-w-6xl wide:grid-cols-7 wide:items-center wide:justify-self-center wide:rounded-tl-2xl wide:bg-transparent wide:p-0 wide:shadow-none"
        :class="{ 'mobile-navigation--open': isMenuOpen }"
        aria-label="Основная навигация"
      >
        <SiteImage as="div" class="mobile-menu-surface pointer-events-none absolute inset-0 rounded-[inherit] wide:hidden" :src="mobileMenuPaper" :enabled="hasMenuOpened" media="(width < 80rem)" aria-hidden="true" />

        <SiteImage
          picture critical media="(width >= 80rem)"
          :src="headerRibbon.src" :srcset="headerRibbon.srcset"
          sizes="min(calc(120vw - 58px), 1383px)"
          class="header-ribbon pointer-events-none absolute top-1/2 left-1/2 hidden h-auto w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 wide:block"
          width="2172" height="756" fetchpriority="high" alt="" aria-hidden="true"
        />

        <ul
          v-for="(group, groupIndex) in navigationGroups"
          :key="groupIndex"
          class="relative flex flex-col gap-1 wide:col-span-3 wide:flex-row wide:items-center wide:gap-6"
          :class="groupIndex === 0 ? 'wide:col-start-1 wide:justify-end wide:pr-6' : 'wide:col-start-5 wide:justify-start wide:pl-6'"
        >
          <li v-for="item in group" :key="item.href">
            <a
              class="nav-link block py-3 font-display text-xl font-normal tracking-wide uppercase wide:text-label wide:whitespace-nowrap"
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

      <div class="relative z-20 ml-auto flex shrink-0 items-center gap-4 text-foreground wide:hidden">
        <button
          class="menu-button grid size-12 place-items-center rounded-full"
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
@media (width < 80rem) {
  .mobile-navigation {
    visibility: hidden;
    pointer-events: none;
    transform: translateY(calc(-100% - 6rem));
    transition:
      transform 300ms ease-out,
      visibility 0s 300ms;
  }

  .mobile-navigation--open {
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .mobile-navigation {
      transition: none;
    }
  }
}

.mobile-menu-surface {
  background-position: center;
  background-size: 24rem auto;
  background-repeat: repeat;
}

:deep(.header-ribbon) {
  filter: drop-shadow(0 8px 12px rgb(0 0 0 / 35%));
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

.nav-link:hover,
.nav-link:focus-visible,
.nav-link--current {
  color: #7f1d1d;
  font-weight: 700;
  -webkit-text-stroke: 0.5px currentColor;
}
</style>
