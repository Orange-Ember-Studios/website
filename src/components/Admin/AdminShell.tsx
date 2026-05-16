import {
  createElement,
  createSignal,
  createEffect,
  navigate,
} from "@emberkit/core";
import {
  IconBook,
  IconFile,
  IconImage,
  IconLogOut,
  IconMenu,
  IconUser,
  IconX,
} from "@emberkit/icons";

interface AdminShellProps {
  section: "blog" | "project" | "case_study" | "profile";
  title: string;
  children: any;
}

const navItems = [
  { id: "blog", label: "Blog Posts", href: "/admin/blog", Icon: IconBook },
  { id: "project", label: "Projects", href: "/admin/project", Icon: IconImage },
  { id: "case_study", label: "Case Studies", href: "/admin/case_study", Icon: IconFile },
] as const;

const sectionLabels: Record<string, string> = {
  blog: "Blog Posts",
  project: "Projects",
  case_study: "Case Studies",
  profile: "Profile",
};

export default function AdminShell(props: AdminShellProps) {
  const authSignal = createSignal(false);
  const authChecked = authSignal[0];
  const setAuthChecked = authSignal[1];

  const menuSignal = createSignal(false);
  const mobileOpen = menuSignal[0];

  const toggleMobile = () => {
    menuSignal.value = !menuSignal.peek();
  };

  const closeMobile = () => {
    menuSignal.value = false;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/admin/login", { replace: true });
  };

  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAuthChecked(true);
      } catch {
        navigate("/admin/login", { replace: true });
      }
    })();
  });

  const isActive = (id: string) => props.section === id;

  return (
    <>
      {/* Auth-checking spinner */}
      <div
        data-ek-bind={authChecked}
        data-ek-show-when="false"
        data-ek-hide-class="hidden"
        className="min-h-screen bg-neutral-950 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4" />
          <p className="text-neutral-400 text-sm">Verifying session…</p>
        </div>
      </div>

      {/* Authenticated shell */}
      <div
        data-ek-bind={authChecked}
        data-ek-show-when="true"
        data-ek-hide-class="hidden"
        className="admin-page min-h-screen bg-neutral-950 text-neutral-200 flex hidden"
      >
        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-30 bg-slate-900 border-r border-neutral-800">
          <div className="p-6 border-b border-neutral-800">
            <h1 className="text-xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              OE Studios
            </h1>
            <p className="text-[11px] text-neutral-500 mt-1 tracking-wide uppercase">
              Content Manager
            </p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={
                  isActive(item.id)
                    ? "flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-orange-500/10 text-orange-400 font-medium border-l-2 border-orange-500"
                    : "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-neutral-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }
              >
                <item.Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="p-3 border-t border-neutral-800 space-y-1">
            <a
              href="/admin/profile"
              className={
                isActive("profile")
                  ? "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all bg-orange-500/10 text-orange-400 font-medium"
                  : "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-neutral-400 hover:text-white hover:bg-white/5"
              }
            >
              <IconUser className="w-5 h-5 shrink-0" />
              <span>Profile</span>
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-all text-neutral-400 hover:text-red-400 hover:bg-red-500/5"
            >
              <IconLogOut className="w-5 h-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── Mobile menu overlay ── */}
        <div
          data-ek-bind={mobileOpen}
          data-ek-show-when="true"
          data-ek-hide-class="hidden"
          className="fixed inset-0 z-40 md:hidden hidden"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />

          <aside className="absolute inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <h1 className="text-xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                OE Studios
              </h1>
              <button
                type="button"
                onClick={closeMobile}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={
                    isActive(item.id)
                      ? "flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-orange-500/10 text-orange-400 font-medium"
                      : "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-neutral-400 hover:text-white hover:bg-white/5"
                  }
                >
                  <item.Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="p-3 border-t border-neutral-800 space-y-1">
              <a
                href="/admin/profile"
                className={
                  isActive("profile")
                    ? "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all bg-orange-500/10 text-orange-400 font-medium"
                    : "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-neutral-400 hover:text-white hover:bg-white/5"
                }
              >
                <IconUser className="w-5 h-5 shrink-0" />
                <span>Profile</span>
              </a>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-all text-neutral-400 hover:text-red-400 hover:bg-red-500/5"
              >
                <IconLogOut className="w-5 h-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>

        {/* ── Main content area ── */}
        <div className="flex-1 flex flex-col min-h-screen md:ml-64">
          {/* Header */}
          <header className="h-16 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMobile}
                className="md:hidden p-2 -ml-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <IconMenu className="w-5 h-5" />
              </button>

              <nav className="flex items-center gap-2 text-sm">
                <a
                  href="/admin"
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Admin
                </a>
                <span className="text-neutral-700">/</span>
                <span className="text-neutral-300 font-medium">
                  {sectionLabels[props.section] ?? props.section}
                </span>
                {props.title !== sectionLabels[props.section] ? (
                  <>
                    <span className="text-neutral-700 hidden sm:inline">/</span>
                    <span className="text-white font-semibold truncate max-w-[200px] hidden sm:inline">
                      {props.title}
                    </span>
                  </>
                ) : null}
              </nav>
            </div>

            <span className="hidden sm:inline-block text-xs text-neutral-500 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-800">
              {sectionLabels[props.section]}
            </span>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-neutral-950 text-neutral-200">
            {props.children}
          </main>
        </div>
      </div>
    </>
  );
}
