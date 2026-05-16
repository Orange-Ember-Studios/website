import AdminShell from "../../components/Admin/AdminShell.tsx";
import AdminProfile from "../../components/Admin/AdminProfile.tsx";
import type { RouteComponent } from "@emberkit/core";

const AdminProfileRoute: RouteComponent = () => (
  <AdminShell section="profile" title="Profile">
    <AdminProfile />
  </AdminShell>
);

export default AdminProfileRoute;
