CREATE TABLE IF NOT EXISTS post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, visitor_hash)
);
