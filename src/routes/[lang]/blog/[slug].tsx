import type { RouteComponent } from "@emberkit/core";
import BlogPost from "../../../components/blog/BlogPost.tsx";

const BlogPostRoute: RouteComponent = (props) => {
  const lang = props.params.lang ?? "en";
  const slug = props.params.slug ?? "";
  return <BlogPost lang={lang} slug={slug} />;
};

export default BlogPostRoute;
