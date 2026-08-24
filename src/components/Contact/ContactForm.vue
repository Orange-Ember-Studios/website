<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Loader2, Send } from 'lucide-vue-next';
import { API_URLS } from '../../constants/urls.ts';
import { getTranslation } from '@/i18n/i18n.ts';
import { EnvManager } from '../../lib/EnvManager.ts';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

const hp = ref('');
const name = ref('');
const email = ref('');
const subject = ref('');
const message = ref('');
const errors = ref({
  name: false,
  email: false,
  subject: false,
  message: false,
});
const turnstileToken = ref('');
const isBotDetected = ref(false);
const isSubmitting = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const siteKey = EnvManager.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showAwaitingTurnstile = computed(() => !isSubmitting.value && turnstileToken.value.length === 0 && !isBotDetected.value);
const showReadyCta = computed(() => !isSubmitting.value && turnstileToken.value.length > 0);
const showSending = computed(() => isSubmitting.value);

onMounted(async () => {
  await initializeTurnstile();
  syncSubmitUi();
});

async function waitForElement(selector: string, timeout = 8000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element as HTMLElement);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el as HTMLElement);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      console.warn(`Element "${selector}" not found after ${timeout}ms`);
      resolve(null);
    }, timeout);
  });
}

async function waitForTurnstile(): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    if (window.turnstile) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  return false;
}

async function initializeTurnstile() {
  const el = await waitForElement('#turnstile-widget');
  if (!el || !siteKey) return;

  if (el.getAttribute('data-rendered') === 'true') return;
  if (el.getAttribute('data-turnstile-loading') === '1') return;

  el.setAttribute('data-turnstile-loading', '1');
  try {
    const hasLoaded = await waitForTurnstile();
    if (!hasLoaded) {
      errorMsg.value = getTranslation('contact.securityCheck');
      return;
    }

    if (!window.turnstile) {
      errorMsg.value = getTranslation('contact.securityCheck');
      return;
    }

    if (el.getAttribute('data-rendered') === 'true') return;

    const widgetId = window.turnstile.render(el, {
      sitekey: siteKey,
      theme: 'dark',
      callback: (token: string) => {
        turnstileToken.value = token;
      },
      'expired-callback': () => {
        turnstileToken.value = '';
      },
      'error-callback': () => {
        turnstileToken.value = '';
        errorMsg.value = getTranslation('contact.securityCheck');
      },
    });

    if (widgetId) {
      el.setAttribute('data-widget-id', widgetId);
      el.setAttribute('data-rendered', 'true');
    }
  } catch (e) {
    console.error('Turnstile render error:', e);
    errorMsg.value = getTranslation('contact.securityCheck');
  } finally {
    el.removeAttribute('data-turnstile-loading');
  }
}

function syncSubmitUi() {
  const btn = document.getElementById('contact-submit-btn') as HTMLButtonElement | null;
  if (btn) {
    const locked = (turnstileToken.value.length === 0 && !isBotDetected.value) || isSubmitting.value;
    btn.disabled = locked;
    btn.setAttribute('aria-busy', isSubmitting.value || showAwaitingTurnstile.value ? 'true' : 'false');
  }

  document.getElementById('contact-submit-ts-loading')?.classList.toggle('hidden', !showAwaitingTurnstile.value);
  document.getElementById('contact-submit-ready-wrap')?.classList.toggle('hidden', !showReadyCta.value);
  document.getElementById('contact-submit-sending-wrap')?.classList.toggle('hidden', !showSending.value);
}

function syncFeedbackBanners() {
  const okEl = document.getElementById('contact-success-banner');
  const errEl = document.getElementById('contact-error-banner');
  if (okEl) {
    okEl.textContent = successMsg.value;
    okEl.classList.toggle('hidden', !successMsg.value);
  }
  if (errEl) {
    errEl.textContent = errorMsg.value;
    errEl.classList.toggle('hidden', !errorMsg.value);
  }
}

function runValidation() {
  const e = {
    name: !name.value.trim(),
    email: !email.value.trim(),
    subject: !subject.value.trim(),
    message: !message.value.trim(),
  };
  errors.value = e;
  if (email.value.trim() && !emailPattern.test(email.value)) {
    errorMsg.value = getTranslation('contact.invalidEmail');
    errors.value = { ...e, email: true };
    return false;
  }
  return !e.name && !e.email && !e.subject && !e.message;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  errorMsg.value = '';
  successMsg.value = '';

  if (hp.value !== '') {
    isBotDetected.value = true;
    name.value = '';
    email.value = '';
    subject.value = '';
    message.value = '';
    hp.value = '';
    return;
  }

  if (!runValidation()) return;

  if (!turnstileToken.value) {
    errorMsg.value = getTranslation('contact.securityCheck');
    return;
  }

  isSubmitting.value = true;
  syncSubmitUi();

  try {
    const response = await fetch(API_URLS.CONTACT_FORM_SUBMISSION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        subject: subject.value,
        message: message.value,
        token: turnstileToken.value,
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (response.ok) {
      successMsg.value = getTranslation('contact.successMessage');
      name.value = '';
      email.value = '';
      subject.value = '';
      message.value = '';
      const widgetId = document
        .getElementById('turnstile-widget')
        ?.getAttribute('data-widget-id');
      if (widgetId && window.turnstile?.reset) {
        try {
          window.turnstile.reset(widgetId);
        } catch (err) {
          console.warn('Error resetting Turnstile widget:', err);
        }
      }
      turnstileToken.value = '';
    } else {
      errorMsg.value = result.error || getTranslation('contact.genericError');
    }
  } catch {
    errorMsg.value = getTranslation('contact.genericError');
  } finally {
    isSubmitting.value = false;
    syncSubmitUi();
    syncFeedbackBanners();
  }

  setTimeout(() => {
    successMsg.value = '';
    errorMsg.value = '';
    syncFeedbackBanners();
  }, 5000);
}

function handleInput(field: 'name' | 'email' | 'subject' | 'message' | 'hp', value: string) {
  switch (field) {
    case 'name': name.value = value; break;
    case 'email': email.value = value; break;
    case 'subject': subject.value = value; break;
    case 'message': message.value = value; break;
    case 'hp': hp.value = value; break;
  }
}
</script>

<template>
  <form
    @submit="handleSubmit"
    class="flex flex-col gap-6 w-full max-w-2xl mx-auto relative z-10"
  >
    <div
      class="sr-only opacity-0 absolute -left-[9999px] -top-[9999px]"
      aria-hidden="true"
    >
      <input
        type="text"
        name="address_ext"
        tabindex="-1"
        autocomplete="off"
        :value="hp"
        @input="(e) => handleInput('hp', (e.target as HTMLInputElement).value)"
      />
    </div>
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1 group">
        <label
          for="name"
          data-i18n="contact.labelName"
          class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          :value="name"
          @input="(e) => handleInput('name', (e.target as HTMLInputElement).value)"
          data-i18n="contact.placeholderName"
          data-i18n-attr="placeholder"
          placeholder="Jane Doe"
          class="w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300"
          :class="errors.name ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30'"
        />
        <span
          v-if="errors.name"
          data-i18n="contact.errorName"
          class="text-red-500 text-xs mt-2 block tracking-wide"
        >
          ● Name is required
        </span>
      </div>
      <div class="flex-1 group">
        <label
          for="email"
          data-i18n="contact.labelEmail"
          class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          :value="email"
          @input="(e) => handleInput('email', (e.target as HTMLInputElement).value)"
          data-i18n="contact.placeholderEmail"
          data-i18n-attr="placeholder"
          placeholder="jane@example.com"
          class="w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300"
          :class="errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30'"
        />
        <span
          v-if="errors.email"
          data-i18n="contact.errorEmail"
          class="text-red-500 text-xs mt-2 block tracking-wide"
        >
          ● Email is required
        </span>
      </div>
    </div>
    <div class="group">
      <label
        for="subject"
        data-i18n="contact.labelSubject"
        class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
      >
        Subject
      </label>
      <input
        id="subject"
        name="subject"
        :value="subject"
        @input="(e) => handleInput('subject', (e.target as HTMLInputElement).value)"
        data-i18n="contact.placeholderSubject"
        data-i18n-attr="placeholder"
        placeholder="Game Partnership Inquiry"
        class="w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300"
        :class="errors.subject ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30'"
      />
      <span
        v-if="errors.subject"
        data-i18n="contact.errorSubject"
        class="text-red-500 text-xs mt-2 block tracking-wide"
      >
        ● Subject is required
      </span>
    </div>
    <div class="group">
      <label
        for="message"
        data-i18n="contact.labelMessage"
        class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
      >
        Message
      </label>
      <textarea
        id="message"
        name="message"
        rows="5"
        :value="message"
        @input="(e) => handleInput('message', (e.target as HTMLTextAreaElement).value)"
        data-i18n="contact.placeholderMessage"
        data-i18n-attr="placeholder"
        placeholder="Tell us about your next big idea..."
        class="w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300 resize-none"
        :class="errors.message ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30'"
      />
      <span
        v-if="errors.message"
        data-i18n="contact.errorMessage"
        class="text-red-500 text-xs mt-2 block tracking-wide"
      >
        ● Message is required
      </span>
    </div>
    <div class="mt-6 flex justify-center">
      <div id="turnstile-widget" class="min-h-[65px]" />
    </div>
    <button
      id="contact-submit-btn"
      type="submit"
      :disabled="!showReadyCta"
      aria-busy="false"
      class="w-full md:w-auto px-10 py-4 bg-linear-to-r from-ember-500 to-ember-700 hover:from-ember-400 hover:to-ember-500 text-white font-bold rounded-xl transition-all duration-400 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,91,13,0.3)] hover:shadow-[0_0_35px_rgba(255,91,13,0.5)] mt-4 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
    >
      <span id="contact-submit-ts-loading">
        <span class="inline-flex items-center justify-center" aria-hidden="true">
          <Loader2 class="animate-spin h-5 w-5 text-white" />
        </span>
      </span>
      <span id="contact-submit-ready-wrap" class="hidden">
        <span class="inline-flex items-center justify-center gap-3">
          <span
            id="contact-submit-ready"
            data-i18n="contact.submitButton"
            class="tracking-widest uppercase text-sm"
          >
            Ignite Conversation
          </span>
          <Send class="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </span>
      </span>
      <span id="contact-submit-sending-wrap" class="hidden">
        <span class="inline-flex items-center justify-center gap-3">
          <span
            id="contact-submit-sending"
            data-i18n="contact.sending"
            class="tracking-widest uppercase text-sm"
          >
            Sending...
          </span>
          <Loader2 class="animate-spin h-5 w-5 text-white" />
        </span>
      </span>
    </button>
    <div
      id="contact-success-banner"
      role="status"
      data-i18n="contact.successMessage"
      class="hidden mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center font-medium shadow-lg animate-fade-in"
    />
    <div
      id="contact-error-banner"
      role="alert"
      class="hidden mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center font-medium shadow-lg animate-fade-in"
    />
  </form>
</template>
