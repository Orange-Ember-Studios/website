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

  it('rejects form silently if honeypot is filled (Anti-Bot)', async () => {
    const wrapper = mount(ContactForm);
    
    // We expect a hidden deceptive honeypot field
    const honeypot = wrapper.find('input[name="address_ext"]');
    expect(honeypot.exists()).toBe(true);
    
    // Fill the honeypot acting as a bot
    await honeypot.setValue('bot-spam-content');
    
    // Fill valid form fields
    await wrapper.find('input[name="name"]').setValue('John');
    await wrapper.find('input[name="email"]').setValue('john@example.com');
    await wrapper.find('input[name="subject"]').setValue('Hello');
    await wrapper.find('textarea[name="message"]').setValue('World');
    
    await wrapper.find('form').trigger('submit.prevent');
    
    // The success message should NOT appear if it's a bot
    expect(wrapper.text()).not.toContain('Your spark has been sent!');
  });

  it('contains the Cloudflare Turnstile widget', () => {
    const wrapper = mount(ContactForm);
    expect(wrapper.find('.cf-turnstile').exists()).toBe(true);
  });
});
