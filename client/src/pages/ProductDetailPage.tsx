import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetProduct, type Product } from "../api/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetProduct(id)
      .then((p) => {
        setProduct(p);
        setQty(1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="max-w-7xl mx-auto px-4 py-10 text-gray-500">Loading…</div>;
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
        <Link to="/" className="mt-4 inline-block text-indigo-700 hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  if (!product) return null;

  const out = product.countInStock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="text-sm text-indigo-700 hover:underline">
        ← Back to shop
      </Link>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden aspect-square">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            {product.category}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-semibold text-indigo-700">
            ${product.price.toFixed(2)}
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || "No description provided."}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                out
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {out ? "Out of stock" : `${product.countInStock} in stock`}
            </span>
          </div>

          {!out && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-gray-700">Quantity</span>
              <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-300"
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 py-1.5 text-sm font-medium tabular-nums min-w-[3ch] text-center select-none">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQty((q) => Math.min(product.countInStock, q + 1))
                  }
                  className="px-3 py-1.5 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-300"
                  disabled={qty >= product.countInStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              disabled={out}
              onClick={() => {
                addItem(product, qty);
                toast(`${qty} × ${product.name} added to cart`);
              }}
              className="px-5 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:scale-[0.98] transition-transform disabled:bg-gray-300 disabled:active:scale-100"
            >
              Add to cart
            </button>
            <button
              disabled={out}
              onClick={() => {
                addItem(product, qty);
                navigate("/cart");
              }}
              className="px-5 py-2.5 rounded-md border border-indigo-600 text-indigo-700 font-medium hover:bg-indigo-50 active:scale-[0.98] transition-transform disabled:border-gray-300 disabled:text-gray-400 disabled:active:scale-100"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
