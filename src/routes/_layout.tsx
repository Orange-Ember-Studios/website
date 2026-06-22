import { createEffect } from "@emberkit/core";
import { initI18n } from "../i18n/i18n.ts";
import { initPremiumSelects } from "../components/ui/premium-select-init.ts";
import Navbar from "../components/Navigation/Navbar.tsx";
import Footer from "../components/Navigation/Footer.tsx";
import type { RouteComponent, JSXNode } from "@emberkit/core";

function resolvePathname(prop: unknown): string {
  if (typeof prop === "string" && prop) return prop;
  if (typeof window !== "undefined") return window.location.pathname ?? "";
  return "";
}

const RootLayout: RouteComponent<{
  children?: JSXNode | JSXNode[];
  pathname?: string;
}> = ({ children, pathname: pathnameProp }) => {
  // `createEffect` skips on the server automatically, so it's safe to
  // register here for both SSR and client renders.
  createEffect(() => {
    queueMicrotask(() => {
      initI18n();
      initPremiumSelects();
    });
  });

  const path = resolvePathname(pathnameProp);
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
