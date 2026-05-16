/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { detectLangFromRequest } from "./api-router.ts";

describe("detectLangFromRequest", () => {
  it("prefers x-language cookie when supported", () => {
    const req = new Request("https://example.com/", {
      headers: { cookie: "x-language=es" },
    });
    expect(detectLangFromRequest(req)).toBe("es");
  });

  it("falls back to Accept-Language for es/fr", () => {
    const reqEs = new Request("https://example.com/", {
      headers: { "accept-language": "es-ES,es;q=0.9" },
    });
    expect(detectLangFromRequest(reqEs)).toBe("es");
    const reqFr = new Request("https://example.com/", {
      headers: { "accept-language": "fr-FR,fr;q=0.9" },
    });
    expect(detectLangFromRequest(reqFr)).toBe("fr");
  });

  it("defaults to en", () => {
    const req = new Request("https://example.com/");
    expect(detectLangFromRequest(req)).toBe("en");
  });
});
