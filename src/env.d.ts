/// <reference types="@emberkit/core" />

declare global {
  namespace JSX {
    interface Element {
      type: string;
      props: Record<string, unknown>;
    }
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }
  }
}

declare module 'virtual:emberkit-routes' {
  import type { RouteComponent } from '@emberkit/core';

  type RouteModuleLoader = () => Promise<{ default: RouteComponent }>;

  export const routes: Array<{ path: string; component: RouteModuleLoader }>;
  export const notFoundRoute: RouteModuleLoader;
  export const errorRoute: RouteModuleLoader;
  export const rootLayout: RouteModuleLoader | null;
}

declare module 'virtual:emberkit-config' {
  import type { EmberKitConfig } from '@emberkit/core';
  export const config: EmberKitConfig;
}

export {};
