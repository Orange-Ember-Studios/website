CREATE TABLE IF NOT EXISTS post_translations (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, lang)
);
