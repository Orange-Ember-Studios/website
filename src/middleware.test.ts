import { describe, it, expect, vi } from 'vitest';
import { onRequest } from './middleware';

describe('Middleware', () => {
  it('redirects root / to default language', async () => {
    const context = {
      url: new URL('http://localhost/'),
      cookies: { get: vi.fn().mockReturnValue({ value: 'en' }) },
      request: { headers: { get: vi.fn() } },
      redirect: vi.fn(),
      params: {},
      locals: {}
    };
    const next = vi.fn();
    
    await onRequest(context as any, next);
    
    expect(context.redirect).toHaveBeenCalledWith('/en/');
  });

  it('redirects invalid lang segment to 404', async () => {
    const context = {
      url: new URL('http://localhost/blog'),
      cookies: { get: vi.fn().mockReturnValue(null) },
      request: { headers: { get: vi.fn() } },
      redirect: vi.fn(),
      params: { lang: 'blog' },
      locals: {}
    };
    const next = vi.fn();
    
    await onRequest(context as any, next);
    
    expect(context.redirect).toHaveBeenCalledWith('/404');
  });

  it('allows valid lang segment to proceed', async () => {
    const context = {
      url: new URL('http://localhost/es/'),
      cookies: { get: vi.fn().mockReturnValue(null) },
      request: { headers: { get: vi.fn() } },
      redirect: vi.fn(),
      params: { lang: 'es' },
      locals: {}
    };
    const response = new Response();
    const next = vi.fn().mockResolvedValue(response);
    
    await onRequest(context as any, next);
    
    expect(context.locals.lang).toBe('es');
    expect(next).toHaveBeenCalled();
    expect(context.redirect).not.toHaveBeenCalled();
  });
});
