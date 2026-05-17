import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiCreateOrder, type ShippingAddress } from "../api/orders";
import { apiCreatePaymentOrder, apiVerifyPayment } from "../api/payment";
import { formatCurrency } from "../utils/formatCurrency";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, totalAmount, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"address" | "payment">("address");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Nothing to check out</h1>
        <p className="mt-2 text-gray-600">Your cart is empty — add a product first.</p>
      </div>
    );
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handleMockPayment = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Create a mock payment order
      const paymentOrder = await apiCreatePaymentOrder(totalAmount);
      // Verify as mock
      const verification = await apiVerifyPayment({
        razorpay_order_id: paymentOrder.id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        mock: true,
      });
      if (!verification.verified) throw new Error("Payment verification failed");

      // Create the order
      const order = await apiCreateOrder({
        items: items.map((it) => ({ product: it.product, qty: it.qty })),
        shippingAddress: address,
        paymentId: verification.paymentId,
        paymentOrderId: paymentOrder.id,
      });
      clear();
      navigate("/orders", { state: { newOrderId: order._id, trackingId: order.trackingId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load payment gateway. Please try mock payment.");

      const paymentOrder = await apiCreatePaymentOrder(totalAmount);

      if (paymentOrder.mock) {
        // Server is in demo mode, fall back to mock flow
        await handleMockPayment();
        return;
      }

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "ShopEase",
        description: "Order Payment",
        order_id: paymentOrder.id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verification = await apiVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!verification.verified) throw new Error("Payment verification failed");

            const order = await apiCreateOrder({
              items: items.map((it) => ({ product: it.product, qty: it.qty })),
              shippingAddress: address,
              paymentId: verification.paymentId,
              paymentOrderId: response.razorpay_order_id,
            });
            clear();
            navigate("/orders", { state: { newOrderId: order._id, trackingId: order.trackingId } });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Order creation failed after payment");
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || address.fullName,
          email: user?.email || "",
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setSubmitting(false);
    }
  };

  const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => step === "payment" && setStep("address")}
          className={`text-sm font-medium px-3 py-1 rounded-full ${step === "address" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700 cursor-pointer"}`}
        >
          1. Address
        </button>
        <div className="h-px w-6 bg-gray-300" />
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${step === "payment" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
        >
          2. Payment
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-2">
          {step === "address" && (
            <form
              onSubmit={handleAddressSubmit}
              className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full name</label>
                <input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className={field} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Address</label>
                <input required value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className={field} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">City</label>
                  <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className={field} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Postal code</label>
                  <input required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className={field} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Country</label>
                  <input required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className={field} />
                </div>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                Continue to Payment →
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Payment</h2>

              {/* Address summary */}
              <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
                <span className="font-medium">Shipping to: </span>
                {address.fullName}, {address.address}, {address.city}, {address.postalCode}, {address.country}
                <button onClick={() => setStep("address")} className="ml-2 text-indigo-600 hover:underline text-xs">Edit</button>
              </div>

              {/* Razorpay payment option */}
              <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Pay with Razorpay</div>
                    <div className="text-xs text-gray-500">Cards, UPI, Net Banking, Wallets</div>
                  </div>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
                  ⚠️ <strong>Test Mode:</strong> No real charges. Use the "Simulate Payment" button below for demo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={submitting}
                    className="flex-1 px-5 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400 text-sm"
                  >
                    {submitting ? "Processing…" : `Pay ${formatCurrency(totalAmount)} with Razorpay`}
                  </button>
                  <button
                    onClick={handleMockPayment}
                    disabled={submitting}
                    className="flex-1 px-5 py-2.5 rounded-md border-2 border-indigo-600 text-indigo-700 font-medium hover:bg-indigo-50 disabled:opacity-50 text-sm"
                  >
                    {submitting ? "Processing…" : "Simulate Payment (Demo)"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order summary */}
        <aside className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <div className="mt-3 space-y-2 max-h-64 overflow-auto">
            {items.map((it) => (
              <div key={it.product} className="flex justify-between text-sm text-gray-700">
                <span className="truncate pr-2">{it.name} × {it.qty}</span>
                <span>{formatCurrency(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">Secure checkout powered by Razorpay</div>
        </aside>
      </div>
    </div>
  );
}
