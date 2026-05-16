import Order, { ORDER_STATUSES } from "../models/Order.js";
import Product from "../models/Product.js";
import { randomUUID } from "node:crypto";

export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentId, paymentOrderId } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must have at least one item" });
  }
  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.postalCode ||
    !shippingAddress.country
  ) {
    return res.status(400).json({ message: "Complete shipping address is required" });
  }

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let totalAmount = 0;
  const orderItems = items.map((i) => {
    const p = productMap.get(String(i.product));
    if (!p) throw Object.assign(new Error("Invalid product in order"), { status: 400 });
    const qty = Math.max(1, Number(i.qty || 1));
    totalAmount += p.price * qty;
    return { product: p._id, name: p.name, image: p.image, price: p.price, qty };
  });

  const trackingId = `TRK-${randomUUID().split("-")[0].toUpperCase()}`;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    totalAmount: Math.round(totalAmount * 100) / 100,
    trackingId,
    paymentId: paymentId || "",
    paymentOrderId: paymentOrderId || "",
    isPaid: !!paymentId,
    paidAt: paymentId ? new Date() : undefined,
    status: "Order Placed",
  });
  res.status(201).json(order);
};

export const myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }
  res.json(order);
};

export const updateOrderStatus = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin only" });
  }
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${ORDER_STATUSES.join(", ")}` });
  }
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  await order.save();
  res.json(order);
};

export const trackOrder = async (req, res) => {
  const { trackingId } = req.params;
  const orders = await Order.find({ trackingId });
  const order = orders[0];
  if (!order) return res.status(404).json({ message: "No order found with that tracking ID" });
  // Only return if owner or admin
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }
  res.json(order);
};
