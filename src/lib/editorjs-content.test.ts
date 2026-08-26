import { describe, expect, it } from "vitest";
import {
  EMPTY_EDITOR_JS,
  markdownToEditorJs,
  parseStoredContentToEditorJs,
  serializeEditorJs,
} from "./editorjs-content.ts";

describe("parseStoredContentToEditorJs", () => {
  it("returns empty blocks for blank content", () => {
    expect(parseStoredContentToEditorJs("").blocks).toEqual([]);
    expect(parseStoredContentToEditorJs("   ").blocks).toEqual([]);
  });

  it("parses Editor.js JSON from the database", () => {
    const raw = JSON.stringify({
      blocks: [{ type: "paragraph", data: { text: "Hello" } }],
    });
    const data = parseStoredContentToEditorJs(raw);
    expect(data.blocks).toHaveLength(1);
    expect(data.blocks?.[0]).toMatchObject({
      type: "paragraph",
      data: { text: "Hello" },
    });
  });

  it("converts legacy markdown to blocks", () => {
    const data = parseStoredContentToEditorJs("## Title\n\nBody copy");
    expect(data.blocks?.some((b) => b.type === "header")).toBe(true);
    expect(data.blocks?.some((b) => b.type === "paragraph")).toBe(true);
  });
});

describe("serializeEditorJs", () => {
  it("stores blocks as JSON", () => {
    const json = serializeEditorJs({
      blocks: [{ type: "paragraph", data: { text: "x" } }],
    });
    expect(JSON.parse(json)).toEqual({
      blocks: [{ type: "paragraph", data: { text: "x" } }],
    });
  });

  it("matches empty constant shape", () => {
    expect(serializeEditorJs({ blocks: [] })).toBe(EMPTY_EDITOR_JS);
  });
});

describe("markdownToEditorJs", () => {
  it("maps code fences to code blocks, normalizing the language", () => {
    const data = markdownToEditorJs("```ts\nconst x = 1\n```");
    expect(data.blocks?.[0]).toMatchObject({
      type: "code",
      data: { code: "const x = 1", language: "typescript" },
    });
  });

  it("defaults fences without a language to GDScript", () => {
    const data = markdownToEditorJs("```\nfunc _ready():\n```");
    expect(data.blocks?.[0]).toMatchObject({
      type: "code",
      data: { code: "func _ready():", language: "gdscript" },
    });
  });

  it("converts **bold** inline markup to HTML in paragraphs", () => {
    const data = markdownToEditorJs("**Hello** world");
    expect(data.blocks?.[0]).toMatchObject({
      type: "paragraph",
      data: { text: "<b>Hello</b> world" },
    });
  });
});
