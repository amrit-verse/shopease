import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { apiMyOrders, type Order, ORDER_STATUS_STEPS, type OrderStatus } from "../api/orders";
import { formatCurrency } from "../utils/formatCurrency";
import ImageWithFallback from "../components/ImageWithFallback";

const STATUS_ICONS: Record<string, string> = {
  "Order Placed": "📦",
  "Processing": "⚙️",
  "Shipped": "🚚",
  "Out for Delivery": "🏃",
  "Delivered": "✅",
  "Cancelled": "❌",
};

function TrackingStepper({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-red-100 text-red-700">
          ❌ Order Cancelled
        </span>
      </div>
    );
  }

  const currentIdx = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="py-4 px-1">
      <div className="flex items-start">
        {ORDER_STATUS_STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const future = idx > currentIdx;
          return (
            <div key={step} className="flex-1 flex flex-col items-center relative">
              {/* Connector line left */}
              {idx > 0 && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-0.5 ${done || active ? "bg-indigo-500" : "bg-gray-200"}`}
                  style={{ left: "-50%", width: "100%" }}
                />
              )}
              {/* Circle */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : active
                    ? "bg-white border-indigo-600 text-indigo-600 ring-2 ring-indigo-200"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {done ? "✓" : idx + 1}
              </div>
              {/* Label */}
              <div
                className={`mt-1.5 text-center text-[10px] sm:text-xs font-medium leading-tight px-1 ${
                  active ? "text-indigo-700" : future ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {STATUS_ICONS[step]} {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order, highlight }: { order: Order; highlight?: boolean }) {
  const [expanded, setExpanded] = useState(highlight ?? false);

  const statusColor =
    order.status === "Delivered"
      ? "bg-green-100 text-green-700"
      : order.status === "Cancelled"
      ? "bg-red-100 text-red-700"
      : order.status === "Shipped" || order.status === "Out for Delivery"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className={`bg-white border rounded-lg overflow-hidden transition-all ${highlight ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <div className="text-sm text-gray-700 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-500">#{order._id.slice(-8)}</span>
            <span className="text-gray-400">•</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          {order.trackingId && (
            <div className="text-xs text-indigo-600 font-mono">
              🔍 Tracking ID: <span className="font-semibold">{order.trackingId}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
            {STATUS_ICONS[order.status]} {order.status}
          </span>
          <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-indigo-600 hover:underline"
          >
            {expanded ? "Hide" : "Track"}
          </button>
        </div>
      </div>

      {/* Tracking stepper */}
      {expanded && (
        <div className="px-5 border-b border-gray-100 bg-indigo-50/40">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-3">Order Tracking</div>
          <TrackingStepper status={order.status} />
          {order.isPaid && (
            <div className="pb-2 text-xs text-green-700">
              ✅ Payment confirmed {order.paymentId && <span className="font-mono text-gray-500">({order.paymentId.slice(0, 20)}…)</span>}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <ul className="divide-y divide-gray-100">
        {order.items.map((it) => (
          <li key={it.product} className="px-5 py-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={it.image}
                alt={it.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{it.name}</div>
              <div className="text-xs text-gray-500">Qty {it.qty}</div>
            </div>
            <div className="text-sm text-gray-700">{formatCurrency(it.price * it.qty)}</div>
          </li>
        ))}
      </ul>

      {/* Shipping */}
      <div className="px-5 py-3 text-xs text-gray-500 border-t border-gray-100">
        📍 {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const state = location.state as { newOrderId?: string; trackingId?: string } | null;
  const newOrderId = state?.newOrderId;
  const trackingId = state?.trackingId;

  useEffect(() => {
    apiMyOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Orders</h1>

      {newOrderId && (
        <div className="mb-5 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-4">
          <div className="font-semibold text-green-900 mb-1">🎉 Order placed successfully!</div>
          <div className="text-sm space-y-1">
            <div>Order ID: <span className="font-mono text-xs">{newOrderId}</span></div>
            {trackingId && <div>Tracking ID: <span className="font-mono font-bold">{trackingId}</span></div>}
          </div>
        </div>
      )}

      {loading && <div className="text-gray-500">Loading orders…</div>}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">{error}</div>
      )}
      {!loading && orders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="px-5 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700">
            Start shopping
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <OrderCard key={o._id} order={o} highlight={o._id === newOrderId} />
        ))}
      </div>
    </div>
  );
}
