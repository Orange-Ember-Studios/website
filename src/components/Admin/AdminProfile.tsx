import { createElement, createEffect, createSignal } from "@emberkit/core";
import { getTranslation } from "../../i18n/i18n.ts";

export default function AdminProfile() {
  const loadingUserSig = createSignal(true);
  const loadingUser = loadingUserSig[0];
  const setLoadingUser = loadingUserSig[1];

  const updatingSig = createSignal(false);
  const updating = updatingSig[0];
  const setUpdating = updatingSig[1];

  const errorSig = createSignal("");
  const setError = errorSig[1];

  const successSig = createSignal("");
  const setSuccess = successSig[1];

  const userSig = createSignal<{ userId: string; username: string } | null>(
    null,
  );
  const setUser = userSig[1];

  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
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

  // Push user data into the DOM when the signal resolves
  createEffect(() => {
    const unsub = userSig.subscribe((u) => {
      const usernameEl = document.getElementById("profile-username");
      const userIdEl = document.getElementById("profile-userid");
      const passwordFormUsername = document.getElementById(
        "profile-password-username",
      ) as HTMLInputElement | null;
      if (usernameEl) usernameEl.textContent = u?.username ?? "–";
      if (userIdEl) {
        userIdEl.textContent = u?.userId ?? "–";
        userIdEl.title = u?.userId ?? "";
      }
      // Keeps password-manager / browser heuristics happy (username + password in same form)
      if (passwordFormUsername && u?.username) {
        passwordFormUsername.value = u.username;
      }
    });
    return () => unsub();
  });

  // Reflect error / success messages in the DOM
  createEffect(() => {
    const unsubErr = errorSig.subscribe((e) => {
      const el = document.getElementById("profile-error");
      if (!el) return;
      el.textContent = e;
      el.classList.toggle("hidden", !e);
    });
    const unsubOk = successSig.subscribe((s) => {
      const el = document.getElementById("profile-success");
      if (!el) return;
      el.textContent = s;
      el.classList.toggle("hidden", !s);
    });
    return () => {
      unsubErr();
      unsubOk();
    };
  });

  // Keep button text / disabled state in sync
  createEffect(() => {
    const unsub = updatingSig.subscribe((busy) => {
      const btn = document.getElementById(
        "profile-save-btn",
      ) as HTMLButtonElement | null;
      if (!btn) return;
      btn.disabled = busy;
      btn.textContent = busy
        ? getTranslation("admin.profile.updating")
        : getTranslation("admin.profile.updatePassword");
    });
    return () => unsub();
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
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setSuccess(getTranslation("admin.profile.success"));
        form.reset();
        const usernameInput = document.getElementById(
          "profile-password-username",
        ) as HTMLInputElement | null;
        const currentUser = userSig.peek();
        if (usernameInput && currentUser?.username) {
          usernameInput.value = currentUser.username;
        }
      } else {
        setError(data.error || getTranslation("admin.profile.updatePassword"));
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

            {/* Skeleton — visible while loading */}
            <div
              data-ek-bind={loadingUser}
              data-ek-show-when="true"
              data-ek-hide-class="hidden"
              className="animate-pulse flex space-x-4"
            >
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-neutral-800 rounded w-3/4" />
                <div className="h-4 bg-neutral-800 rounded w-1/2" />
              </div>
            </div>

            {/* User info — revealed after load; text populated via subscribe */}
            <div
              data-ek-bind={loadingUser}
              data-ek-show-when="false"
              data-ek-hide-class="hidden"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 hidden"
            >
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {getTranslation("admin.login.username")}
                </label>
                <div className="text-white font-medium bg-neutral-950 px-4 py-2.5 rounded-lg border border-neutral-700">
                  <span id="profile-username">–</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {getTranslation("admin.profile.userId")}
                </label>
                <div className="text-neutral-400 text-sm bg-neutral-950 px-4 py-2.5 rounded-lg border border-neutral-700 font-mono truncate">
                  <span id="profile-userid">–</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-4">
              {getTranslation("admin.profile.changePassword")}
            </h3>
            <form id="profile-password-form" className="space-y-4" autoComplete="on">
              {/* Required by browsers for password forms: associate credentials with account */}
              <label
                htmlFor="profile-password-username"
                className="sr-only"
              >
                {getTranslation("admin.login.username")}
              </label>
              <input
                id="profile-password-username"
                name="username"
                type="text"
                autoComplete="username"
                readOnly
                tabIndex={-1}
                className="sr-only"
              />

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

              <div
                id="profile-error"
                className="hidden p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
              />
              <div
                id="profile-success"
                className="hidden p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm"
              />

              <div className="pt-2">
                <button
                  id="profile-save-btn"
                  type="button"
                  onClick={() => void handleChangePassword()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  {getTranslation("admin.profile.updatePassword")}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
