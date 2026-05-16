import { createEffect, createSignal } from "@emberkit/core";
import { navigate } from "@emberkit/core";
import type { RouteComponent } from "@emberkit/core";
import { getTranslation } from "../../i18n/i18n.ts";

const AdminLogin: RouteComponent = () => {
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleLogin = async (form: HTMLFormElement) => {
    setError("");
    setLoading(true);
    const fd = new FormData(form);
    const username = String(fd.get("username") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || getTranslation("admin.login.error_auth"));
      } else {
        navigate("/admin", { replace: true });
      }
    } catch {
      setError(getTranslation("admin.login.error_network"));
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) navigate("/admin", { replace: true });
      } catch (e) {
        console.error("Auth check error:", e);
      }
    })();
  });

  // EmberKit only wires onClick in HTML output; onSubmit/onInput are omitted,
  // so we attach real DOM listeners. Use FormData + name= so values come from the form.
  createEffect(() => {
    let form: HTMLFormElement | null = null;
    let onSubmit: ((e: SubmitEvent) => void) | null = null;
    const raf = requestAnimationFrame(() => {
      form = document.getElementById("admin-login-form") as HTMLFormElement | null;
      if (!form) return;
      onSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        void handleLogin(e.currentTarget as HTMLFormElement);
      };
      form.addEventListener("submit", onSubmit);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (form && onSubmit) {
        form.removeEventListener("submit", onSubmit);
      }
    };
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700 w-full max-w-md backdrop-blur-lg bg-opacity-80 transition-all">
        <h2 className="text-3xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-6 text-center">
          {getTranslation("admin.login.title")}
        </h2>
        <form id="admin-login-form" className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-neutral-400 mb-2"
              htmlFor="admin-login-username"
            >
              {getTranslation("admin.login.username")}
            </label>
            <input
              id="admin-login-username"
              name="username"
              type="text"
              autoComplete="username"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              required
              placeholder={getTranslation("admin.login.username")}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-neutral-400 mb-2"
              htmlFor="admin-login-password"
            >
              {getTranslation("admin.login.password")}
            </label>
            <input
              id="admin-login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              required
              placeholder="••••••••"
            />
          </div>
          {error() ? (
            <div className="text-red-400 text-sm animate-pulse text-center">
              {error()}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading()}
            className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading()
              ? getTranslation("admin.login.authenticating")
              : getTranslation("admin.login.signIn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
