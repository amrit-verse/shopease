import { apiFetch } from "./client";

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  countInStock: number;
};

export const apiListProducts = (search = "") =>
  apiFetch<Product[]>(
    `/products${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );

export const apiGetProduct = (id: string) =>
  apiFetch<Product>(`/products/${id}`);

export const apiCreateProduct = (data: Partial<Product>) =>
  apiFetch<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiUpdateProduct = (id: string, data: Partial<Product>) =>
  apiFetch<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiDeleteProduct = (id: string) =>
  apiFetch<{ message: string }>(`/products/${id}`, { method: "DELETE" });
