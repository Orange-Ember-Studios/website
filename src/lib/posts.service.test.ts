import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as postsService from './posts.service';
import { getDbClient } from './db';

vi.mock('./db', () => ({
  getDbClient: vi.fn(),
}));

describe('Posts Service', () => {
  let executeMock: any;

  beforeEach(() => {
    executeMock = vi.fn();
    vi.mocked(getDbClient).mockReturnValue({ execute: executeMock } as any);
    vi.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return a list of posts', async () => {
      executeMock.mockResolvedValue({
        rows: [{ id: '1', slug: 'test-slug', type: 'blog' }]
      });

      const posts = await postsService.getAllPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].slug).toBe('test-slug');
    });
  });

  describe('getPostById', () => {
    it('should return a post with its translations', async () => {
      executeMock.mockImplementation((query: any) => {
        if (typeof query === 'string' || query.sql.includes('FROM posts')) {
          return Promise.resolve({ rows: [{ id: '1', slug: 'test-slug', type: 'blog' }] });
        }
        if (query.sql.includes('FROM post_translations')) {
          return Promise.resolve({ rows: [{ lang: 'en', title: 'Test', content: '{"blocks":[]}', published: true }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const post = await postsService.getPostById('1');
      expect(post).not.toBeNull();
      expect(post?.translations).toHaveLength(1);
      expect(post?.translations[0].lang).toBe('en');
    });
  });
});
