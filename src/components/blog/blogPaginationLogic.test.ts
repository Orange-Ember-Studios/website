import { describe, it, expect } from "vitest";
import { getVisiblePosts } from "./blogPaginationLogic";

describe("blogPaginationLogic", () => {
  const mockPosts = [
    { id: "1", lang: "en", tags: ["tech"] },
    { id: "2", lang: "en", tags: ["gaming"] },
    { id: "3", lang: "en", tags: ["tech"] },
    { id: "4", lang: "es", tags: ["tech"] },
    { id: "5", lang: "en", tags: ["gaming"] },
    { id: "6", lang: "en", tags: ["tech"] },
  ];

  it("should filter by language", () => {
    const { visiblePosts, totalMatching } = getVisiblePosts(
      mockPosts,
      "en",
      new Set(["all"]),
      10,
    );
    expect(totalMatching).toBe(5);
    expect(visiblePosts.length).toBe(5);
  });

  it("should respect the visible limit", () => {
    const { visiblePosts, totalMatching, hasMore } = getVisiblePosts(
      mockPosts,
      "en",
      new Set(["all"]),
      3,
    );
    expect(totalMatching).toBe(5);
    expect(visiblePosts.length).toBe(3);
    expect(hasMore).toBe(true);
  });

  it("should filter by tags and respect limit", () => {
    const { visiblePosts, totalMatching, hasMore } = getVisiblePosts(
      mockPosts,
      "en",
      new Set(["tech"]),
      2,
    );
    expect(totalMatching).toBe(3);
    expect(visiblePosts.length).toBe(2);
    expect(hasMore).toBe(true);
  });

  it("should indicate when no more posts are available", () => {
    const { hasMore } = getVisiblePosts(mockPosts, "en", new Set(["all"]), 5);
    expect(hasMore).toBe(false);
  });
});
