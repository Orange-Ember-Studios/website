/// <reference types="vite/client" />

declare module "virtual:emberkit-routes" {
  export const routes: Array<{
    path: string;
    component: () => Promise<{ default: (props: Record<string, unknown>) => unknown }>;
  }>;
  export const notFoundRoute: (() => Promise<{ default: unknown }>) | null;
  export const errorRoute: (() => Promise<{ default: unknown }>) | null;
}
