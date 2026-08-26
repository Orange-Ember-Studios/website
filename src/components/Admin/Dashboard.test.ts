import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Dashboard from "./Dashboard.vue";

const POST = {
  id: "p1",
  slug: "my-post",
  type: "blog",
  author: "Jose",
  image: "",
  created_at: "2026-01-01 10:00:00",
  updated_at: "2026-01-01 10:00:00",
  translations: [
    {
      lang: "en",
      title: "Hello world",
      content: '{"blocks":[{"type":"paragraph","data":{"text":"Body"}}]}',
      published: 1,
    },
  ],
};

function mockFetch(handler: (url: string) => unknown) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = handler(url);
    return {
      ok: true,
      status: 200,
      json: async () => body,
    } as unknown as Response;
  });
}

describe("Dashboard editor route", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      mockFetch((url) => {
        if (url.includes("/api/auth/me")) return { user: { username: "admin" } };
        if (url.includes("/api/admin/posts/p1")) return POST;
        return [];
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the editor for an existing post", async () => {
    const wrapper = mount(Dashboard, {
      props: { section: "blog", postId: "p1" },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.find("#admin-editor-form").exists()).toBe(true);
    expect(
      (wrapper.find('input[name="slug"]').element as HTMLInputElement).value,
    ).toBe("my-post");
    expect(
      (wrapper.find('input[name="post-title"]').element as HTMLInputElement)
        .value,
    ).toBe("Hello world");
    expect(wrapper.text()).not.toContain("Verifying session");
    // Editor.js toolbar (headings/blocks/inline) must render too
    expect(wrapper.find(".editorjs-tools-header").exists()).toBe(true);
    expect(wrapper.findAll(".editorjs-tool-btn").length).toBeGreaterThan(0);
  });

  it("renders an empty editor for the /new route", async () => {
    const wrapper = mount(Dashboard, {
      props: { section: "case_study", postId: "new" },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.find("#admin-editor-form").exists()).toBe(true);
    expect(
      (wrapper.find('input[name="slug"]').element as HTMLInputElement).value,
    ).toBe("");
  });

  it("renders the list when no postId is given", async () => {
    const wrapper = mount(Dashboard, { props: { section: "project" } });

    await flushPromises();
    await flushPromises();

    expect(wrapper.find("#admin-editor-form").exists()).toBe(false);
    expect(wrapper.text()).toContain("Projects");
  });

  it("renders the project editor with its metadata fields", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch((url) => {
        if (url.includes("/api/auth/me")) return { user: { username: "admin" } };
        if (url.includes("/api/admin/posts/p2")) {
          return {
            ...POST,
            id: "p2",
            type: "project",
            translations: [
              {
                lang: "en",
                title: "Ember Forge",
                content: JSON.stringify({
                  category: "Mobile Game",
                  status: "Coming Soon",
                  description: '{"blocks":[]}',
                  link: "https://example.com",
                }),
                published: 1,
              },
            ],
          };
        }
        return [];
      }),
    );

    const wrapper = mount(Dashboard, {
      props: { section: "project", postId: "p2" },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.find('select[name="project-category-en"]').exists()).toBe(true);
    expect(
      (wrapper.find('input[name="project-link-en"]').element as HTMLInputElement)
        .value,
    ).toBe("https://example.com");
  });

  it("exposes a publish toggle for the active language", async () => {
    const wrapper = mount(Dashboard, {
      props: { section: "blog", postId: "p1" },
    });

    await flushPromises();
    await flushPromises();

    const toggle = wrapper.find('input[type="checkbox"]');
    expect(toggle.exists()).toBe(true);
    expect((toggle.element as HTMLInputElement).checked).toBe(true);
    expect(wrapper.text()).toContain("Published (EN)");
  });

  it("shows an error state when the post cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/auth/me")) {
          return { ok: true, status: 200, json: async () => ({ user: {} }) } as Response;
        }
        return { ok: false, status: 404, json: async () => ({}) } as Response;
      }),
    );

    const wrapper = mount(Dashboard, {
      props: { section: "blog", postId: "missing" },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Post not found.");
  });
});
