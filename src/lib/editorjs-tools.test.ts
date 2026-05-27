import { describe, expect, it } from "vitest";
import {
  EDITOR_JS_INLINE_HINTS,
  getEditorJsBlockTools,
  getEditorJsHeadingTools,
  getEditorJsToolbarTools,
  resolveImageInsertData,
} from "./editorjs-tools.ts";

describe("getEditorJsHeadingTools", () => {
  it("includes H1 through H3 in minimal mode", () => {
    const tools = getEditorJsHeadingTools(true);
    expect(tools.map((t) => t.id)).toEqual(["header-1", "header-2", "header-3"]);
  });

  it("includes H4 in full mode", () => {
    const tools = getEditorJsHeadingTools(false);
    expect(tools.map((t) => t.id)).toContain("header-4");
    expect(tools[0]?.defaultData).toEqual({ text: "", level: 1 });
  });
});

describe("getEditorJsBlockTools", () => {
  it("returns a reduced set for minimal editors", () => {
    const tools = getEditorJsBlockTools(true);
    expect(tools.map((t) => t.id)).toEqual(["list-unordered", "quote"]);
  });

  it("includes extended blocks for full editors", () => {
    const tools = getEditorJsBlockTools(false);
    expect(tools.map((t) => t.id)).toContain("code");
    expect(tools.map((t) => t.id)).toContain("image");
    expect(tools.map((t) => t.id)).toContain("delimiter");
  });
});

describe("getEditorJsToolbarTools", () => {
  it("combines headings and blocks", () => {
    const tools = getEditorJsToolbarTools(true);
    expect(tools[0]?.id).toBe("header-1");
    expect(tools.map((t) => t.id)).toContain("quote");
  });
});

describe("resolveImageInsertData", () => {
  it("wraps the URL for the image tool", () => {
    expect(resolveImageInsertData(" https://cdn.example/a.png ")).toEqual({
      file: { url: "https://cdn.example/a.png" },
      caption: "",
    });
  });
});

describe("EDITOR_JS_INLINE_HINTS", () => {
  it("documents inline formatting shortcuts", () => {
    expect(EDITOR_JS_INLINE_HINTS.length).toBeGreaterThanOrEqual(3);
    expect(EDITOR_JS_INLINE_HINTS[0]?.shortcut).toBeTruthy();
  });
});
