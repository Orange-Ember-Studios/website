<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { LogIn, Menu, User, X } from 'lucide-vue-next';
import PremiumLanguageSelector from '../LanguageSelector/PremiumLanguageSelector.vue';
import { getTranslation, type SupportedLanguage } from '@/i18n/i18n.ts';

const props = defineProps<{
  lang?: SupportedLanguage;
}>();

function useLangFromPath(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  if (seg === 'en' || seg === 'es' || seg === 'fr') return seg as SupportedLanguage;
  return 'en';
}

const lang = computed(() => props.lang || useLangFromPath());
const menuOpen = ref(false);
const scrolled = ref(false);
const langPath = computed(() => '/' + lang.value + '/');
const contactPath = computed(() => langPath.value + '#contact');

function handleScroll() {
  scrolled.value = window.scrollY > 50;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

function handleLinkClick(e: MouseEvent) {
  const link = (e.currentTarget as HTMLAnchorElement);
  const href = link.getAttribute('href') || '';

  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  const isHome =
    currentPath === `/${lang.value}/` ||
    currentPath === `/${lang.value}` ||
    currentPath === '/';

  if (href.includes('#') && isHome) {
    const anchor = href.split('#')[1];
    const targetEl = document.getElementById(anchor);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${anchor}`);
      if (menuOpen.value) toggleMenu();
    }
  }
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  const btn = document.getElementById('mobile-menu-btn');
  btn?.setAttribute('aria-expanded', menuOpen.value ? 'true' : 'false');
  if (menuOpen.value) {
    mobileMenu?.classList.remove('translate-x-full');
    mobileMenu?.classList.add('translate-x-0');
    menuIcon?.classList.add('hidden');
    closeIcon?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    mobileMenu?.classList.remove('translate-x-0');
    mobileMenu?.classList.add('translate-x-full');
    menuIcon?.classList.remove('hidden');
    closeIcon?.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

const navLinks = [
  { key: 'portfolio', href: `/${lang.value}/#portfolio`, i18n: 'nav.portfolio' },
  { key: 'services', href: `/${lang.value}/#services`, i18n: 'nav.services' },
  { key: 'about', href: `/${lang.value}/#about`, i18n: 'nav.about' },
  { key: 'blog', href: `/${lang.value}/blog`, i18n: 'nav.blog' },
];
</script>

<template>
  <nav
    id="main-nav"
    class="fixed top-0 left-0 w-full z-50 transition-all duration-500 py-6"
    :class="scrolled ? 'bg-ash-950/50 backdrop-blur-xl py-4' : 'py-6'"
  >
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <a
        :href="langPath"
        class="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ash-950 rounded-lg"
      >
        <div class="w-10 h-10 relative">
          <img
            src="/Shield.svg"
            alt="Orange Ember Shield"
            class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,91,13,0.5)] group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span class="text-white font-bold text-xl tracking-tight hidden sm:block">
          Orange <span class="text-ember-400">Ember</span>
        </span>
      </a>

      <div class="hidden md:flex items-center gap-8">
        <a
          v-for="link in navLinks"
          :key="link.key"
          :href="link.href"
          :data-i18n="link.i18n"
          class="text-sm font-medium text-gray-300 hover:text-ember-400 transition-colors uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 rounded"
          @click="handleLinkClick"
        >
          {{ getTranslation(link.i18n, lang) }}
        </a>
        <a
          :href="contactPath"
          class="px-6 py-2 border border-ember-500/30 rounded-full text-sm font-semibold text-white bg-void-500/20 hover:bg-ember-500 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,91,13,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
          @click="handleLinkClick"
        >
          {{ getTranslation('nav.workWithUs', lang) }}
        </a>
        <a
          href="https://buymeacoffee.com/seobryn"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
          title="Support us on Buy Me a Coffee"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21h18v-2H2v2zm2-4h14V9H4v8zm2-6h10v2H6V11zm2-4h6v2H8V7z" />
          </svg>
          {{ getTranslation('nav.donate', lang) }}
        </a>
        <PremiumLanguageSelector :lang="lang" id="desktop-lang-selector" />
        <a
          href="/admin"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-ember-400 hover:border-ember-500/50 transition-all duration-300 group/nav-login focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
          title="Admin"
        >
          <LogIn class="h-5 w-5 group-hover/nav-login:scale-110 transition-transform" />
        </a>
      </div>

      <button
        id="mobile-menu-btn"
        type="button"
        aria-controls="mobile-menu"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        class="md:hidden text-white hover:text-ember-400 transition-colors z-50 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 rounded"
        @click="toggleMenu"
      >
        <span id="menu-icon" class="block">
          <Menu class="w-8 h-8 transition-transform duration-300" />
        </span>
        <span id="close-icon" class="hidden absolute top-0 left-0">
          <X class="w-8 h-8 transition-transform duration-300" />
        </span>
      </button>
    </div>
  </nav>

  <div
    id="mobile-menu"
    class="fixed inset-0 bg-ash-950/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center translate-x-full transition-transform duration-500 ease-in-out md:hidden text-center"
  >
    <div class="flex flex-col items-center gap-8">
      <a
        v-for="link in navLinks"
        :key="link.key"
        :href="link.href"
        :data-i18n="link.i18n"
        class="mobile-link text-2xl font-bold text-white hover:text-ember-400 transition-colors uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 rounded"
        @click="handleLinkClick"
      >
        {{ getTranslation(link.i18n, lang) }}
      </a>
      <a
        :href="contactPath"
        class="mobile-link px-8 py-3 mt-4 border border-ember-500/30 rounded-full text-lg font-bold text-white bg-void-500/20 hover:bg-ember-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
        @click="handleLinkClick"
      >
        {{ getTranslation('nav.workWithUs', lang) }}
      </a>
      <a
        href="https://buymeacoffee.com/seobryn"
        target="_blank"
        rel="noopener noreferrer"
        class="mobile-link flex items-center gap-2 px-6 py-3 mt-4 rounded-full text-base font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
        @click="menuOpen && toggleMenu()"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 21h18v-2H2v2zm2-4h14V9H4v8zm2-6h10v2H6V11zm2-4h6v2H8V7z" />
        </svg>
        {{ getTranslation('nav.donate', lang) }}
      </a>
      <div class="mt-4 flex flex-col items-center gap-6">
        <PremiumLanguageSelector :lang="lang" id="mobile-lang-selector" />
        <a
          href="/admin"
          class="mobile-link flex items-center gap-3 text-lg font-medium text-gray-400 hover:text-ember-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 rounded"
          @click="menuOpen && toggleMenu()"
        >
          <User class="h-6 w-6" />
          Admin
        </a>
      </div>
    </div>
  </div>
</template>
