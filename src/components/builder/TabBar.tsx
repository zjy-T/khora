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
    <div className="-ml-4 flex flex-wrap items-center">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-4 text-[0.72rem] uppercase tracking-luxe transition-colors duration-300 ${
              isActive ? "text-bone" : "text-mist hover:text-bone/70"
            }`}
          >
            <span className="relative z-10">{tab.label}</span>
            {isActive && (
              <motion.span
                layoutId="seg-active"
                className="absolute inset-x-4 bottom-0 h-[1.5px] bg-bone"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
