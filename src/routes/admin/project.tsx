import AdminShell from "../../components/Admin/AdminShell.tsx";
import PostList from "../../components/Admin/PostList.tsx";
import type { RouteComponent } from "@emberkit/core";

const AdminProject: RouteComponent = () => (
  <AdminShell section="project" title="Projects">
    <PostList postType="project" section="project" />
  </AdminShell>
);

export default AdminProject;
