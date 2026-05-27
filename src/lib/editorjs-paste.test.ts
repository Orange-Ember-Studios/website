import { describe, expect, it } from "vitest";
import {
  clipboardTextToEditorJsBlocks,
  filterBlocksForEditor,
  looksLikeMarkdown,
  tryParseEditorJsBlocks,
} from "./editorjs-paste.ts";

describe("looksLikeMarkdown", () => {
  it("detects headings and fenced code", () => {
    expect(looksLikeMarkdown("# Title")).toBe(true);
    expect(looksLikeMarkdown("```ts\nconst x = 1\n```")).toBe(true);
  });

  it("detects multi-line markdown bodies", () => {
    expect(looksLikeMarkdown("Intro\n\n## Section\n\nMore text")).toBe(true);
  });

  it("ignores plain single-line text", () => {
    expect(looksLikeMarkdown("Just a sentence.")).toBe(false);
    expect(looksLikeMarkdown("hello@example.com")).toBe(false);
  });
});

describe("tryParseEditorJsBlocks", () => {
  it("parses Editor.js JSON from clipboard", () => {
    const raw = JSON.stringify({
      blocks: [{ type: "paragraph", data: { text: "Hi" } }],
    });
    expect(tryParseEditorJsBlocks(raw)?.[0]).toMatchObject({
      type: "paragraph",
      data: { text: "Hi" },
    });
  });
});

describe("clipboardTextToEditorJsBlocks", () => {
  it("converts markdown headings to header blocks", () => {
    const blocks = clipboardTextToEditorJsBlocks("# Hello\n\nBody", false);
    expect(blocks?.some((b) => b.type === "header")).toBe(true);
    expect(blocks?.some((b) => b.type === "paragraph")).toBe(true);
  });

  it("downgrades code blocks in minimal mode", () => {
    const blocks = clipboardTextToEditorJsBlocks("```js\nx\n```", true);
    expect(blocks).toHaveLength(1);
    expect(blocks?.[0]?.type).toBe("paragraph");
  });

  it("returns null for plain text", () => {
    expect(clipboardTextToEditorJsBlocks("plain text only", false)).toBeNull();
  });

  it("converts a single line with bold markdown", () => {
    const blocks = clipboardTextToEditorJsBlocks("**Important** note", false);
    expect(blocks?.[0]).toMatchObject({
      type: "paragraph",
      data: { text: "<b>Important</b> note" },
    });
  });
});

describe("filterBlocksForEditor", () => {
  it("keeps supported types in minimal mode", () => {
    const blocks = filterBlocksForEditor(
      [
        { type: "header", data: { text: "T", level: 2 } },
        { type: "quote", data: { text: "Q", caption: "" } },
      ],
      true,
    );
    expect(blocks).toHaveLength(2);
  });
});
