import { createEffect, createSignal } from "@emberkit/core";
import { API_URLS } from "../../constants/urls";
import { getTranslation } from "../../i18n/i18n";
import { EnvManager } from "../../lib/EnvManager";
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
  const [turnstileToken, setTurnstileToken] = createSignal("");
  const [isBotDetected, setIsBotDetected] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [successMsg, setSuccessMsg] = createSignal("");
  const [errorMsg, setErrorMsg] = createSignal("");
  const [turnstileLoaded, setTurnstileLoaded] = createSignal(false);

  const siteKey =
    EnvManager.PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  const waitForTurnstile = async (): Promise<boolean> => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds with 100ms intervals

    while (attempts < maxAttempts) {
      if (window.turnstile) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    return false;
  };

  // Render Turnstile widget when element is ready
  createEffect(() => {
    let mounted = true;

    (async () => {
      const el = document.getElementById("turnstile-widget");
      if (!el || !siteKey || !mounted) return;

      // Avoid re-rendering if already rendered
      if (el.hasAttribute("data-rendered")) {
        return;
      }

      try {
        // Wait for Turnstile to load
        const hasLoaded = await waitForTurnstile();
        if (!hasLoaded || !mounted) {
          console.warn("Turnstile script failed to load");
          setErrorMsg(getTranslation("contact.securityCheck"));
          return;
        }

        if (!window.turnstile) {
          console.error("Turnstile not available after waiting");
          setErrorMsg(getTranslation("contact.securityCheck"));
          return;
        }

        const widgetId = window.turnstile.render(el, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => {
            if (mounted) setTurnstileToken(token);
          },
          "expired-callback": () => {
            if (mounted) setTurnstileToken("");
          },
          "error-callback": () => {
            if (mounted) setTurnstileToken("");
          },
        });

        if (widgetId && mounted) {
          el.setAttribute("data-widget-id", widgetId);
          el.setAttribute("data-rendered", "true");
        }
      } catch (e) {
        if (mounted) {
          console.error("Turnstile render error:", e);
          setErrorMsg(getTranslation("contact.securityCheck"));
        }
      }
    })();

    return () => {
      mounted = false;
      const el = document.getElementById("turnstile-widget");
      const widgetId = el?.getAttribute("data-widget-id");
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
          el?.removeAttribute("data-rendered");
          el?.removeAttribute("data-widget-id");
        } catch (e) {
          console.warn("Error removing Turnstile widget:", e);
        }
      }
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
        const el = document.getElementById("turnstile-widget");
        const wid = el?.getAttribute("data-widget-id");
        if (wid && window.turnstile) window.turnstile.reset(wid);
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
        type="submit"
        disabled={(!turnstileToken() && !isBotDetected()) || isSubmitting()}
        className="w-full md:w-auto px-10 py-4 bg-linear-to-r from-ember-500 to-ember-700 hover:from-ember-400 hover:to-ember-500 text-white font-bold rounded-xl transition-all duration-400 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,91,13,0.3)] hover:shadow-[0_0_35px_rgba(255,91,13,0.5)] mt-4 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
      >
        {!isSubmitting() ? (
          <>
            <span
              data-i18n="contact.submitButton"
              className="tracking-widest uppercase text-sm"
            >
              Ignite Conversation
            </span>
            <IconSend className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </>
        ) : (
          <>
            <span
              data-i18n="contact.sending"
              className="tracking-widest uppercase text-sm"
            >
              Sending...
            </span>
            <IconLoader className="animate-spin h-5 w-5 text-white" />
          </>
        )}
      </button>
      {successMsg() ? (
        <div
          data-i18n="contact.successMessage"
          className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center font-medium shadow-lg animate-fade-in"
        >
          {successMsg()}
        </div>
      ) : null}
      {errorMsg() ? (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center font-medium shadow-lg animate-fade-in">
          {errorMsg()}
        </div>
      ) : null}
    </form>
  );
}

export default ContactForm;
