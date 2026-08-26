import { describe, it, expect } from "vitest";
import { mapPortfolioProjects, type PortfolioPostRow } from "./map-portfolio.ts";

describe("mapPortfolioProjects", () => {
  const rows: PortfolioPostRow[] = [
    {
      id: "ember-quest",
      data: {
        title: "Ember Quest",
        image: "/projects/photo-1504384308090-c894fdcc538d.avif",
        meta: {
          category: "Desktop Game",
          status: "In Development",
          description: "A fantasy RPG.",
          link: "https://example.com",
        },
      },
    },
    {
      id: "es/ember-quest",
      data: {
        title: "Ember Quest ES",
        image: "/projects/photo-1504384308090-c894fdcc538d.avif",
        meta: {
          category: "Juego de escritorio",
          status: "En desarrollo",
          description: "Un RPG.",
          link: "",
        },
      },
    },
  ];

  it("returns English projects for en", () => {
    const mapped = mapPortfolioProjects(rows, "en");
    expect(mapped).toHaveLength(1);
    expect(mapped[0].title).toBe("Ember Quest");
    expect(mapped[0].isExternal).toBe(true);
    expect(mapped[0].link).toBe("https://example.com");
  });

  it("returns localized projects for es", () => {
    const mapped = mapPortfolioProjects(rows, "es");
    expect(mapped).toHaveLength(1);
    expect(mapped[0].id).toBe("es/ember-quest");
    expect(mapped[0].link).toBe("/es/projects/ember-quest");
  });
});

describe("mapPortfolioProjects descriptions", () => {
  it("renders Editor.js descriptions as plain text", () => {
    const mapped = mapPortfolioProjects(
      [
        {
          id: "ember-forge",
          data: {
            title: "Ember Forge",
            meta: {
              category: "Desktop Game",
              status: "In Development",
              description: JSON.stringify({
                blocks: [
                  {
                    type: "paragraph",
                    data: { text: "A cozy <b>roguelike</b> about a forge." },
                  },
                  { type: "paragraph", data: { text: "Second paragraph." } },
                ],
              }),
              link: "",
            },
          },
        },
      ],
      "en",
    );

    expect(mapped[0].description).toBe(
      "A cozy roguelike about a forge. Second paragraph.",
    );
  });

  it("keeps plain text descriptions untouched", () => {
    const mapped = mapPortfolioProjects(
      [
        {
          id: "p",
          data: { title: "P", meta: { description: "Just text." } },
        },
      ],
      "en",
    );
    expect(mapped[0].description).toBe("Just text.");
  });

  it("falls back to the post description when meta has none", () => {
    const mapped = mapPortfolioProjects(
      [{ id: "p", data: { title: "P", description: "From excerpt." } }],
      "en",
    );
    expect(mapped[0].description).toBe("From excerpt.");
  });
});
