import { describe, it, expect } from "vitest";
import { parseAdminPath } from "./admin-route.ts";

describe("parseAdminPath", () => {
  it("defaults to the blog list when no path is given", () => {
    expect(parseAdminPath(undefined)).toEqual({ section: "blog" });
    expect(parseAdminPath("")).toEqual({ section: "blog" });
    expect(parseAdminPath("/")).toEqual({ section: "blog" });
  });

  it("resolves each known section", () => {
    expect(parseAdminPath("blog")).toEqual({ section: "blog" });
    expect(parseAdminPath("project")).toEqual({ section: "project" });
    expect(parseAdminPath("case_study")).toEqual({ section: "case_study" });
    expect(parseAdminPath("profile")).toEqual({ section: "profile" });
  });

  it("falls back to blog for unknown sections", () => {
    expect(parseAdminPath("unknown/thing")).toEqual({ section: "blog" });
  });

  it("extracts the post id for editor routes", () => {
    expect(parseAdminPath("blog/new")).toEqual({
      section: "blog",
      postId: "new",
    });
    expect(parseAdminPath("case_study/abc-123")).toEqual({
      section: "case_study",
      postId: "abc-123",
    });
  });

  it("ignores an id segment for the profile section", () => {
    expect(parseAdminPath("profile/anything")).toEqual({ section: "profile" });
  });

  it("tolerates leading/trailing slashes and url encoding", () => {
    expect(parseAdminPath("/project/my%20id/")).toEqual({
      section: "project",
      postId: "my id",
    });
  });
});
