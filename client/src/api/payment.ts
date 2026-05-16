import { apiFetch } from "./client";

export type PaymentOrder = {
  id: string;
  amount: number;
  currency: string;
  key: string;
  mock?: boolean;
};

export const apiCreatePaymentOrder = (amount: number) =>
  apiFetch<PaymentOrder>("/payment/create-order", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

export const apiVerifyPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  mock?: boolean;
}) =>
  apiFetch<{ verified: boolean; paymentId: string }>("/payment/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiGetPaymentKey = () =>
  apiFetch<{ key: string; isMock: boolean }>("/payment/key");
