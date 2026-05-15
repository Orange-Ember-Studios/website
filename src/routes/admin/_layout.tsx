import { createEffect, createSignal, navigate } from "@emberkit/core";
import type { RouteComponent } from "@emberkit/core";

type User = {
  id: string;
  username: string;
};

const AdminLayout: RouteComponent = ({ children }) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  createEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          setError("Unauthorized");
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate("/admin/login", { replace: true });
          }, 100);
          return;
        }

        const data = (await response.json()) as { user?: User };
        if (data.user) {
          setUser(data.user);
          setError(null);
        } else {
          setError("No user data");
          setTimeout(() => {
            navigate("/admin/login", { replace: true });
          }, 100);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Auth check failed");
        setTimeout(() => {
          navigate("/admin/login", { replace: true });
        }, 100);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  });

  if (loading()) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error() || !user()) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Authentication failed</p>
          <p className="text-neutral-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminLayout;
