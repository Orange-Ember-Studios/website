import AdminShell from "../../../components/Admin/AdminShell.tsx";
import PostEditor from "../../../components/Admin/PostEditor.tsx";
import type { RouteComponent } from "@emberkit/core";

const AdminCaseStudyEdit: RouteComponent = (props) => {
  const postId = props.params.id === "new" ? null : props.params.id;
  return (
    <AdminShell section="case_study" title={postId ? "Edit Case Study" : "New Case Study"}>
      <PostEditor postId={postId} type="case_study" section="case_study" />
    </AdminShell>
  );
};

export default AdminCaseStudyEdit;
