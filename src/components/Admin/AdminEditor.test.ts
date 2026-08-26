import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import AdminEditor from "./AdminEditor.vue";
import { emptyAdminPostDraft, toAdminPostDraft } from "../../lib/admin-post-draft.ts";

const existingDraft = toAdminPostDraft(
  {
    id: "p1",
    slug: "my-post",
    type: "blog",
    author: "Jose",
    translations: [
      { lang: "en", title: "Hello", content: '{"blocks":[]}', published: 1 },
    ],
  },
  "blog",
);

function mountEditor(post = existingDraft) {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  const wrapper = mount(AdminEditor, {
    attachTo: document.body,
    props: { post, section: "blog", onClose, onSaved },
  });
  return { wrapper, onClose, onSaved };
}

let fetchMock: ReturnType<typeof vi.fn>;

describe("AdminEditor navigation", () => {
  beforeEach(() => {
    fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: "p1" }),
    })) as unknown as ReturnType<typeof vi.fn>;
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("confirm", vi.fn(() => true));
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("shows a labelled back action for the current section", () => {
    const { wrapper } = mountEditor();
    const back = wrapper.get('button[aria-label="Back to Blog Posts"]');
    expect(back.text()).toContain("Blog Posts");
  });

  it("leaves without confirmation when nothing changed", async () => {
    const { wrapper, onClose } = mountEditor();
    await wrapper.get('button[aria-label="Back to Blog Posts"]').trigger("click");
    expect(window.confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("flags unsaved changes and asks before discarding them", async () => {
    const { wrapper, onClose } = mountEditor();

    await wrapper.get('input[name="slug"]').setValue("changed-slug");
    expect(wrapper.text()).toContain("Unsaved changes");

    vi.mocked(window.confirm).mockReturnValueOnce(false);
    await wrapper.get('button[aria-label="Back to Blog Posts"]').trigger("click");
    expect(onClose).not.toHaveBeenCalled();

    vi.mocked(window.confirm).mockReturnValueOnce(true);
    await wrapper.get('button[aria-label="Back to Blog Posts"]').trigger("click");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("saves with PUT and stays in the editor showing feedback", async () => {
    const { wrapper, onSaved } = mountEditor();

    await wrapper.get('input[name="slug"]').setValue("changed-slug");
    const saveButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Save Post"))!;
    await saveButton.trigger("click");
    await flushPromises();

    const [url, init] = fetchMock.mock.calls.at(-1)!;
    expect(url).toBe("/api/admin/posts/p1");
    expect((init as RequestInit).method).toBe("PUT");
    expect(onSaved).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Saved");
    expect(wrapper.text()).not.toContain("Unsaved changes");
  });

  it("closes after a successful save & close", async () => {
    const { wrapper, onSaved } = mountEditor();

    const button = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Save & close"))!;
    await button.trigger("click");
    await flushPromises();

    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("keeps the editor open on a failed save", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Boom" }),
    });
    const { wrapper, onSaved } = mountEditor();

    const button = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Save & close"))!;
    await button.trigger("click");
    await flushPromises();

    expect(onSaved).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Boom");
  });

  it("turns a new post into an existing one after the first save", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: "created-id" }),
    });

    const { wrapper } = mountEditor({
      ...emptyAdminPostDraft("blog"),
      slug: "fresh",
      author: "Jose",
    });

    const save = () =>
      wrapper
        .findAll("button")
        .find((b) => b.text().includes("Save Post"))!
        .trigger("click");

    await save();
    await flushPromises();

    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/posts");
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe("POST");
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      "",
      "/admin/blog/created-id",
    );

    await save();
    await flushPromises();

    expect(fetchMock.mock.calls[1][0]).toBe("/api/admin/posts/created-id");
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe("PUT");
  });
});
