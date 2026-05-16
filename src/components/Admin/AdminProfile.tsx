import { createElement, createEffect, createSignal } from "@emberkit/core";
import { getTranslation } from "../../i18n/i18n.ts";

export default function AdminProfile() {
  const [user, setUser] = createSignal<{
    userId: string;
    username: string;
  } | null>(null);
  const [loadingUser, setLoadingUser] = createSignal(true);
  const [updating, setUpdating] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");

  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as {
            user: { userId: string; username: string };
          };
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUser(false);
      }
    })();
  });

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    const form = document.getElementById(
      "profile-password-form",
    ) as HTMLFormElement | null;
    if (!form) return;

    const fd = new FormData(form);
    const currentPw = String(fd.get("currentPassword") ?? "");
    const newPw = String(fd.get("newPassword") ?? "");
    const confirmPw = String(fd.get("confirmPassword") ?? "");

    if (newPw !== confirmPw) {
      setError(getTranslation("admin.profile.error_match"));
      return;
    }
    if (newPw.length < 6) {
      setError(getTranslation("admin.profile.error_length"));
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setSuccess(getTranslation("admin.profile.success"));
        form.reset();
      } else {
        setError(
          data.error || getTranslation("admin.profile.updatePassword"),
        );
      }
    } catch {
      setError(getTranslation("admin.profile.error_network"));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">
            {getTranslation("admin.profile.title")}
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            {getTranslation("admin.profile.subtitle")}
          </p>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-4">
              {getTranslation("admin.profile.basicInfo")}
            </h3>
            {loadingUser() ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {getTranslation("admin.login.username")}
                  </label>
                  <div className="text-white font-medium bg-neutral-950 px-4 py-2.5 rounded-lg border border-neutral-700">
                    {user()?.username || "..."}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    {getTranslation("admin.profile.userId")}
                  </label>
                  <div
                    className="text-neutral-400 text-sm bg-neutral-950 px-4 py-2.5 rounded-lg border border-neutral-700 font-mono truncate"
                    title={user()?.userId}
                  >
                    {user()?.userId || "..."}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-4">
              {getTranslation("admin.profile.changePassword")}
            </h3>
            <form id="profile-password-form" className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-medium text-neutral-400 mb-1"
                >
                  {getTranslation("admin.profile.currentPassword")}
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    {getTranslation("admin.profile.newPassword")}
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    {getTranslation("admin.profile.confirmPassword")}
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {error() ? (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error()}
                </div>
              ) : null}
              {success() ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
                  {success()}
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  {updating()
                    ? getTranslation("admin.profile.updating")
                    : getTranslation("admin.profile.updatePassword")}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
