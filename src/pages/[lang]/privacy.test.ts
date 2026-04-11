/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from "vitest";
import PrivacyPage from "./privacy.astro";
import { getByText, getAllByText } from "@testing-library/dom";
import { createAstroContainer, setupDOMEnvironment } from "../../test-utils";

describe("Privacy Policy Page", () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it("renders the privacy policy page with the correct title", async () => {
    const result = await container.renderToString(PrivacyPage);
    const div = document.createElement("div");
    div.innerHTML = result;
    document.body.appendChild(div);

    // Check for the title (internationalized or default)
    expect(getAllByText(div, /Privacy Policy/i).length).toBeGreaterThan(0);
  });

  it('contains legal sections like "Data Collection" or "Cookies"', async () => {
    const result = await container.renderToString(PrivacyPage);
    const div = document.createElement("div");
    div.innerHTML = result;
    document.body.appendChild(div);

    // Check for typical privacy sections (using getAll because they might appear in titles and paragraphs)
    expect(getAllByText(div, /Data Collection/i).length).toBeGreaterThan(0);
    expect(getAllByText(div, /Cookies/i).length).toBeGreaterThan(0);
  });
});
