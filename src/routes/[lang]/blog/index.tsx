import type { RouteComponent } from "@emberkit/core";
import { getCurrentLanguage } from "../../../i18n/i18n.ts";
import BlogIndex from "../../../components/blog/BlogIndex.tsx";

const BlogIndexRoute: RouteComponent = (props) => {
  const lang = props.params.lang || getCurrentLanguage();
  return <BlogIndex lang={lang} />;
};

export default BlogIndexRoute;
