import { describe, it, expect } from "vitest";
import {
  CODE_LANGUAGES,
  DEFAULT_CODE_LANGUAGE,
  codeLanguageLabel,
  normalizeCodeLanguage,
} from "./editorjs-code-languages.ts";

describe("code languages", () => {
  it("offers GDScript first and as the default", () => {
    expect(DEFAULT_CODE_LANGUAGE).toBe("gdscript");
    expect(CODE_LANGUAGES[0]).toEqual({ id: "gdscript", label: "GDScript" });
  });

  it("defaults to GDScript for empty or unknown values", () => {
    expect(normalizeCodeLanguage(undefined)).toBe("gdscript");
    expect(normalizeCodeLanguage("")).toBe("gdscript");
    expect(normalizeCodeLanguage("klingon")).toBe("gdscript");
  });

  it("resolves aliases and casing", () => {
    expect(normalizeCodeLanguage("GD")).toBe("gdscript");
    expect(normalizeCodeLanguage("godot")).toBe("gdscript");
    expect(normalizeCodeLanguage("C#")).toBe("csharp");
    expect(normalizeCodeLanguage("c++")).toBe("cpp");
    expect(normalizeCodeLanguage(" ts ")).toBe("typescript");
    expect(normalizeCodeLanguage("shell")).toBe("bash");
    expect(normalizeCodeLanguage("yml")).toBe("yaml");
    expect(normalizeCodeLanguage("plaintext")).toBe("text");
  });

  it("keeps supported ids untouched", () => {
    for (const lang of CODE_LANGUAGES) {
      expect(normalizeCodeLanguage(lang.id)).toBe(lang.id);
    }
  });

  it("exposes readable labels", () => {
    expect(codeLanguageLabel("gdscript")).toBe("GDScript");
    expect(codeLanguageLabel("csharp")).toBe("C#");
    expect(codeLanguageLabel("nope")).toBe("GDScript");
  });
});
