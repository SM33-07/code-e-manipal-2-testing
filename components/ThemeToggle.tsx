"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-[102px] h-8 rounded-lg border border-border bg-card/50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const options = [
    { value: "system", icon: Monitor, label: "System default" },
    { value: "light", icon: Sun, label: "Light mode" },
    { value: "dark", icon: Moon, label: "Dark mode" },
  ] as const;

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={`relative inline-flex items-center p-0.5 rounded-lg border border-border bg-card/90 text-foreground shadow-sm h-8 select-none ${className}`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={isActive}
            aria-label={option.label}
            title={option.label}
            className="relative size-7 rounded-md text-muted-foreground hover:text-foreground transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-primary flex items-center justify-center cursor-pointer"
          >
            {isActive && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 rounded-md bg-secondary/15 border border-secondary/30 dark:bg-white/10 dark:border-white/15"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Icon
              size={15}
              className={`relative z-10 transition-colors duration-150 ${
                isActive
                  ? "text-secondary dark:text-foreground stroke-[2.2px]"
                  : "text-muted-foreground/70 hover:text-foreground stroke-[1.7px]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
