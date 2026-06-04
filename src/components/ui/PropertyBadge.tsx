"use client";

import {
  Shield,
  Coins,
  HeartPulse,
  Scale,
  Sparkles,
  Eye,
  Waves,
  Heart,
  type LucideIcon,
} from "lucide-react";
import type { MetaphysicalProperty } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

const ICONS: Record<MetaphysicalProperty, LucideIcon> = {
  Protection: Shield,
  Fortune: Coins,
  Health: HeartPulse,
  Harmony: Scale,
  Amplification: Sparkles,
  Clarity: Eye,
  Serenity: Waves,
  Love: Heart,
};

type Props = {
  property: MetaphysicalProperty;
  className?: string;
};

export function PropertyBadge({ property, className = "" }: Props) {
  const { t } = useI18n();
  const Icon = ICONS[property] ?? Shield;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-white/30 bg-black/40 px-2.5 py-1 text-[0.58rem] uppercase tracking-luxe text-white backdrop-blur-sm ${className}`}
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
      {t.properties[property]}
    </span>
  );
}
