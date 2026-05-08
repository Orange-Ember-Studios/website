import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDbClient } from './db';
import { getPostLikeStatus, likePost } from './post-likes.service';

vi.mock('./db', () => ({
  getDbClient: vi.fn(),
}));

describe('Post likes service', () => {
  let executeMock: any;

  beforeEach(() => {
    executeMock = vi.fn();
    vi.mocked(getDbClient).mockReturnValue({ execute: executeMock } as any);
    vi.clearAllMocks();
  });

  it('returns null when the published blog post does not exist', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] });
    executeMock.mockResolvedValueOnce({ rows: [] });

    const result = await getPostLikeStatus('missing-post', 'en', 'visitor-1');

    expect(result).toBeNull();
  });

  it('returns the current count and liked state for a visitor', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'post-1' }] })
      .mockResolvedValueOnce({ rows: [{ count: 3 }] })
      .mockResolvedValueOnce({ rows: [{ '1': 1 }] });

    const result = await getPostLikeStatus('hello-world', 'en', 'visitor-1');

    expect(result).toEqual({ count: 3, liked: true });
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?'),
      args: ['post-1']
    }));
  });

  it('uses insert-or-ignore so the same visitor can only like a post once', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'post-1' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ '1': 1 }] });

    const result = await likePost('hello-world', 'en', 'visitor-1');

    expect(result).toEqual({ count: 1, liked: true });
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: 'INSERT OR IGNORE INTO post_likes (id, post_id, visitor_hash) VALUES (?, ?, ?)',
      args: expect.arrayContaining(['post-1'])
    }));
  });
});
