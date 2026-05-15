import { createEffect, createSignal } from "@emberkit/core";
import { navigate } from "@emberkit/core";
import type { RouteComponent } from "@emberkit/core";
import { getTranslation } from "../../i18n/i18n";

const AdminLogin: RouteComponent = () => {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });
        if (res.ok) navigate("/admin", { replace: true });
      } catch (e) {
        console.error("Auth check error:", e);
      }
    })();
  });

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username(), password: password() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || getTranslation("admin.login.error_auth"));
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError(getTranslation("admin.login.error_network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700 w-full max-w-md backdrop-blur-lg bg-opacity-80 transition-all">
        <h2 className="text-3xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-6 text-center">
          {getTranslation("admin.login.title")}
        </h2>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              {getTranslation("admin.login.username")}
            </label>
            <input
              value={username()}
              onInput={(e) =>
                setUsername((e.target as HTMLInputElement).value)
              }
              type="text"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              required
              placeholder={getTranslation("admin.login.username")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              {getTranslation("admin.login.password")}
            </label>
            <input
              value={password()}
              onInput={(e) =>
                setPassword((e.target as HTMLInputElement).value)
              }
              type="password"
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
