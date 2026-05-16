import AdminShell from "../../../components/Admin/AdminShell.tsx";
import PostEditor from "../../../components/Admin/PostEditor.tsx";
import type { RouteComponent } from "@emberkit/core";

const AdminProjectEdit: RouteComponent = (props) => {
  const postId = props.params.id === "new" ? null : props.params.id;
  return (
    <AdminShell section="project" title={postId ? "Edit Project" : "New Project"}>
      <PostEditor postId={postId} type="project" section="project" />
    </AdminShell>
  );
};

export default AdminProjectEdit;
