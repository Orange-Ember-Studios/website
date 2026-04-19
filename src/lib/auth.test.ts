import { describe, it, expect } from 'vitest';
import { createToken, verifyToken, hashPassword, verifyPassword } from './auth';

describe('Auth Utilities', () => {
  it('should hash and verify passwords correctly', async () => {
    const pass = 'supersecret';
    const hash = await hashPassword(pass);
    expect(hash).not.toBe(pass);
    const isValid = await verifyPassword(pass, hash);
    expect(isValid).toBe(true);
    const isInvalid = await verifyPassword('wrong', hash);
    expect(isInvalid).toBe(false);
  });

  it('should create and verify JWT tokens correctly', async () => {
    const payload = { userId: '123', username: 'admin' };
    const token = await createToken(payload);
    expect(typeof token).toBe('string');
    
    const decoded = await verifyToken(token);
    expect(decoded?.userId).toBe('123');
    expect(decoded?.username).toBe('admin');
  });

  it('should return null for invalid JWT tokens', async () => {
    const decoded = await verifyToken('invalid.token.here');
    expect(decoded).toBeNull();
  });
});
