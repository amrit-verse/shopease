import { useEffect, useState } from "react";
import { apiListProducts, type Product } from "../api/products";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiListProducts(query)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Everyday essentials, beautifully chosen.
            </h1>
            <p className="mt-3 text-indigo-100 text-base sm:text-lg">
              A small, curated catalog of products we'd actually buy. Browse, add to cart, and check out in seconds.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(search.trim());
              }}
              className="mt-6 flex gap-2 max-w-md"
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="flex-1 rounded-md px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-white text-indigo-700 font-medium hover:bg-indigo-50"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {query ? `Results for "${query}"` : "All products"}
          </h2>
          {query && (
            <button
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
              className="text-sm text-indigo-700 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {loading && (
          <div className="text-gray-500 py-8">Loading products…</div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="text-gray-500 py-8">No products found.</div>
        )}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
