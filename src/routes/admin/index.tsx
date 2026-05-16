import { createEffect } from "@emberkit/core";
import { navigate } from "@emberkit/core";
import type { RouteComponent } from "@emberkit/core";

const AdminIndex: RouteComponent = () => {
  createEffect(() => {
    navigate("/admin/blog", { replace: true });
  });
  return null;
};

export default AdminIndex;
