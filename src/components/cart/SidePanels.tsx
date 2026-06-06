"use client";

import { CartPanel } from "@/components/cart/CartPanel";
import { SearchPanel } from "@/components/cart/SearchPanel";
import { ProfilePanel } from "@/components/cart/ProfilePanel";

/** Mounts the three right-side drawers; each shows itself based on cart panel state. */
export function SidePanels() {
  return (
    <>
      <SearchPanel />
      <ProfilePanel />
      <CartPanel />
    </>
  );
}
