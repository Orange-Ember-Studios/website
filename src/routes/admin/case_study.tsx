import AdminShell from "../../components/Admin/AdminShell.tsx";
import PostList from "../../components/Admin/PostList.tsx";
import type { RouteComponent } from "@emberkit/core";

const AdminCaseStudy: RouteComponent = () => (
  <AdminShell section="case_study" title="Case Studies">
    <PostList postType="case_study" section="case_study" />
  </AdminShell>
);

export default AdminCaseStudy;
