import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LanguageSelector from './LanguageSelector.vue';
import * as i18n from '../../i18n/i18n';

describe('LanguageSelector Vue Component', () => {
  it('renders all supported languages', () => {
    const wrapper = mount(LanguageSelector);
    const options = wrapper.findAll('option');
    expect(options.length).toBe(3);
    expect(options[0].text()).toBe('English 🇺🇸');
    expect(options[1].text()).toBe('Español 🇪🇸');
    expect(options[2].text()).toBe('Français  🇫🇷');
  });

  it('selects the current language by default', () => {
    vi.spyOn(i18n, 'getCurrentLanguage').mockReturnValue('es');
    const wrapper = mount(LanguageSelector);
    const select = wrapper.find('select');
    expect((select.element as HTMLSelectElement).value).toBe('es');
  });

  it('calls setLanguage and translateAll when selection changes', async () => {
    const setLanguageSpy = vi.spyOn(i18n, 'setLanguage');
    const translateAllSpy = vi.spyOn(i18n, 'translateAll');
    
    const wrapper = mount(LanguageSelector);
    const select = wrapper.find('select');
    (select.element as HTMLSelectElement).value = 'fr';
    await select.trigger('change');

    expect(setLanguageSpy).toHaveBeenCalledWith('fr', true);
    expect(translateAllSpy).toHaveBeenCalled();
  });
});
