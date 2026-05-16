/** DOM listeners for blog post page (copy buttons).
 * Like button is now handled directly in BlogPost.tsx using createEffect pattern.
 */

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
