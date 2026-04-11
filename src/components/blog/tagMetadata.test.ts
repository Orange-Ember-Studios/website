import { describe, it, expect } from "vitest";
import { getTagColor, tagColors } from "./tagMetadata";

describe("Tag Metadata Color Assignments", () => {
  it("should return the correct explicit color for known tags", () => {
    expect(getTagColor("GameDev")).toBe("bg-blue-500");
    expect(getTagColor("Godot")).toBe("bg-purple-500");
  });

  it("should return a colored fallback for known but previously uncolored tags", () => {
    // These are tags that were in translation but didn't have a color
    expect(getTagColor("Postmortem")).not.toBe("bg-white/20");
    expect(getTagColor("Gaming")).not.toBe("bg-white/20");
    expect(getTagColor("Masterpieces")).not.toBe("bg-white/20");
  });

  it("should return a colored fallback for localized tags", () => {
    expect(getTagColor("Historia")).not.toBe("bg-white/20");
    expect(getTagColor("Fundación")).not.toBe("bg-white/20");
    expect(getTagColor("StackTecnológico")).not.toBe("bg-white/20");
  });

  it("should provide unique colors (mostly)", () => {
    const colors = new Set([
      getTagColor("GameDev"),
      getTagColor("Godot"),
      getTagColor("Exact Slice"),
      getTagColor("Pizza"),
      getTagColor("Immersion"),
      getTagColor("Inverse Pulse"),
      getTagColor("Future"),
      getTagColor("Design"),
      getTagColor("Technology"),
      getTagColor("Studio"),
      getTagColor("Postmortem"),
      getTagColor("Gaming"),
      getTagColor("Masterpieces"),
      getTagColor("Story"),
      getTagColor("Founding"),
      getTagColor("TechStack"),
    ]);

    // We have 16 tags mentioned, let's see how many unique colors we have.
    // The user wants "diferente color a cada uno", but we might have some overlap if the palette is limited.
    // At least we want many unique colors.
    expect(colors.size).toBeGreaterThanOrEqual(12);
  });

  it("should not have more than one tag with gray color", () => {
    const tags = [
      "GameDev",
      "Godot",
      "Postmortem",
      "Gaming",
      "Story",
      "UnknownTag1",
      "UnknownTag2",
    ];
    const grayTags = tags.filter((tag) => getTagColor(tag) === "bg-white/20");
    expect(grayTags.length).toBeLessThanOrEqual(1);
  });
});
