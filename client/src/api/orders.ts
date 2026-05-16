import { apiFetch } from "./client";

export type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  qty: number;
};

export type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderStatus =
  | "Order Placed"
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export type Order = {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: OrderStatus;
  trackingId: string;
  paymentId: string;
  paymentOrderId: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
};

export const apiCreateOrder = (data: {
  items: { product: string; qty: number }[];
  shippingAddress: ShippingAddress;
  paymentId?: string;
  paymentOrderId?: string;
}) =>
  apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiMyOrders = () => apiFetch<Order[]>("/orders/mine");

export const apiGetOrder = (id: string) => apiFetch<Order>(`/orders/${id}`);

export const apiTrackOrder = (trackingId: string) =>
  apiFetch<Order>(`/orders/track/${trackingId}`);

export const apiUpdateOrderStatus = (id: string, status: OrderStatus) =>
  apiFetch<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
