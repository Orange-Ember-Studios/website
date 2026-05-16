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
