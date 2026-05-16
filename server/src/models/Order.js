import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { createMemoryModel, isMemoryMode } from "../lib/memoryStore.js";

const ORDER_STATUSES = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "Order Placed" },
    trackingId: {
      type: String,
      default: () => `TRK-${randomUUID().split("-")[0].toUpperCase()}`,
    },
    paymentId: { type: String, default: "" },
    paymentOrderId: { type: String, default: "" },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

const MongooseOrder = mongoose.model("Order", orderSchema);

const MemoryOrder = createMemoryModel({
  name: "Order",
  defaults: {
    status: "Order Placed",
    trackingId: `TRK-${randomUUID().split("-")[0].toUpperCase()}`,
    paymentId: "",
    paymentOrderId: "",
    isPaid: false,
  },
});

export { ORDER_STATUSES };
export default isMemoryMode() ? MemoryOrder : MongooseOrder;
