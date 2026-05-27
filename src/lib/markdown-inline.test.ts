import { describe, expect, it } from "vitest";
import {
  hasMarkdownInlineSyntax,
  markdownInlineToHtml,
} from "./markdown-inline.ts";

describe("markdownInlineToHtml", () => {
  it("converts bold asterisks to <b>", () => {
    expect(markdownInlineToHtml("**Hello** world")).toBe(
      "<b>Hello</b> world",
    );
  });

  it("converts italic and inline code", () => {
    expect(markdownInlineToHtml("*emphasis* and `code`")).toBe(
      "<i>emphasis</i> and <code>code</code>",
    );
  });

  it("converts links", () => {
    expect(markdownInlineToHtml("[Docs](https://example.com)")).toBe(
      '<a href="https://example.com">Docs</a>',
    );
  });

  it("supports nested bold inside link labels", () => {
    expect(markdownInlineToHtml("[**Bold** label](https://x.test)")).toBe(
      '<a href="https://x.test"><b>Bold</b> label</a>',
    );
  });
});

describe("hasMarkdownInlineSyntax", () => {
  it("detects bold markers", () => {
    expect(hasMarkdownInlineSyntax("plain")).toBe(false);
    expect(hasMarkdownInlineSyntax("**bold**")).toBe(true);
  });
});
