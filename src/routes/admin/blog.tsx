import AdminShell from "../../components/Admin/AdminShell.tsx";
import PostList from "../../components/Admin/PostList.tsx";
import type { RouteComponent } from "@emberkit/core";

const AdminBlog: RouteComponent = () => (
  <AdminShell section="blog" title="Blog Posts">
    <PostList postType="blog" section="blog" />
  </AdminShell>
);

export default AdminBlog;
