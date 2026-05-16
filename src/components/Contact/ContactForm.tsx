import { createEffect, createSignal } from "@emberkit/core";
import { API_URLS } from "../../constants/urls.ts";
import { getTranslation } from "../../i18n/i18n.ts";
import { EnvManager } from "../../lib/EnvManager.ts";
import { IconLoader, IconSend } from "@emberkit/icons";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

export function ContactForm() {
  const [hp, setHp] = createSignal("");
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [subject, setSubject] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [errors, setErrors] = createSignal({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const turnstileSig = createSignal("");
  const turnstileToken = turnstileSig[0];
  const setTurnstileToken = turnstileSig[1];

  const botSig = createSignal(false);
  const setIsBotDetected = botSig[1];

  const submittingSig = createSignal(false);
  const setIsSubmitting = submittingSig[1];

  const successSig = createSignal("");
  const setSuccessMsg = successSig[1];

  const errorSig = createSignal("");
  const setErrorMsg = errorSig[1];

  /** Visible dummy site key pairs with dummy secret `1x0000000000000000000000000000000AA` for local testing (Cloudflare docs). */
  const siteKey =
    EnvManager.PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  const waitForElement = (selector: string, timeout = 8000): Promise<HTMLElement | null> => {
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
  };

  const waitForTurnstile = async (): Promise<boolean> => {
    let attempts = 0;
    const maxAttempts = 100; // ~10s with 100ms intervals (explicit render + defer)

    while (attempts < maxAttempts) {
      if (window.turnstile) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    return false;
  };

  const initializeTurnstile = async () => {
    const el = await waitForElement("#turnstile-widget");
    if (!el || !siteKey) return;

    if (el.getAttribute("data-rendered") === "true") return;
    if (el.getAttribute("data-turnstile-loading") === "1") return;

    el.setAttribute("data-turnstile-loading", "1");
    try {
      const hasLoaded = await waitForTurnstile();
      if (!hasLoaded) {
        console.warn("Turnstile script failed to load");
        setErrorMsg(getTranslation("contact.securityCheck"));
        return;
      }

      if (!window.turnstile) {
        console.error("Turnstile not available after waiting");
        setErrorMsg(getTranslation("contact.securityCheck"));
        return;
      }

      if (el.getAttribute("data-rendered") === "true") return;

      const widgetId = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => {
          setTurnstileToken(token);
        },
        "expired-callback": () => {
          setTurnstileToken("");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setErrorMsg(getTranslation("contact.securityCheck"));
        },
      });

      if (widgetId) {
        el.setAttribute("data-widget-id", widgetId);
        el.setAttribute("data-rendered", "true");
      }
    } catch (e) {
      console.error("Turnstile render error:", e);
      setErrorMsg(getTranslation("contact.securityCheck"));
    } finally {
      el.removeAttribute("data-turnstile-loading");
    }
  };

  createEffect(() => {
    queueMicrotask(() => void initializeTurnstile());
  });

  /**
   * EmberKit `createEffect` runs once on mount (it does not re-run when signals change).
   * Use `.subscribe()` like AdminProfile so Turnstile/async updates refresh the DOM.
   */
  /**
   * Do not combine Tailwind `hidden` with `inline-flex` on the same node (`display`
   * conflicts). Use an outer wrapper for visibility and an inner wrapper for layout.
   */
  const syncSubmitUi = () => {
    const token = String(turnstileSig.peek() ?? "").trim();
    const submitting = submittingSig.peek();
    const bot = botSig.peek();

    const awaitingTurnstile = !submitting && token.length === 0 && !bot;
    const showReadyCta = !submitting && token.length > 0;
    const showSending = submitting;

    const btn = document.getElementById(
      "contact-submit-btn",
    ) as HTMLButtonElement | null;
    if (btn) {
      const locked = (token.length === 0 && !bot) || submitting;
      btn.disabled = locked;
      btn.setAttribute(
        "aria-busy",
        submitting || awaitingTurnstile ? "true" : "false",
      );
    }

    document
      .getElementById("contact-submit-ts-loading")
      ?.classList.toggle("hidden", !awaitingTurnstile);
    document
      .getElementById("contact-submit-ready-wrap")
      ?.classList.toggle("hidden", !showReadyCta);
    document
      .getElementById("contact-submit-sending-wrap")
      ?.classList.toggle("hidden", !showSending);
  };

  createEffect(() => {
    const u1 = turnstileSig.subscribe(syncSubmitUi);
    const u2 = submittingSig.subscribe(syncSubmitUi);
    const u3 = botSig.subscribe(syncSubmitUi);
    queueMicrotask(syncSubmitUi);
    return () => {
      u1();
      u2();
      u3();
    };
  });

  const syncFeedbackBanners = () => {
    const ok = successSig.peek();
    const err = errorSig.peek();

    const okEl = document.getElementById("contact-success-banner");
    const errEl = document.getElementById("contact-error-banner");
    if (okEl) {
      okEl.textContent = ok;
      okEl.classList.toggle("hidden", !ok);
    }
    if (errEl) {
      errEl.textContent = err;
      errEl.classList.toggle("hidden", !err);
    }
  };

  createEffect(() => {
    const u1 = successSig.subscribe(syncFeedbackBanners);
    const u2 = errorSig.subscribe(syncFeedbackBanners);
    queueMicrotask(syncFeedbackBanners);
    return () => {
      u1();
      u2();
    };
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const runValidation = () => {
    const e = {
      name: !name().trim(),
      email: !email().trim(),
      subject: !subject().trim(),
      message: !message().trim(),
    };
    setErrors(e);
    if (email().trim() && !emailPattern.test(email())) {
      setErrorMsg(getTranslation("contact.invalidEmail"));
      setErrors({ ...e, email: true });
      return false;
    }
    return !e.name && !e.email && !e.subject && !e.message;
  };

  const onSubmit = async (ev: Event) => {
    ev.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (hp() !== "") {
      setIsBotDetected(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setHp("");
      return;
    }

    if (!runValidation()) return;

    if (!turnstileToken()) {
      setErrorMsg(getTranslation("contact.securityCheck"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_URLS.CONTACT_FORM_SUBMISSION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name(),
          email: email(),
          subject: subject(),
          message: message(),
          token: turnstileToken(),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (response.ok) {
        setSuccessMsg(getTranslation("contact.successMessage"));
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        const widgetId = document
          .getElementById("turnstile-widget")
          ?.getAttribute("data-widget-id");
        if (widgetId && window.turnstile?.reset) {
          try {
            window.turnstile.reset(widgetId);
          } catch (e) {
            console.warn("Error resetting Turnstile widget:", e);
          }
        }
        setTurnstileToken("");
      } else {
        setErrorMsg(result.error || getTranslation("contact.genericError"));
      }
    } catch {
      setErrorMsg(getTranslation("contact.genericError"));
    } finally {
      setIsSubmitting(false);
    }

    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 5000);
  };

  const err = errors();

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-6 w-full max-w-2xl mx-auto relative z-10"
    >
      <div
        className="sr-only opacity-0 absolute -left-[9999px] -top-[9999px]"
        aria-hidden="true"
      >
        <input
          type="text"
          name="address_ext"
          tabIndex={-1}
          autoComplete="off"
          value={hp()}
          onInput={(e) => setHp((e.target as HTMLInputElement).value)}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 group">
          <label
            htmlFor="name"
            data-i18n="contact.labelName"
            className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            value={name()}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            data-i18n="contact.placeholderName"
            data-i18n-attr="placeholder"
            placeholder="Jane Doe"
            className={`w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
              err.name
                ? "border-red-500 focus:ring-red-500/50"
                : "border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30"
            }`}
          />
          {err.name ? (
            <span
              data-i18n="contact.errorName"
              className="text-red-500 text-xs mt-2 block tracking-wide"
            >
              ● Name is required
            </span>
          ) : null}
        </div>
        <div className="flex-1 group">
          <label
            htmlFor="email"
            data-i18n="contact.labelEmail"
            className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email()}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            data-i18n="contact.placeholderEmail"
            data-i18n-attr="placeholder"
            placeholder="jane@example.com"
            className={`w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
              err.email
                ? "border-red-500 focus:ring-red-500/50"
                : "border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30"
            }`}
          />
          {err.email ? (
            <span
              data-i18n="contact.errorEmail"
              className="text-red-500 text-xs mt-2 block tracking-wide"
            >
              ● Email is required
            </span>
          ) : null}
        </div>
      </div>
      <div className="group">
        <label
          htmlFor="subject"
          data-i18n="contact.labelSubject"
          className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
        >
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          value={subject()}
          onInput={(e) => setSubject((e.target as HTMLInputElement).value)}
          data-i18n="contact.placeholderSubject"
          data-i18n-attr="placeholder"
          placeholder="Game Partnership Inquiry"
          className={`w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
            err.subject
              ? "border-red-500 focus:ring-red-500/50"
              : "border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30"
          }`}
        />
        {err.subject ? (
          <span
            data-i18n="contact.errorSubject"
            className="text-red-500 text-xs mt-2 block tracking-wide"
          >
            ● Subject is required
          </span>
        ) : null}
      </div>
      <div className="group">
        <label
          htmlFor="message"
          data-i18n="contact.labelMessage"
          className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-ember-400 transition-colors"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={message()}
          onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
          data-i18n="contact.placeholderMessage"
          data-i18n-attr="placeholder"
          placeholder="Tell us about your next big idea..."
          className={`w-full bg-ash-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
            err.message
              ? "border-red-500 focus:ring-red-500/50"
              : "border-white/10 focus:border-ember-400 focus:ring-ember-400/30 hover:border-white/30"
          }`}
        />
        {err.message ? (
          <span
            data-i18n="contact.errorMessage"
            className="text-red-500 text-xs mt-2 block tracking-wide"
          >
            ● Message is required
          </span>
        ) : null}
      </div>
      <div className="mt-6 flex justify-center">
        <div id="turnstile-widget" className="min-h-[65px]" />
      </div>
      <button
        id="contact-submit-btn"
        type="submit"
        disabled
        aria-busy="false"
        className="w-full md:w-auto px-10 py-4 bg-linear-to-r from-ember-500 to-ember-700 hover:from-ember-400 hover:to-ember-500 text-white font-bold rounded-xl transition-all duration-400 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,91,13,0.3)] hover:shadow-[0_0_35px_rgba(255,91,13,0.5)] mt-4 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
      >
        <span id="contact-submit-ts-loading">
          <span className="inline-flex items-center justify-center" aria-hidden="true">
            <IconLoader className="animate-spin h-5 w-5 text-white" />
          </span>
        </span>
        <span id="contact-submit-ready-wrap" className="hidden">
          <span className="inline-flex items-center justify-center gap-3">
            <span
              id="contact-submit-ready"
              data-i18n="contact.submitButton"
              className="tracking-widest uppercase text-sm"
            >
              Ignite Conversation
            </span>
            <IconSend className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </span>
        </span>
        <span id="contact-submit-sending-wrap" className="hidden">
          <span className="inline-flex items-center justify-center gap-3">
            <span
              id="contact-submit-sending"
              data-i18n="contact.sending"
              className="tracking-widest uppercase text-sm"
            >
              Sending...
            </span>
            <IconLoader className="animate-spin h-5 w-5 text-white" />
          </span>
        </span>
      </button>
      <div
        id="contact-success-banner"
        role="status"
        data-i18n="contact.successMessage"
        className="hidden mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center font-medium shadow-lg animate-fade-in"
      />
      <div
        id="contact-error-banner"
        role="alert"
        className="hidden mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center font-medium shadow-lg animate-fade-in"
      />
    </form>
  );
}

export default ContactForm;
