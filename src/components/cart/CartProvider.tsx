"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** A single line in the cart. Quantity is tracked separately. */
export type CartItem = {
  /** Stable line identity — formula id for catalog pieces, sequence hash for custom builds. */
  id: string;
  kind: "curated" | "community" | "custom";
  /** Display name captured at add-time. */
  name: string;
  /** Unit price in the base currency (CNY); converted for display via Price. */
  price: number;
  /** Ordered bead slugs — used to render the mini loop in the drawer. */
  beadSequence: string[];
  /** Product slug for catalog pieces (links back to the detail page). */
  slug?: string;
  qty: number;
};

/** Which right-side panel is currently open, if any. */
export type PanelKind = "cart" | "search" | "profile" | null;

type CartValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  panel: PanelKind;
  openPanel: (p: Exclude<PanelKind, null>) => void;
  closePanel: () => void;
};

const CartContext = createContext<CartValue | null>(null);

const STORAGE_KEY = "khora-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [panel, setPanel] = useState<PanelKind>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart after mount (avoids SSR/CSR hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change, but only once we've hydrated (don't clobber storage on first paint).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [...prev, { ...item, qty }];
      });
    },
    [],
  );

  const removeItem = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [],
  );

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const openPanel = useCallback(
    (p: Exclude<PanelKind, null>) => setPanel(p),
    [],
  );
  const closePanel = useCallback(() => setPanel(null), []);

  const count = useMemo(
    () => items.reduce((n, i) => n + i.qty, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((n, i) => n + i.price * i.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      setQty,
      clear,
      panel,
      openPanel,
      closePanel,
    }),
    [items, count, subtotal, addItem, removeItem, setQty, clear, panel, openPanel, closePanel],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
