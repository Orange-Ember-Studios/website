import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ContactForm from './ContactForm.vue';

describe('Contact Form Vue Component (US-05)', () => {
  it('renders correctly with all required inputs', () => {
    const wrapper = mount(ContactForm);
    
    // Form fields expected
    expect(wrapper.find('input[name="name"]').exists()).toBe(true);
    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('input[name="subject"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="message"]').exists()).toBe(true);
  });

  it('shows an error state if submitted when empty', async () => {
    const wrapper = mount(ContactForm);
    
    await wrapper.find('form').trigger('submit.prevent');
    
    // We expect some form of validation error class or text to appear
    expect(wrapper.text()).toContain('required');
  });
});
