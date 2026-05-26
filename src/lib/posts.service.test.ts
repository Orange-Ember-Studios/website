import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as postsService from './posts.service';
import { getDbClient } from './db.ts';

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

    it('filters by type when options.type is set', async () => {
      executeMock.mockResolvedValue({
        rows: [{ id: '2', slug: 'game', type: 'project' }],
      });

      const posts = await postsService.getAllPosts(undefined, { type: 'project' });
      expect(posts).toHaveLength(1);
      expect(executeMock).toHaveBeenCalledWith({
        sql: 'SELECT * FROM posts WHERE type = ? ORDER BY created_at DESC',
        args: ['project'],
      });
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

  describe('excerptFromPostContent', () => {
    it('extracts plain text from markdown content', () => {
      const excerpt = postsService.excerptFromPostContent(
        '**Hello** world\n\nSecond paragraph here.',
      );
      expect(excerpt).toContain('Hello');
      expect(excerpt).toContain('world');
    });

    it('extracts from Editor.js paragraph blocks', () => {
      const excerpt = postsService.excerptFromPostContent(
        JSON.stringify({
          blocks: [{ type: 'paragraph', data: { text: '<p>Editor body</p>' } }],
        }),
      );
      expect(excerpt).toContain('Editor body');
    });

    it('extracts from Editor.js in project meta description', () => {
      const excerpt = postsService.excerptFromPostContent(
        JSON.stringify({
          category: 'Web App',
          description: JSON.stringify({
            blocks: [{ type: 'paragraph', data: { text: 'Portfolio blurb' } }],
          }),
        }),
      );
      expect(excerpt).toContain('Portfolio blurb');
    });
  });
});
