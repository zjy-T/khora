"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Lightweight first-party analytics: posts a pageview to the KHORA Inventory
// ops platform on every route change. No cookies, just a random session id in
// localStorage. Configure the endpoint with NEXT_PUBLIC_OPS_URL.

const OPS_URL = process.env.NEXT_PUBLIC_OPS_URL;

function sessionId(): string {
  try {
    let id = localStorage.getItem("khora_sid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("khora_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!OPS_URL) return;
    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
      sessionId: sessionId(),
    });
    // keepalive so it still sends during navigation
    fetch(`${OPS_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      mode: "cors",
    }).catch(() => {});
  }, [pathname]);

  return null;
}
