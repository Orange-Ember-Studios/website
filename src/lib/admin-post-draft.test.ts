import { describe, it, expect } from "vitest";
import { reactive } from "vue";
import {
  cloneAdminPostDraft,
  emptyAdminPostDraft,
  setDraftTranslationPublished,
  toAdminPostDraft,
} from "./admin-post-draft.ts";

describe("emptyAdminPostDraft", () => {
  it("creates a blank draft with one translation per language", () => {
    const draft = emptyAdminPostDraft("case_study");
    expect(draft.id).toBe("new");
    expect(draft.type).toBe("case_study");
    expect(draft.translations.map((t) => t.lang)).toEqual(["en", "es", "fr"]);
    expect(draft.translations.every((t) => t.content === '{"blocks":[]}')).toBe(
      true,
    );
  });
});

describe("toAdminPostDraft", () => {
  it("falls back to a blank draft when the row is missing", () => {
    expect(toAdminPostDraft(null, "blog")).toEqual(emptyAdminPostDraft("blog"));
  });

  it("maps a db row and fills in the missing languages", () => {
    const draft = toAdminPostDraft(
      {
        id: "p1",
        slug: "my-post",
        type: "blog",
        author: "Jose",
        image: null,
        translations: [
          {
            lang: "en",
            title: "Hello",
            content: '{"blocks":[{"type":"paragraph"}]}',
            published: 1,
          },
        ],
      },
      "blog",
    );

    expect(draft).toEqual({
      id: "p1",
      slug: "my-post",
      type: "blog",
      author: "Jose",
      image: "",
      translations: [
        {
          lang: "en",
          title: "Hello",
          content: '{"blocks":[{"type":"paragraph"}]}',
          published: true,
        },
        { lang: "es", title: "", content: '{"blocks":[]}', published: false },
        { lang: "fr", title: "", content: '{"blocks":[]}', published: false },
      ],
    });
  });

  it("keeps the section type when the row has none", () => {
    const draft = toAdminPostDraft({ id: "p2", slug: "s" }, "project");
    expect(draft.type).toBe("project");
  });

  it("replaces blank stored content with an empty editor document", () => {
    const draft = toAdminPostDraft(
      {
        id: "p3",
        slug: "s",
        type: "blog",
        translations: [{ lang: "en", title: "T", content: "   " }],
      },
      "blog",
    );
    expect(draft.translations[0].content).toBe('{"blocks":[]}');
  });
});

describe("setDraftTranslationPublished", () => {
  it("toggles the flag for the given language only", () => {
    const draft = emptyAdminPostDraft("blog");
    const next = setDraftTranslationPublished(draft, "es", true);

    expect(next.translations.find((t) => t.lang === "es")?.published).toBe(true);
    expect(next.translations.find((t) => t.lang === "en")?.published).toBe(false);
  });

  it("does not mutate the original draft", () => {
    const draft = emptyAdminPostDraft("blog");
    setDraftTranslationPublished(draft, "en", true);
    expect(draft.translations[0].published).toBe(false);
  });

  it("creates the translation when the language is missing", () => {
    const draft = {
      ...emptyAdminPostDraft("blog"),
      translations: [
        { lang: "en", title: "T", content: "{}", published: false },
      ],
    };
    const next = setDraftTranslationPublished(draft, "fr", true);
    expect(next.translations).toHaveLength(2);
    expect(next.translations[1]).toEqual({
      lang: "fr",
      title: "",
      content: '{"blocks":[]}',
      published: true,
    });
  });
});

describe("cloneAdminPostDraft", () => {
  it("deep-copies the draft without sharing translation references", () => {
    const draft = emptyAdminPostDraft("blog");
    const copy = cloneAdminPostDraft(draft);

    copy.translations[0].title = "Changed";
    expect(draft.translations[0].title).toBe("");
    expect(copy.translations).not.toBe(draft.translations);
  });

  it("clones a reactive proxy, unlike structuredClone", () => {
    const draft = reactive(emptyAdminPostDraft("blog"));
    expect(() => structuredClone(draft)).toThrow();
    expect(cloneAdminPostDraft(draft).translations).toHaveLength(3);
  });
});
