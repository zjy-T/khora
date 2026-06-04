import type { Metadata } from "next";
import { BuilderShell } from "@/components/builder/BuilderShell";

export const metadata: Metadata = {
  title: "The Builder",
  description:
    "Browse the atelier's ready-made compositions, or compose your own crystal bracelet by hand — consult the Oracle or chart your destiny.",
};

export default function BuilderPage() {
  return <BuilderShell />;
}
