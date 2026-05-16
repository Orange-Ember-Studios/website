/** Wires the #blog-like-btn element: fetches initial count and handles click → POST. */
export function setupLikeButton(): void {
  const btn = document.getElementById(
    "blog-like-btn",
  ) as HTMLButtonElement | null;
  if (!btn) return;
  if (btn.dataset.likeWired === "true") return;

  const endpoint = btn.dataset.likeEndpoint;
  if (!endpoint) {
    console.error("[blog-like] Missing data-like-endpoint on #blog-like-btn");
    return;
  }

  btn.dataset.likeWired = "true";

  const labels = {
    like: btn.dataset.likeLabel ?? "Like",
    liked: btn.dataset.likedLabel ?? "Liked",
  };

  const applyPayload = (payload: { count: number; liked: boolean }) => {
    const countEl = btn.querySelector("[data-like-count]");
    const labelEl = btn.querySelector("[data-like-label]");
    if (countEl) countEl.textContent = String(payload.count);
    if (labelEl)
      labelEl.textContent = payload.liked ? labels.liked : labels.like;
    btn.disabled = payload.liked;
    btn.setAttribute("aria-pressed", payload.liked ? "true" : "false");
  };

  void fetch(endpoint, { credentials: "include" })
    .then((r) => (r.ok ? (r.json() as Promise<{ count: number; liked: boolean }>) : null))
    .then((payload) => { if (payload) applyPayload(payload); })
    .catch(() => {});

  btn.addEventListener("click", (e: MouseEvent) => {
    e.preventDefault();
    if (!btn || btn.disabled) return;
    btn.disabled = true;

    void fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ count: number; liked: boolean }>) : null))
      .then((payload) => { if (payload) applyPayload(payload); })
      .catch(() => { btn.disabled = false; });
  });
}

/** DOM listeners for blog post page (copy buttons). */
function setupCopyButtons() {
  const buttons = document.querySelectorAll(".copy-button");
  buttons.forEach((button) => {
    if (button instanceof HTMLElement && button.dataset.copyWired === "true") {
      return;
    }
    if (button instanceof HTMLElement) {
      button.dataset.copyWired = "true";
    }
    button.addEventListener("click", async () => {
      const code = decodeURIComponent(
        button.getAttribute("data-code") || "",
      );
      const span = button.querySelector("span");
      const svg = button.querySelector("svg");
      try {
        await navigator.clipboard.writeText(code);
        if (span) span.textContent = "Copied!";
        if (svg)
          svg.innerHTML =
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />';
        button.classList.add("text-green-400");
        setTimeout(() => {
          if (span) span.textContent = "Copy";
          if (svg)
            svg.innerHTML =
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />';
          button.classList.remove("text-green-400");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    });
  });
}

/** DOM listeners for blog post HTML (e.g. copy buttons in rendered markdown).
 * Like button is handled separately in BlogPost.tsx.
 */
export function setupBlogInteractions(): void {
  setupCopyButtons();
}
