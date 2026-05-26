import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDbClient } from './db.ts';
import { createClient } from '@libsql/client';

vi.mock('@libsql/client', () => ({
  createClient: vi.fn(),
}));

describe('Database connection (LibSQL)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when TURSO_DATABASE_URL is missing', () => {
    vi.stubEnv('TURSO_DATABASE_URL', '');
    vi.stubEnv('TURSO_AUTH_TOKEN', '');
    expect(() => getDbClient()).toThrow('Database credentials are not configured');
  });

  it('throws when remote URL is set but TURSO_AUTH_TOKEN is missing', () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'libsql://test.turso.io');
    vi.stubEnv('TURSO_AUTH_TOKEN', '');
    expect(() => getDbClient()).toThrow('TURSO_AUTH_TOKEN is required');
  });

  it('calls createClient with url only for file: SQLite URLs', () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'file:./local.db');
    vi.stubEnv('TURSO_AUTH_TOKEN', '');
    getDbClient();
    expect(createClient).toHaveBeenCalledWith({ url: 'file:./local.db' });
  });

  it('calls createClient with correct arguments when credentials exist', () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'libsql://test.turso.io');
    vi.stubEnv('TURSO_AUTH_TOKEN', 'fake-token-123');
    getDbClient();
    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({
      url: 'libsql://test.turso.io',
      authToken: 'fake-token-123'
    }));
  });
});
