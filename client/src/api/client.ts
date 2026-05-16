// Lightweight fetch wrapper. The proxy in front of Replit forwards /api to the
// api-server artifact, so a relative URL works in dev, prod, and Docker
// (Docker compose handles the proxy via the same path).

const API_BASE = "/api";

export type ApiError = { message: string };

const TOKEN_KEY = "shopease_token";
export const getToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
export const setToken = (t: string | null) => {
  if (typeof window === "undefined") return;
  if (t) window.localStorage.setItem(TOKEN_KEY, t);
  else window.localStorage.removeItem(TOKEN_KEY);
};

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in data
        ? (data as ApiError).message
        : null) || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
