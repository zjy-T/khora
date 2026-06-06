"use client";

import {
  Shield,
  Coins,
  HeartPulse,
  TrendingUp,
  Moon,
  Users,
  Waves,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import type { ResonanceTag } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

const ICONS: Record<ResonanceTag, LucideIcon> = {
  Wealth: Coins,
  Health: HeartPulse,
  Career: TrendingUp,
  Sleep: Moon,
  Peace: Shield,
  Relationships: Users,
  Emotion: Waves,
  Study: BookOpen,
};

type Props = {
  property: ResonanceTag;
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
