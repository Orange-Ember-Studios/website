import AdminShell from "../../../components/Admin/AdminShell.tsx";
import PostEditor from "../../../components/Admin/PostEditor.tsx";
import type { RouteComponent } from "@emberkit/core";

const AdminBlogEdit: RouteComponent = (props) => {
  const postId = props.params.id === "new" ? null : props.params.id;
  return (
    <AdminShell section="blog" title={postId ? "Edit Post" : "New Post"}>
      <PostEditor postId={postId} type="blog" section="blog" />
    </AdminShell>
  );
};

export default AdminBlogEdit;
