<template>
  <form
    @submit.prevent="submitForm"
    class="flex flex-col gap-6 w-full max-w-2xl mx-auto relative z-10"
  >
    <!-- Deceptive Honeypot (Off-screen) -->
    <div class="sr-only opacity-0 absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
      <input
        type="text"
        name="address_ext"
        v-model="address_ext"
        tabindex="-1"
        autocomplete="off"
      />
    </div>
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1 group">
        <label
          for="name"
          data-i18n="contact.labelName"
          class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
          >Name</label
        >
        <input
          id="name"
          name="name"
          v-model="form.name"
          data-i18n="contact.placeholderName"
          data-i18n-attr="placeholder"
          :class="[
            'w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300',
            errors.name
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30',
          ]"
          placeholder="Jane Doe"
        />
        <span
          v-if="errors.name"
          data-i18n="contact.errorName"
          class="text-red-500 text-xs mt-2 block tracking-wide"
          >● Name is required</span
        >
      </div>

      <div class="flex-1 group">
        <label
          for="email"
          data-i18n="contact.labelEmail"
          class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
          >Email</label
        >
        <input
          id="email"
          name="email"
          type="email"
          v-model="form.email"
          data-i18n="contact.placeholderEmail"
          data-i18n-attr="placeholder"
          :class="[
            'w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300',
            errors.email
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30',
          ]"
          placeholder="jane@example.com"
        />
        <span
          v-if="errors.email"
          data-i18n="contact.errorEmail"
          class="text-red-500 text-xs mt-2 block tracking-wide"
          >● Email is required</span
        >
      </div>
    </div>

    <div class="group">
      <label
        for="subject"
        data-i18n="contact.labelSubject"
        class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
        >Subject</label
      >
      <input
        id="subject"
        name="subject"
        v-model="form.subject"
        data-i18n="contact.placeholderSubject"
        data-i18n-attr="placeholder"
        :class="[
          'w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300',
          errors.subject
            ? 'border-red-500 focus:ring-red-500/50'
            : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30',
        ]"
        placeholder="Game Partnership Inquiry"
      />
      <span
        v-if="errors.subject"
        data-i18n="contact.errorSubject"
        class="text-red-500 text-xs mt-2 block tracking-wide"
        >● Subject is required</span
      >
    </div>

    <div class="group">
      <label
        for="message"
        data-i18n="contact.labelMessage"
        class="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
        >Message</label
      >
      <textarea
        id="message"
        name="message"
        rows="5"
        v-model="form.message"
        data-i18n="contact.placeholderMessage"
        data-i18n-attr="placeholder"
        :class="[
          'w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300 resize-none',
          errors.message
            ? 'border-red-500 focus:ring-red-500/50'
            : 'border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30',
        ]"
        placeholder="Tell us about your next big idea..."
      ></textarea>
      <span
        v-if="errors.message"
        data-i18n="contact.errorMessage"
        class="text-red-500 text-xs mt-2 block tracking-wide"
        >● Message is required</span
      >
    </div>

    <!-- Cloudflare Turnstile Widget -->
    <div class="mt-6 flex justify-center">
      <div 
        ref="turnstileContainer"
        class="min-h-[65px]"
      ></div>
    </div>

    <button
      type="submit"
      :disabled="!turnstileToken && !isBotDetected || isSubmitting"
      class="w-full md:w-auto px-10 py-4 bg-linear-to-r from-ember-500 to-ember-700 hover:from-ember-400 hover:to-ember-500 text-white font-bold rounded-xl transition-all duration-400 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,91,13,0.3)] hover:shadow-[0_0_35px_rgba(255,91,13,0.5)] mt-4 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <span v-if="!isSubmitting" data-i18n="contact.submitButton" class="tracking-widest uppercase text-sm">Ignite Conversation</span>
      <span v-else class="tracking-widest uppercase text-sm">Sending...</span>
      <svg
        v-if="!isSubmitting"
        class="w-5 h-5 transition-transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        ></path>
      </svg>
      <svg
          v-else
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
      >
          <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
          ></circle>
          <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
      </svg>
    </button>

    <div
      v-if="successMsg"
      data-i18n="contact.successMessage"
      class="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center font-medium shadow-lg animate-fade-in"
    >
      {{ successMsg }}
    </div>

    <div
      v-if="errorMsg"
      class="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center font-medium shadow-lg animate-fade-in"
    >
      {{ errorMsg }}
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { API_URLS } from "../../constants/urls";

const address_ext = ref("");
const turnstileToken = ref("");
const isBotDetected = ref(false);
const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
const turnstileContainer = ref(null);
const turnstileWidgetId = ref(null);


onMounted(() => {
  const initTurnstile = () => {
    if (window.turnstile && turnstileContainer.value) {
      try {
        turnstileWidgetId.value = window.turnstile.render(turnstileContainer.value, {
          sitekey: turnstileSiteKey,
          theme: "dark",
          callback: (token) => {
            turnstileToken.value = token;
          },
          "expired-callback": () => {
            turnstileToken.value = "";
          },
          "error-callback": () => {
            turnstileToken.value = "";
          },
        });
      } catch (e) {
        console.error("Turnstile render error:", e);
      }
    } else {
      // Retry if script not loaded yet
      setTimeout(initTurnstile, 250);
    }
  };

  initTurnstile();
});

onBeforeUnmount(() => {
  if (turnstileWidgetId.value && window.turnstile) {
    window.turnstile.remove(turnstileWidgetId.value);
  }
});

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const errors = reactive({
  name: false,
  email: false,
  subject: false,
  message: false,
});

const isSubmitting = ref(false);
const successMsg = ref("");
const errorMsg = ref(""); // New error message

const validate = () => {
  let isValid = true;
  // Basic empty fields
  for (const key in form) {
    if (!form[key].trim()) {
      errors[key] = true;
      isValid = false;
    } else {
      errors[key] = false;
    }
  }

  // Email format validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email && !emailPattern.test(form.email)) {
    errors.email = true;
    errorMsg.value = "Invalid email address";
    isValid = false;
  }

  return isValid;
};

const submitForm = async () => {
  errorMsg.value = "";
  successMsg.value = "";

  // Deceptive HoneyPot verification
  if (address_ext.value !== "") {
    console.warn("Bot detected via Honeypot trap.");
    isBotDetected.value = true;
    // Silent clear
    Object.keys(form).forEach((k) => (form[k] = ""));
    address_ext.value = "";
    return;
  }

  // Run validation
  if (!validate()) {
    return;
  }

  // Ensure Turnstile is verified
  if (!turnstileToken.value) {
    console.warn("Turnstile verification missing.");
    errorMsg.value = "Please complete the security check.";
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch(API_URLS.CONTACT_FORM_SUBMISSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        token: turnstileToken.value,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      successMsg.value = "Your spark has been sent! We'll be in touch soon.";
      // Reset form
      Object.keys(form).forEach((k) => (form[k] = ""));
      // Reset turnstile
      if (window.turnstile && turnstileWidgetId.value) {
        window.turnstile.reset(turnstileWidgetId.value);
        turnstileToken.value = "";
      }
    } else {
      errorMsg.value = result.error || "Something went wrong. Please try again later.";
    }
  } catch (error) {
    console.error("Submission error:", error);
    errorMsg.value = "Something went wrong. Please try again later.";
  } finally {
    isSubmitting.value = false;
  }

  setTimeout(() => {
    successMsg.value = "";
    errorMsg.value = "";
  }, 5000);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
