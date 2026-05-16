import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-600">Sign in to your account.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-700 hover:underline">
            Create one
          </Link>
        </p>
        <div className="mt-6 text-xs text-gray-500 border-t border-gray-100 pt-4">
          <div>
            <strong>Demo accounts</strong> (after seeding):
          </div>
          <div>Admin: admin@shop.com / admin123</div>
          <div>User: user@shop.com / user123</div>
        </div>
      </div>
    </div>
  );
}
