import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser } from './auth.service';
import * as dbUtils from './db';
import * as authUtils from './auth';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null if user does not exist', async () => {
    const executeMock = vi.fn().mockResolvedValue({ rows: [] });
    vi.spyOn(dbUtils, 'getDbClient').mockReturnValue({ execute: executeMock } as any);

    const result = await loginUser('nonexistent', 'pass');
    expect(result).toBeNull();
  });

  it('should return null if password does not match', async () => {
    const executeMock = vi.fn().mockResolvedValue({ rows: [{ id: '1', password_hash: 'hash' }] });
    vi.spyOn(dbUtils, 'getDbClient').mockReturnValue({ execute: executeMock } as any);
    vi.spyOn(authUtils, 'verifyPassword').mockResolvedValue(false);

    const result = await loginUser('admin', 'wrong');
    expect(result).toBeNull();
  });

  it('should return a token if credentials are valid', async () => {
    const executeMock = vi.fn().mockResolvedValue({ rows: [{ id: '1', password_hash: 'hash' }] });
    vi.spyOn(dbUtils, 'getDbClient').mockReturnValue({ execute: executeMock } as any);
    vi.spyOn(authUtils, 'verifyPassword').mockResolvedValue(true);
    vi.spyOn(authUtils, 'createToken').mockResolvedValue('fake-jwt-token');

    const result = await loginUser('admin', 'correct');
    expect(result).toEqual({ token: 'fake-jwt-token', userId: '1', username: 'admin' });
  });
});
