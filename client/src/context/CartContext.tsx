import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../api/products";

export type CartItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  countInStock: number;
};

type CartCtx = {
  items: CartItem[];
  addItem: (p: Product, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalQty: number;
  totalAmount: number;
};

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "shopease_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((p: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.product === p._id);
      if (existing) {
        return prev.map((it) =>
          it.product === p._id
            ? {
                ...it,
                qty: Math.min(p.countInStock || 99, it.qty + qty),
              }
            : it,
        );
      }
      return [
        ...prev,
        {
          product: p._id,
          name: p.name,
          image: p.image,
          price: p.price,
          qty,
          countInStock: p.countInStock,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.product === productId
          ? { ...it, qty: Math.max(1, Math.min(it.countInStock || 99, qty)) }
          : it,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.product !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { totalQty, totalAmount } = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.totalQty += it.qty;
        acc.totalAmount += it.qty * it.price;
        return acc;
      },
      { totalQty: 0, totalAmount: 0 },
    );
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQty,
      removeItem,
      clear,
      totalQty,
      totalAmount: Math.round(totalAmount * 100) / 100,
    }),
    [items, addItem, updateQty, removeItem, clear, totalQty, totalAmount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
