import {
  createEffect,
  createSignal,
} from "@emberkit/core";
import {
  IconLogIn,
  IconLogOut,
  IconMenu,
  IconUser,
  IconX,
} from "@emberkit/icons";
import type { SupportedLanguage } from "../../i18n/i18n.ts";
import PremiumLanguageSelector from "../LanguageSelector/PremiumLanguageSelector.tsx";

function useLangFromPath(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  if (seg === "en" || seg === "es" || seg === "fr") return seg;
  return "en";
}

export function Navbar() {
  const lang = useLangFromPath();
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [adminUser, setAdminUser] = createSignal<{
    username: string;
  } | null>(null);
  const [scrolled, setScrolled] = createSignal(false);

  createEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  });

  createEffect(() => {
    if (typeof window === "undefined") return;
    // Admin routes use their own session checks; skip to avoid duplicate /api/auth/me
    // (EmberKit createEffect runs on every route mount — each 401 is normal when logged out).
    if (window.location.pathname.startsWith("/admin")) {
      setAdminUser(null);
      return;
    }
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAdminUser(d?.user ?? null))
      .catch(() => setAdminUser(null));
  });

  const handleLinkClick = (e: any) => {
    const link = e.currentTarget as HTMLAnchorElement;
    const href = link.getAttribute("href") || "";

    if (typeof window === "undefined") return;

    const currentPath = window.location.pathname;
    const isHome =
      currentPath === `/${lang}/` ||
      currentPath === `/${lang}` ||
      currentPath === "/";

    // If it's an anchor link and we are on the homepage, scroll smoothly
    if (href.includes("#") && isHome) {
      const anchor = href.split("#")[1];
      const targetEl = document.getElementById(anchor);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
        // Update URL hash without re-rendering
        history.pushState(null, "", `#${anchor}`);
        if (menuOpen()) toggleMenu();
      }
    }
  };

  const toggleMenu = () => {
    const next = !menuOpen();
    setMenuOpen(next);
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");
    const closeIcon = document.getElementById("close-icon");
    const btn = document.getElementById("mobile-menu-btn");
    btn?.setAttribute("aria-expanded", next ? "true" : "false");
    if (next) {
      mobileMenu?.classList.remove("translate-x-full");
      mobileMenu?.classList.add("translate-x-0");
      menuIcon?.classList.add("hidden");
      closeIcon?.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    } else {
      mobileMenu?.classList.remove("translate-x-0");
      mobileMenu?.classList.add("translate-x-full");
      menuIcon?.classList.remove("hidden");
      closeIcon?.classList.add("hidden");
      document.body.style.overflow = "";
    }
  };

  const loggedIn = () => adminUser() != null;

  return (
    <>
      <nav
        id="main-nav"
        data-ek-bind={scrolled}
        data-ek-active-when="true"
        data-ek-active-class="bg-ash-950/50 backdrop-blur-xl py-4 border-b border-white/10"
        data-ek-inactive-class="py-6"
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500 py-6"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href={`/${lang}/`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative">
              <img
                src="/Shield.svg"
                alt="Orange Ember Shield"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,91,13,0.5)] group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
              Orange <span className="text-ember-400">Ember</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href={`/${lang}/#portfolio`}
              data-i18n="nav.portfolio"
              className="text-sm font-medium text-gray-300 hover:text-ember-400 transition-colors uppercase tracking-widest"
              onClick={handleLinkClick}
            >
              Portfolio
            </a>
            <a
              href={`/${lang}/#services`}
              data-i18n="nav.services"
              className="text-sm font-medium text-gray-300 hover:text-ember-400 transition-colors uppercase tracking-widest"
              onClick={handleLinkClick}
            >
              Services
            </a>
            <a
              href={`/${lang}/#about`}
              data-i18n="nav.about"
              className="text-sm font-medium text-gray-300 hover:text-ember-400 transition-colors uppercase tracking-widest"
              onClick={handleLinkClick}
            >
              About
            </a>
            <a
              href={`/${lang}/blog`}
              data-i18n="nav.blog"
              className="text-sm font-medium text-gray-300 hover:text-ember-400 transition-colors uppercase tracking-widest"
            >
              Blog
            </a>
            <a
              href={`/${lang}/#contact`}
              data-i18n="nav.workWithUs"
              className="px-6 py-2 border border-ember-500/30 rounded-full text-sm font-semibold text-white bg-void-500/20 hover:bg-ember-500 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,91,13,0.3)]"
              onClick={handleLinkClick}
            >
              Work with us
            </a>
            <a
              href="https://buymeacoffee.com/seobryn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-300"
              title="Support us on Buy Me a Coffee"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21h18v-2H2v2zm2-4h14V9H4v8zm2-6h10v2H6V11zm2-4h6v2H8V7z" />
              </svg>
              Donate
            </a>
            <PremiumLanguageSelector lang={lang} id="desktop-lang-selector" />
            <a
              href="/admin"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-ember-400 hover:border-ember-500/50 transition-all duration-300 group/nav-login"
              title={loggedIn() ? "Dashboard" : "Login"}
            >
              {loggedIn() ? (
                <IconLogOut className="h-5 w-5 group-hover/nav-login:scale-110 transition-transform" />
              ) : (
                <IconLogIn className="h-5 w-5 group-hover/nav-login:scale-110 transition-transform" />
              )}
            </a>
          </div>

          <button
            id="mobile-menu-btn"
            type="button"
            aria-controls="mobile-menu"
            aria-expanded="false"
            className="md:hidden text-white hover:text-ember-400 transition-colors z-50 relative"
            onClick={() => toggleMenu()}
          >
            <span id="menu-icon" className="block">
              <IconMenu className="w-8 h-8 transition-transform duration-300" />
            </span>
            <span id="close-icon" className="hidden absolute top-0 left-0">
              <IconX className="w-8 h-8 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className="fixed inset-0 bg-ash-950/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center translate-x-full transition-transform duration-500 ease-in-out md:hidden text-center"
      >
        <div className="flex flex-col items-center gap-8">
          {(
            [
              ["portfolio", `/${lang}/#portfolio`, "nav.portfolio"],
              ["services", `/${lang}/#services`, "nav.services"],
              ["about", `/${lang}/#about`, "nav.about"],
              ["blog", `/${lang}/blog`, "nav.blog"],
            ] as const
          ).map(([key, href, i18n]) => (
            <a
              key={key}
              href={href}
              data-i18n={i18n}
              className="mobile-link text-2xl font-bold text-white hover:text-ember-400 transition-colors uppercase tracking-widest"
              onClick={handleLinkClick}
            >
              {key}
            </a>
          ))}
          <a
            href={`/${lang}/#contact`}
            data-i18n="nav.workWithUs"
            className="mobile-link px-8 py-3 mt-4 border border-ember-500/30 rounded-full text-lg font-bold text-white bg-void-500/20 hover:bg-ember-500 transition-all duration-300"
            onClick={handleLinkClick}
          >
            Work with us
          </a>
          <a
            href="https://buymeacoffee.com/seobryn"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-link flex items-center gap-2 px-6 py-3 mt-4 rounded-full text-base font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all duration-300"
            onClick={() => menuOpen() && toggleMenu()}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21h18v-2H2v2zm2-4h14V9H4v8zm2-6h10v2H6V11zm2-4h6v2H8V7z" />
            </svg>
            Donate
          </a>
          <div className="mt-4 flex flex-col items-center gap-6">
            <PremiumLanguageSelector lang={lang} id="mobile-lang-selector" />
            <a
              href="/admin"
              className="mobile-link flex items-center gap-3 text-lg font-medium text-gray-400 hover:text-ember-400 transition-colors"
              onClick={() => menuOpen() && toggleMenu()}
            >
              <IconUser className="h-6 w-6" />
              {loggedIn() ? "Dashboard" : "Admin Login"}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
