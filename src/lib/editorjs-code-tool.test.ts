import { describe, it, expect } from "vitest";
import { CodeBlockTool } from "./editorjs-code-tool.ts";
import { CODE_LANGUAGES } from "./editorjs-code-languages.ts";

function renderTool(data?: { code?: string; language?: string }) {
  const tool = new CodeBlockTool({ data });
  const el = tool.render();
  const select = el.querySelector("select") as HTMLSelectElement;
  const textarea = el.querySelector("textarea") as HTMLTextAreaElement;
  return { tool, el, select, textarea };
}

describe("CodeBlockTool", () => {
  it("renders a language selector with every supported language", () => {
    const { select } = renderTool();
    expect(select.options).toHaveLength(CODE_LANGUAGES.length);
    expect([...select.options].map((o) => o.value)).toContain("gdscript");
  });

  it("defaults new blocks to GDScript", () => {
    const { select, tool } = renderTool();
    expect(select.value).toBe("gdscript");
    expect(tool.save().language).toBe("gdscript");
  });

  it("preselects the stored language", () => {
    const { select } = renderTool({ code: "int x;", language: "cpp" });
    expect(select.value).toBe("cpp");
  });

  it("normalizes legacy/aliased stored languages", () => {
    const { select } = renderTool({ code: "x = 1", language: "py" });
    expect(select.value).toBe("python");
  });

  it("saves the code and the chosen language", () => {
    const { tool, select, textarea } = renderTool();
    textarea.value = "extends Node";
    select.value = "gdscript";
    expect(tool.save()).toEqual({ code: "extends Node", language: "gdscript" });

    select.value = "csharp";
    select.dispatchEvent(new Event("change"));
    expect(tool.save().language).toBe("csharp");
  });

  it("keeps existing content when re-rendered", () => {
    const { textarea } = renderTool({ code: "func _ready():", language: "gdscript" });
    expect(textarea.value).toBe("func _ready():");
  });

  it("treats a block without code as invalid", () => {
    const tool = new CodeBlockTool();
    expect(tool.validate({ code: "   ", language: "gdscript" })).toBe(false);
    expect(tool.validate({ code: "print()", language: "gdscript" })).toBe(true);
  });

  it("indents with a tab instead of losing focus", () => {
    const { tool, textarea } = renderTool();
    textarea.value = "func a():";
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    textarea.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(tool.save().code).toBe("func a():\t");
  });
});
