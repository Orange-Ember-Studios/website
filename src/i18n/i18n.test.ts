import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getTranslation, 
  setLanguage, 
  getCurrentLanguage, 
  getSupportedLanguages,
  type SupportedLanguage 
} from './i18n';

describe('i18n Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    setLanguage('en');
  });

  describe('getSupportedLanguages', () => {
    it('returns exactly three supported languages: en, es, fr', () => {
      const languages = getSupportedLanguages();
      expect(languages).toEqual([
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'fr', label: 'Français' },
      ]);
    });
  });

  describe('getCurrentLanguage', () => {
    it('defaults to "en" when nothing is stored', () => {
      expect(getCurrentLanguage()).toBe('en');
    });

    it('reads the stored language from localStorage', () => {
      localStorage.setItem('oe-lang', 'es');
      expect(getCurrentLanguage()).toBe('es');
    });

    it('falls back to "en" for an invalid stored value', () => {
      localStorage.setItem('oe-lang', 'xx');
      expect(getCurrentLanguage()).toBe('en');
    });
  });

  describe('setLanguage', () => {
    it('persists language to localStorage', () => {
      setLanguage('fr');
      expect(localStorage.getItem('oe-lang')).toBe('fr');
    });

    it('updates getCurrentLanguage after setting', () => {
      setLanguage('es');
      expect(getCurrentLanguage()).toBe('es');
    });
  });

  describe('getTranslation', () => {
    it('returns the correct English string for a nested key', () => {
      setLanguage('en');
      expect(getTranslation('hero.tagline')).toBe('Create. Ignite. Play.');
    });

    it('returns the correct Spanish string for a nested key', () => {
      setLanguage('es');
      expect(getTranslation('hero.tagline')).toBe('Crea. Enciende. Juega.');
    });

    it('returns the correct French string for a nested key', () => {
      setLanguage('fr');
      expect(getTranslation('hero.tagline')).toBe('Créer. Enflammer. Jouer.');
    });

    it('returns the key itself if the translation is missing', () => {
      setLanguage('en');
      expect(getTranslation('nonexistent.key')).toBe('nonexistent.key');
    });

    it('retrieves deeply nested keys correctly', () => {
      setLanguage('en');
      expect(getTranslation('nav.portfolio')).toBe('Portfolio');
      expect(getTranslation('contact.submitButton')).toBe('Ignite Conversation');
    });

    it('can accept a specific language parameter to override current', () => {
      setLanguage('en');
      expect(getTranslation('hero.tagline', 'fr')).toBe('Créer. Enflammer. Jouer.');
    });
  });
});
