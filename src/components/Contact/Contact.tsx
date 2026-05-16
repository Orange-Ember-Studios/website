import { IconMail, IconX } from "@emberkit/icons";
import ContactForm from "../Contact/ContactForm.tsx";

export function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact Us"
      className="py-24 bg-[#0b0f19] border-t border-white/5 relative overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-void-500/20 rounded-full blur-[200px] pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 relative">
          <span
            data-i18n="contact.tagline"
            className="text-ember-400 font-semibold tracking-[0.3em] uppercase text-sm md:text-base block mb-4"
          >
            Ready to Build?
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            <span data-i18n="contact.title">Let's</span>{" "}
            <span
              data-i18n="contact.titleHighlight"
              className="text-transparent bg-clip-text bg-linear-to-r from-void-500 via-ember-500 to-ember-400"
            >
              Connect
            </span>
          </h2>
          <p
            data-i18n="contact.description"
            className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed"
          >
            Whether you have a game prototype, an app idea, or just want to say hi,
            we're all ears. Drop us a message below.
          </p>
        </div>
        <div className="bg-[#13141a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-ember-500/50 rounded-tl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-ember-400/50 rounded-br-3xl pointer-events-none" />
          <ContactForm />
        </div>
        <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-8 text-gray-400">
          <a
            href="mailto:hello@orangeember.com"
            className="hover:text-ember-400 transition-colors flex items-center gap-2"
          >
            <IconMail className="w-5 h-5" />
            hello@orangeember.com
          </a>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/20" />
          <a
            href="https://x.com/OrangeEmberSt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ember-400 transition-colors flex items-center gap-2"
          >
            <IconX className="w-5 h-5" />
            @OrangeEmberSt
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
