import crypto from "node:crypto";

// ─── Razorpay Test Keys (placeholder – replace with real test keys) ───────────
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key_id";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_key_secret";

// Lazy-load Razorpay so server starts even if package not installed
let Razorpay;
async function getRazorpay() {
  if (!Razorpay) {
    try {
      const mod = await import("razorpay");
      Razorpay = mod.default;
    } catch {
      return null;
    }
  }
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

// POST /api/payment/create-order
export const createPaymentOrder = async (req, res) => {
  const { amount } = req.body; // amount in rupees / dollars
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Valid amount is required" });
  }

  const razorpay = await getRazorpay();

  // If Razorpay is unavailable or in demo mode without real keys, return a mock order
  if (!razorpay || RAZORPAY_KEY_ID === "rzp_test_placeholder_key_id") {
    const mockOrderId = `order_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
    return res.json({
      id: mockOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      key: RAZORPAY_KEY_ID,
      mock: true,
    });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });
    res.json({ ...order, key: RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Razorpay error:", err.message);
    res.status(500).json({ message: "Payment gateway error" });
  }
};

// POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mock } = req.body;

  if (mock) {
    // Demo/test mode: accept mock payments
    return res.json({ verified: true, paymentId: razorpay_payment_id || `pay_mock_${Date.now()}` });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment verification fields" });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ verified: false, message: "Payment verification failed" });
  }
  res.json({ verified: true, paymentId: razorpay_payment_id });
};

// GET /api/payment/key
export const getPaymentKey = (_req, res) => {
  res.json({ key: RAZORPAY_KEY_ID, isMock: RAZORPAY_KEY_ID === "rzp_test_placeholder_key_id" });
};
