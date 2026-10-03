"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[124px] h-11 rounded-full border border-jaipur-gold/20 bg-jaipur-card/50" aria-hidden="true" />
    );
  }

  const options = [
    { value: "system", icon: Monitor, label: "System default" },
    { value: "light", icon: Sun, label: "Light theme" },
    { value: "dark", icon: Moon, label: "Dark theme" },
  ] as const;

  return (
    <div className="relative flex items-center p-1 gap-1 rounded-full border border-jaipur-gold/30 bg-jaipur-card text-jaipur-primary shadow-sm h-11">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className="relative size-9 rounded-full text-muted-foreground hover:text-foreground transition-colors duration-200 outline-none flex items-center justify-center cursor-pointer"
            aria-label={option.label}
            title={option.label}
          >
            {isActive && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              size={20}
              className={`relative z-10 transition-colors duration-200 ${
                isActive ? "text-foreground stroke-[2px]" : "text-muted-foreground/60 hover:text-muted-foreground stroke-[1.5px]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
