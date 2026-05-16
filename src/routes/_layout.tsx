import { createEffect } from "@emberkit/core";
import { initI18n } from "../i18n/i18n.ts";
import { initPremiumSelects } from "../components/ui/premium-select-init.ts";
import Navbar from "../components/Navigation/Navbar.tsx";
import Footer from "../components/Navigation/Footer.tsx";
import type { RouteComponent } from "@emberkit/core";

const RootLayout: RouteComponent = ({ children }) => {
  createEffect(() => {
    queueMicrotask(() => {
      initI18n();
      initPremiumSelects();
    });
  });

  const path =
    typeof window !== "undefined" ? window.location.pathname || "" : "";
  const isAdminShell =
    path.startsWith("/admin") && !path.startsWith("/admin/login");

  return (
    <>
      {!isAdminShell ? <Navbar /> : null}
      {children}
      {!isAdminShell ? <Footer /> : null}
    </>
  );
};

export default RootLayout;
