"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-full border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#151B2B]",
          size === "sm" ? "w-8 h-8" : "w-9 h-9",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm",
        size === "sm" ? "w-8 h-8" : "w-9 h-9",
        isDark
          ? "border-[#1E293B] bg-[#151B2B] text-amber-400 hover:border-[#4F6EF7] hover:bg-[#1A2236]"
          : "border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0E1630] hover:border-[#4F6EF7]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className={size === "sm" ? "w-4 h-4" : "w-4 h-4 text-amber-400"} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4 text-[#4F6EF7]"} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
