import usersSql from "./001_users.sql?raw";
import postsSql from "./002_posts.sql?raw";
import postTranslationsSql from "./003_post_translations.sql?raw";
import postLikesSql from "./004_post_likes.sql?raw";

/** Ordered schema migrations (SQL). */
export const schemaMigrations = [
  { id: "001_users", sql: usersSql },
  { id: "002_posts", sql: postsSql },
  { id: "003_post_translations", sql: postTranslationsSql },
  { id: "004_post_likes", sql: postLikesSql },
] as const;
