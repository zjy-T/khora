import type { Metadata } from "next";
import { ContactView } from "@/components/support/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the KHORA atelier — live chat with support or write to us by email.",
};

export default function ContactPage() {
  return <ContactView />;
}
