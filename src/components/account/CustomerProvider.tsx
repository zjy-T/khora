"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Storefront-side customer session. Passwordless: the ops platform issues a
// signed token after email-code verification; we keep it in localStorage and
// send it as a bearer token to the ops API (cross-domain, so no cookie).

const OPS_URL = process.env.NEXT_PUBLIC_OPS_URL;
const TOKEN_KEY = "khora_customer_token";

export type CustomerOrder = {
  number: string;
  status: string;
  shippingStatus: string;
  total: string;
  placedAt: string;
  trackingNumber: string | null;
  carrier: string | null;
  items: { name: string; qty: number }[];
};

type Customer = { email: string; name: string | null };

type CustomerValue = {
  customer: Customer | null;
  orders: CustomerOrder[];
  ready: boolean;
  requestCode: (email: string) => Promise<{ ok: boolean; sent?: boolean }>;
  verifyCode: (
    email: string,
    code: string,
    name?: string,
  ) => Promise<{ ok: boolean; isNew?: boolean }>;
  signOut: () => void;
};

const Ctx = createContext<CustomerValue | null>(null);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ready, setReady] = useState(false);

  const loadFromToken = useCallback(async (token: string) => {
    if (!OPS_URL) return false;
    try {
      const res = await fetch(`${OPS_URL}/api/customer`, {
        headers: { Authorization: `Bearer ${token}` },
        mode: "cors",
      });
      if (!res.ok) return false;
      const data = await res.json();
      setCustomer(data.customer);
      setOrders((data.orders as CustomerOrder[]) ?? []);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Restore session on mount.
  useEffect(() => {
    const token = (() => {
      try {
        return localStorage.getItem(TOKEN_KEY);
      } catch {
        return null;
      }
    })();
    if (!token) {
      setReady(true);
      return;
    }
    loadFromToken(token).then((ok) => {
      if (!ok) {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          /* ignore */
        }
      }
      setReady(true);
    });
  }, [loadFromToken]);

  const requestCode = useCallback(async (email: string) => {
    if (!OPS_URL) return { ok: false };
    try {
      const res = await fetch(`${OPS_URL}/api/auth/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok && data.ok, sent: data.sent };
    } catch {
      return { ok: false };
    }
  }, []);

  const verifyCode = useCallback(
    async (email: string, code: string, name?: string) => {
      if (!OPS_URL) return { ok: false };
      try {
        const res = await fetch(`${OPS_URL}/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({ email, code, name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return { ok: false };
        try {
          localStorage.setItem(TOKEN_KEY, data.token);
        } catch {
          /* ignore */
        }
        setCustomer(data.customer);
        await loadFromToken(data.token);
        return { ok: true, isNew: data.isNew };
      } catch {
        return { ok: false };
      }
    },
    [loadFromToken],
  );

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setCustomer(null);
    setOrders([]);
  }, []);

  return (
    <Ctx.Provider
      value={{ customer, orders, ready, requestCode, verifyCode, signOut }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCustomer(): CustomerValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCustomer must be used within a CustomerProvider");
  return ctx;
}
