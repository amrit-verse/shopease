import { apiFetch } from "./client";

export type User = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type AuthResponse = { user: User; token: string };

export const apiRegister = (data: {
  name: string;
  email: string;
  password: string;
}) =>
  apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiLogin = (data: { email: string; password: string }) =>
  apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiMe = () => apiFetch<{ user: User }>("/auth/me");
