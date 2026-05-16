import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-sm font-semibold text-indigo-700">404</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-600">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block px-5 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
      >
        Back to shop
      </Link>
    </div>
  );
}
