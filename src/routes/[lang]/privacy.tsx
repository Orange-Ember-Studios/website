import { IconChevronLeft } from "@emberkit/icons";
import type { RouteComponent } from "@emberkit/core";
import { getCurrentLanguage } from "../../i18n/i18n.ts";

const PrivacyPage: RouteComponent = () => {
  const lang = getCurrentLanguage();

  return (
    <main className="pt-32 pb-24 bg-[#0b0f19] relative min-h-screen">
      <div className="absolute top-0 right-0 w-full h-full max-w-4xl bg-ember-500/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-full h-full max-w-4xl bg-void-500/5 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/4" />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <header className="mb-16">
          <a
            href={`/${lang}/`}
            className="text-ember-400 hover:text-white transition-colors flex items-center gap-2 mb-8 group"
          >
            <IconChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span data-i18n="nav.backToHome">Back to Home</span>
          </a>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
            data-i18n="privacy.title"
          >
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-medium" data-i18n="privacy.lastUpdated">
            Last Updated: April 7, 2026
          </p>
        </header>
        <div className="prose prose-invert prose-lg max-w-none space-y-12">
          <section>
            <p
              className="text-gray-300 leading-relaxed text-xl"
              data-i18n="privacy.intro"
            >
              At Orange Ember Studios, we value your privacy. This policy explains how
              we handle your information when you visit our site or use our services.
            </p>
          </section>
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
            <h2
              className="text-2xl font-bold text-white mb-4"
              data-i18n="privacy.dataCollectionTitle"
            >
              Data Collection
            </h2>
            <p
              className="text-gray-400 leading-relaxed"
              data-i18n="privacy.dataCollectionDesc"
            >
              We only collect information that you voluntarily provide to us through our
              contact forms, such as your name and email address. We use this information
              solely to communicate with you regarding your inquiries.
            </p>
          </section>
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
            <h2
              className="text-2xl font-bold text-white mb-4"
              data-i18n="privacy.cookiesTitle"
            >
              Cookies
            </h2>
            <p
              className="text-gray-400 leading-relaxed"
              data-i18n="privacy.cookiesDesc"
            >
              Our website uses essential cookies to ensure its proper functioning and to
              enhance your user experience. We do not use tracking cookies for advertising
              purposes.
            </p>
          </section>
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
            <h2
              className="text-2xl font-bold text-white mb-4"
              data-i18n="privacy.securityTitle"
            >
              Security
            </h2>
            <p
              className="text-gray-400 leading-relaxed"
              data-i18n="privacy.securityDesc"
            >
              We implement industry-standard security measures, including Cloudflare
              protection, to safeguard your data from unauthorized access.
            </p>
          </section>
          <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 border-ember-500/30">
            <h2
              className="text-2xl font-bold text-white mb-4"
              data-i18n="privacy.contactTitle"
            >
              Contact Us
            </h2>
            <p
              className="text-gray-400 leading-relaxed"
              data-i18n="privacy.contactDesc"
            >
              If you have any questions about this Privacy Policy, please contact us at
              privacy@orangeember.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPage;
