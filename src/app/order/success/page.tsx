import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess } from "@/components/order/OrderSuccess";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccess />
    </Suspense>
  );
}
