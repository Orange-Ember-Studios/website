/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from "vitest";
import Layout from "./Layout.astro";
import { createAstroContainer, setupDOMEnvironment } from "../test-utils";

describe("Root Layout (OpenGraph Tags)", () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it("should include the og:logo meta tag with the correct absolute URL", async () => {
    const result = await container.renderToString(Layout, {
      props: {
        title: "Test Studio",
      },
    });

    // Check if the og:logo tag exists and has the correct content
    const logoTagExists = result.includes('property="og:logo"');
    const expectedUrl = "https://orangeember.com/favicon.svg";

    const expectedTag = `meta property="og:logo" content="${expectedUrl}"`;

    const hasTheTag = result.includes(expectedTag);

    expect(logoTagExists).toBe(true);
    expect(hasTheTag).toBe(true);
  });

  it("should include a canonical link tag", async () => {
    const result = await container.renderToString(Layout, {
      props: {
        title: "Test Studio",
      },
    });

    const canonicalExists = result.includes('rel="canonical"');
    expect(canonicalExists).toBe(true);
  });

  it("should include og:locale meta tag", async () => {
    const result = await container.renderToString(Layout, {
      props: {
        title: "Test Studio",
      },
    });

    const localeExists = result.includes('property="og:locale"');
    expect(localeExists).toBe(true);
  });

  it("should include JSON-LD structured data", async () => {
    const result = await container.renderToString(Layout, {
      props: {
        title: "Test Studio",
      },
    });

    const jsonLdExists = result.includes('type="application/ld+json"');
    expect(jsonLdExists).toBe(true);
  });

  it("should include View Transitions (ClientRouter) support", async () => {
    const result = await container.renderToString(Layout, {
      props: {
        title: "Test Studio",
      },
    });

    // ClientRouter (ViewTransitions) in Astro usually injects specific scripts or data attributes
    // We expect it to be present in the layout
    const hasViewTransitions = result.includes('name="astro-view-transitions-enabled"');
    expect(hasViewTransitions).toBe(true);
  });
});
