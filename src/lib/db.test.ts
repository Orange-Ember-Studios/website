import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDbClient } from './db';
import { createClient } from '@libsql/client';

vi.mock('@libsql/client', () => ({
  createClient: vi.fn(),
}));

describe('Database connection (LibSQL)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws an error if TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing', () => {
    // We stub process.env because vitest maps import.meta.env to process.env
    vi.stubEnv('TURSO_DATABASE_URL', '');
    vi.stubEnv('TURSO_AUTH_TOKEN', '');
    expect(() => getDbClient()).toThrow('Database credentials are not configured');
  });

  it('calls createClient with correct arguments when credentials exist', () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'libsql://test.turso.io');
    vi.stubEnv('TURSO_AUTH_TOKEN', 'fake-token-123');
    getDbClient();
    expect(createClient).toHaveBeenCalledWith({
      url: 'libsql://test.turso.io',
      authToken: 'fake-token-123'
    });
  });
});
