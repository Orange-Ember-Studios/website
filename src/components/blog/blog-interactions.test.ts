import { afterEach, describe, expect, it, vi } from "vitest";
import { setupLikeButton } from "./blog-interactions.ts";

describe("setupLikeButton", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("wires #blog-like-btn and POSTs on click", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 2, liked: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 3, liked: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    document.body.innerHTML = `
      <button
        id="blog-like-btn"
        type="button"
        data-like-endpoint="/api/posts/en/hello/likes"
        data-like-label="Like"
        data-liked-label="Liked"
      >
        <span data-like-label>Like</span>
        <span data-like-count>0</span>
      </button>
    `;

    setupLikeButton();

    const btn = document.getElementById("blog-like-btn") as HTMLButtonElement;

    await vi.waitFor(() => {
      expect(btn.querySelector("[data-like-count]")?.textContent).toBe("2");
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/posts/en/hello/likes", {
      credentials: "include",
    });

    btn.click();

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/posts/en/hello/likes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      expect(btn.querySelector("[data-like-count]")?.textContent).toBe("3");
      expect(btn.querySelector("[data-like-label]")?.textContent).toBe("Liked");
      expect(btn.disabled).toBe(true);
    });
  });

  it("logs and skips when endpoint is missing", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    document.body.innerHTML = `<button id="blog-like-btn" type="button"></button>`;

    setupLikeButton();

    expect(errorSpy).toHaveBeenCalledWith(
      "[blog-like] Missing data-like-endpoint on #blog-like-btn",
    );
    expect(document.getElementById("blog-like-btn")?.dataset.likeWired).toBeUndefined();
  });
});
