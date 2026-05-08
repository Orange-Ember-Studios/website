/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from "vitest";
import BlogLayout from "./BlogLayout.astro";
import { createAstroContainer, setupDOMEnvironment } from "../test-utils";

describe("Blog Layout", () => {
  let container: any;
  let document: any;

  beforeEach(async () => {
    container = await createAstroContainer();
    const { document: doc } = setupDOMEnvironment();
    document = doc;
  });

  it("should render the blog post title", async () => {
    const result = await container.renderToString(BlogLayout, {
      props: {
        frontmatter: {
          title: "My Awesome Blog Post",
          description: "A description of the post",
          pubDate: "2024-03-20",
          author: "Orange Ember",
          image: "/blog-placeholder.jpg"
        }
      },
    });

    expect(result).includes("My Awesome Blog Post");
  });

  it("should include the author name", async () => {
    const result = await container.renderToString(BlogLayout, {
      props: {
        frontmatter: {
          title: "Test Post",
          pubDate: "2024-03-20",
          author: "Admin",
        }
      },
    });

    expect(result).includes("Admin");
  });

  it("should render an article tag for the content", async () => {
    const result = await container.renderToString(BlogLayout, {
      props: {
        frontmatter: {
          title: "Test Post",
          pubDate: "2024-03-20",
        }
      },
    });

    expect(result).includes("<article");
  });

  it("should render like and share controls", async () => {
    const result = await container.renderToString(BlogLayout, {
      props: {
        postId: "en/test-post",
        frontmatter: {
          title: "Test Post",
          pubDate: "2024-03-20",
          author: "Admin",
        }
      },
    });

    expect(result).includes("data-blog-like-button");
    expect(result).includes("/api/posts/en/test-post/likes");
    expect(result).includes("https://x.com/intent/tweet");
    expect(result).includes("https://www.linkedin.com/sharing/share-offsite/");
    expect(result).includes("https://wa.me/");
  });
});
