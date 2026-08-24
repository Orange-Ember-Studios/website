export function initPremiumSelects(): void {
  const containers = document.querySelectorAll(".premium-select-container");

  containers.forEach((container) => {
    if (container.getAttribute("data-initialized")) return;
    container.setAttribute("data-initialized", "true");

    const trigger = container.querySelector(".select-trigger");
    const dropdown = container.querySelector(".select-dropdown");
    const arrow = container.querySelector(".arrow-icon");
    const options = container.querySelectorAll(".option-btn");
    const isMultiple = container.getAttribute("data-is-multiple") === "true";
    const selectId = container.getAttribute("data-id");
    const initialValues = JSON.parse(
      container.getAttribute("data-initial-values") || "[]",
    ) as string[];

    const selectedValues = new Set(initialValues);

    const syncTriggerLabel = () => {
      if (isMultiple) return;
      const labelEl = container.querySelector(".selected-label");
      if (!labelEl) return;
      const currentVal = [...selectedValues][0];
      if (!currentVal) return;
      const btn = [...options].find(
        (o) => o.getAttribute("data-value") === currentVal,
      );
      const textSpan = btn?.querySelector("span");
      if (textSpan?.textContent) {
        labelEl.textContent = textSpan.textContent.trim();
      }
    };

    const updateUI = (skipDispatch = false) => {
      options.forEach((opt) => {
        const val = opt.getAttribute("data-value");
        if (val != null && selectedValues.has(val)) {
          opt.classList.add("active");
        } else {
          opt.classList.remove("active");
        }
      });

      syncTriggerLabel();

      if (!skipDispatch) {
        container.dispatchEvent(
          new CustomEvent("change", {
            bubbles: true,
            composed: true,
            detail: {
              id: selectId,
              values: Array.from(selectedValues),
              isMultiple,
            },
          }),
        );
      }
    };

    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = dropdown?.classList.contains("hidden");

      document.querySelectorAll(".select-dropdown").forEach((d) => {
        if (d !== dropdown) {
          d.classList.add("scale-95", "opacity-0");
          setTimeout(() => d.classList.add("hidden"), 300);
          d.closest(".premium-select-container")
            ?.querySelector(".arrow-icon")
            ?.classList.remove("rotate-180");
        }
      });

      if (isHidden) {
        dropdown?.classList.remove("hidden");
        setTimeout(() => {
          dropdown?.classList.remove("scale-95", "opacity-0");
        }, 0);
        arrow?.classList.add("rotate-180");
      } else {
        dropdown?.classList.add("scale-95", "opacity-0");
        dropdown?.classList.remove("scale-100", "opacity-100");
        setTimeout(() => dropdown?.classList.add("hidden"), 300);
        arrow?.classList.remove("rotate-180");
      }
    });

    options.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = opt.getAttribute("data-value");
        if (value == null) return;

        if (isMultiple) {
          if (value === "all") {
            selectedValues.clear();
            selectedValues.add("all");
          } else {
            selectedValues.delete("all");
            if (selectedValues.has(value)) {
              selectedValues.delete(value);
              if (selectedValues.size === 0) selectedValues.add("all");
            } else {
              selectedValues.add(value);
            }
          }
        } else {
          selectedValues.clear();
          selectedValues.add(value);
          dropdown?.classList.add("scale-95", "opacity-0");
          dropdown?.classList.remove("scale-100", "opacity-100");
          setTimeout(() => dropdown?.classList.add("hidden"), 300);
          arrow?.classList.remove("rotate-180");
        }

        updateUI();
      });
    });

    document.addEventListener("click", () => {
      dropdown?.classList.add("scale-95", "opacity-0");
      dropdown?.classList.remove("scale-100", "opacity-100");
      setTimeout(() => dropdown?.classList.add("hidden"), 300);
      arrow?.classList.remove("rotate-180");
    });

    updateUI(true);
  });
}
