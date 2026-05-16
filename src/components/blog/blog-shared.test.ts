import { describe, it, expect } from "vitest";
import {
  escHtml,
  postLang,
  blogListCacheKey,
  blogPostCacheKey,
  formatBlogCardDate,
} from "./blog-shared.ts";

describe("blog-shared", () => {
  it("escHtml escapes special characters", () => {
    expect(escHtml(`<script>"&`)).toBe(
      "&lt;script>&quot;&amp;",
    );
  });

  it("postLang detects language prefix", () => {
    expect(postLang("es/hola")).toBe("es");
    expect(postLang("fr/bonjour")).toBe("fr");
    expect(postLang("hello-world")).toBe("en");
  });

  it("cache keys include lang and identifiers", () => {
    expect(blogListCacheKey("en", "desc")).toBe("blog-list:en:desc");
    expect(blogPostCacheKey("en", "my-post")).toBe("blog-post:en:my-post");
  });

  it("formatBlogCardDate uses locale", () => {
    const formatted = formatBlogCardDate("2024-06-15T12:00:00.000Z", "en");
    expect(formatted).toMatch(/Jun/);
    expect(formatted).toMatch(/2024/);
  });
});
