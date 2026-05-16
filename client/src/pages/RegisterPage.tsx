import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Join ShopEase in just a few seconds.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
            <p className="mt-1 text-xs text-gray-500">
              At least 6 characters.
            </p>
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
