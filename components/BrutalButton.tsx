
"use client";

import { motion } from "motion/react";

type BrutalModeToggleProps = {
  active: boolean;
  onChange: (active: boolean) => void;
};

export default function BrutalModeToggle({
  active,
  onChange,
}: BrutalModeToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!active)}
      aria-label="Brutal Mode"
      aria-pressed={active}
      className="flex items-center gap-3 rounded-full px-4 py-2.5 transition-all duration-300" 
    >
      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.15em]">
        Brutal
      </span>

      <span
        className={`relative ml-1 flex h-6 w-10 shrink-0 items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
          active ? "bg-[#F2842F]" : "bg-neutral-800"
        }`}
      >
        <motion.span
          animate={{ x: active ? 16 : 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 25,
          }}
          className="h-4 w-4 rounded-full bg-neutral-300 shadow-sm"
        />
      </span>
    </motion.button>
  );
}