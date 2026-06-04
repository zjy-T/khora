"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";

export type BuilderTab = "curator" | "alchemist" | "oracle" | "destiny";

export function TabBar({
  active,
  onChange,
}: {
  active: BuilderTab;
  onChange: (t: BuilderTab) => void;
}) {
  const { t } = useI18n();

  const tabs: { id: BuilderTab; label: string }[] = [
    { id: "curator",   label: t.builder.tabCuratorLabel },
    { id: "alchemist", label: t.builder.tabAlchemistLabel },
    { id: "oracle",    label: t.builder.tabOracleLabel },
    { id: "destiny",   label: t.builder.tabDestinyLabel },
  ];

  return (
    <div className="inline-flex border border-hairline-soft">
      {tabs.map((tab, i) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-5 py-2.5 text-[0.72rem] uppercase tracking-luxe transition-colors duration-300 ${
              i > 0 ? "border-l border-hairline-soft" : ""
            } ${isActive ? "text-bone" : "text-mist hover:text-bone/70"}`}
          >
            {isActive && (
              <motion.span
                layoutId="seg-active"
                className="absolute inset-0 bg-bone/[0.08]"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
