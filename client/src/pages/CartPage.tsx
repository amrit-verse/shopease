import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/formatCurrency";
import ImageWithFallback from "../components/ImageWithFallback";

export default function CartPage() {
  const { items, updateQty, removeItem, totalAmount, totalQty, clear } =
    useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">
          Add some products to get started.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-5 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Your cart ({totalQty})
        </h1>
        <button
          onClick={() => {
            clear();
            toast("Cart cleared", "info");
          }}
          className="text-sm text-gray-600 hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((it) => (
            <div
              key={it.product}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4"
            >
              <Link
                to={`/products/${it.product}`}
                className="block w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0"
              >
                <ImageWithFallback
                  src={it.image}
                  alt={it.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </Link>
              <div className="flex-1 flex flex-col">
                <Link
                  to={`/products/${it.product}`}
                  className="font-medium text-gray-900 hover:text-indigo-700"
                >
                  {it.name}
                </Link>
                <span className="text-sm text-gray-600">
                  {formatCurrency(it.price)} each
                </span>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => updateQty(it.product, it.qty - 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[2ch] text-center">
                      {it.qty}
                    </span>
                    <button
                      onClick={() => updateQty(it.product, it.qty + 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(it.price * it.qty)}
                    </span>
                    <button
                      onClick={() => {
                        removeItem(it.product);
                        toast(`${it.name} removed`, "info");
                      }}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white border border-gray-200 rounded-lg p-5 h-fit sticky top-20">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <button
            onClick={() =>
              navigate(user ? "/checkout" : "/login", {
                state: { from: "/checkout" },
              })
            }
            className="mt-5 w-full py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            {user ? "Proceed to checkout" : "Login to checkout"}
          </button>
          <Link
            to="/"
            className="mt-3 block text-center text-sm text-indigo-700 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
