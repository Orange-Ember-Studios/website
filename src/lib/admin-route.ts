export const ADMIN_SECTIONS = [
  "blog",
  "project",
  "case_study",
  "profile",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export interface AdminRoute {
  section: AdminSection;
  postId?: string;
}

function isSection(value: string): value is AdminSection {
  return (ADMIN_SECTIONS as readonly string[]).includes(value);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Maps the `/admin/[...path]` catch-all param to the section and (optional)
 * post id the dashboard has to render.
 */
export function parseAdminPath(path?: string | null): AdminRoute {
  const segments = String(path ?? "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  const rawSection = segments[0] ?? "";
  if (!isSection(rawSection)) return { section: "blog" };

  const section: AdminSection = rawSection;
  if (section === "profile") return { section };

  const rawId = segments[1];
  if (!rawId) return { section };

  return { section, postId: safeDecode(rawId) };
}
