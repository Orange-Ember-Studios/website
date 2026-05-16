import { SOCIAL_URLS } from "../../constants/urls.ts";
import {
  getTranslation,
  getCurrentLanguage,
} from "../../i18n/i18n.ts";
import { IconGithub, IconXTwitter } from "@emberkit/icons";

export function Footer() {
  const lang = getCurrentLanguage();

  return (
    <footer className="bg-[#0b0f19] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-full h-64 bg-void-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <a href={`/${lang}/`} className="flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 relative">
                <img
                  src="/Shield.svg"
                  alt="Orange Ember Shield"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,91,13,0.4)] group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Orange <span className="text-ember-400">Ember</span>
              </span>
            </a>
            <p
              className="text-gray-400 max-w-sm text-lg leading-relaxed mb-8"
              data-i18n="hero.description"
            >
              {getTranslation("hero.description", lang)}
            </p>
            <div className="flex gap-4">
              <a
                href={SOCIAL_URLS.TWITTER_X}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-ember-400 hover:border-ember-500/50 transition-all duration-300"
                aria-label="X (Twitter)"
              >
                <IconXTwitter className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_URLS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-ember-400 hover:border-ember-500/50 transition-all duration-300"
                aria-label="GitHub"
              >
                <IconGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h3
              className="text-white font-bold mb-6 tracking-wider uppercase text-sm"
              data-i18n="footer.studio"
            >
              {getTranslation("footer.studio", lang)}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`/${lang}/#portfolio`}
                  className="text-gray-400 hover:text-ember-400 transition-colors text-base"
                  data-i18n="nav.portfolio"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}/#services`}
                  className="text-gray-400 hover:text-ember-400 transition-colors text-base"
                  data-i18n="nav.services"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}/#about`}
                  className="text-gray-400 hover:text-ember-400 transition-colors text-base"
                  data-i18n="nav.about"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href={`/${lang}/#contact`}
                  className="text-gray-400 hover:text-ember-400 transition-colors text-base"
                  data-i18n="nav.workWithUs"
                >
                  Work with us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className="text-white font-bold mb-6 tracking-wider uppercase text-sm"
              data-i18n="footer.legal"
            >
              {getTranslation("footer.legal", lang)}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`/${lang}/privacy`}
                  className="text-gray-400 hover:text-ember-400 transition-colors text-base"
                  data-i18n="privacy.title"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Orange Ember Studios.{" "}
            <span data-i18n="footer.allRightsReserved">
              {getTranslation("footer.allRightsReserved", lang)}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ember-500 animate-pulse" />
            <span
              className="text-gray-500 text-sm tracking-wide uppercase"
              data-i18n="footer.ignitingSince"
            >
              {getTranslation("footer.ignitingSince", lang)}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
