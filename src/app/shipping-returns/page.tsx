import type { Metadata } from "next";
import { PolicyView } from "@/components/support/PolicyView";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "KHORA shipping, returns, and exchange policy.",
};

export default function ShippingReturnsPage() {
  return <PolicyView />;
}
