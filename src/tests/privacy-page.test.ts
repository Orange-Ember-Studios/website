import { describe, it, expect } from "vitest";
import { createElement, render } from "@emberkit/core";
import { getAllByText } from "@testing-library/dom";
import PrivacyPage from "../routes/[lang]/privacy.tsx";

describe("Privacy Policy Page", () => {
  it("renders the privacy policy page with the correct title", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    render(createElement(PrivacyPage, {}), div);
    expect(getAllByText(div, /Privacy Policy/i).length).toBeGreaterThan(0);
  });

  it('contains legal sections like "Data Collection" or "Cookies"', () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    render(createElement(PrivacyPage, {}), div);
    expect(getAllByText(div, /Data Collection/i).length).toBeGreaterThan(0);
    expect(getAllByText(div, /Cookies/i).length).toBeGreaterThan(0);
  });
});
