import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ContactForm from './ContactForm.vue';
import { API_URLS } from '../../constants/urls';

// Mock global fetch
global.fetch = vi.fn();

describe('Contact Form Submission', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (window as any).turnstile = {
            render: (_el: HTMLElement, opts: { callback: (token: string) => void }) => {
                opts.callback('fake-token');
                return 'test-widget-id';
            },
            remove: vi.fn(),
            reset: vi.fn(),
        };
        // Mock success response
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    it('submits the form to the API and shows a success message', async () => {
        const wrapper = mount(ContactForm);
        await wrapper.vm.$nextTick();

        // Fill valid form fields
        await wrapper.find('input[name="name"]').setValue('John Doe');
        await wrapper.find('input[name="email"]').setValue('john@example.com');
        await wrapper.find('input[name="subject"]').setValue('Game Partnership');
        await wrapper.find('textarea[name="message"]').setValue('This is a test message.');
        
        // Trigger submit
        await wrapper.find('form').trigger('submit.prevent');

        // Check if fetch was called with the correct data
        expect(fetch).toHaveBeenCalledWith(API_URLS.CONTACT_FORM_SUBMISSION, expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                subject: 'Game Partnership',
                message: 'This is a test message.',
                token: 'fake-token'
            })
        }));

        // Check for success message
        expect(wrapper.text()).toContain('Your spark has been sent!');
    });

    it('shows an error message if the API call fails', async () => {
        // Mock error response
        (fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Submission failed' }),
        });

        const wrapper = mount(ContactForm);
        await wrapper.vm.$nextTick();

        await wrapper.find('input[name="name"]').setValue('John Doe');
        await wrapper.find('input[name="email"]').setValue('john@example.com');
        await wrapper.find('input[name="subject"]').setValue('Game Partnership');
        await wrapper.find('textarea[name="message"]').setValue('This is a test message.');
        
        await wrapper.find('form').trigger('submit.prevent');

        expect(wrapper.text()).toContain('Submission failed');
    });

    it('validates the email format', async () => {
        const wrapper = mount(ContactForm);
        
        await wrapper.find('input[name="name"]').setValue('John Doe');
        await wrapper.find('input[name="email"]').setValue('invalid-email');
        await wrapper.find('input[name="subject"]').setValue('Game Partnership');
        await wrapper.find('textarea[name="message"]').setValue('This is a test message.');
        
        await wrapper.find('form').trigger('submit.prevent');

        expect(wrapper.text()).toContain('Invalid email address');
        expect(fetch).not.toHaveBeenCalled();
    });
});
