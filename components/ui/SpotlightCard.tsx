"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "./utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * CODE-e-MANIPAL 2.0 — Accessible Spotlight Card
 *
 * Implements Level 2 visual interaction:
 * - Subtle localized spotlight tracking relative to mouse position
 * - Fully opaque solid surface (solid card structure)
 * - Restrained Jaipur Pink / Brass accent palette
 * - Keyboard focus-visible indicator
 * - Reduced-motion support (disables pointer tracking)
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only track pointer for devices with a fine pointer (mouse/trackpad), ignoring touch taps
    if (prefersReducedMotion || !cardRef.current) return;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPosition(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden",
        "animate-entrance card-hover-lift hover:border-secondary/50 hover:shadow-md",
        isFocused && "ring-2 ring-primary/30 border-primary",
        className
      )}
      style={
        position
          ? ({
              "--mouse-x": `${position.x}px`,
              "--mouse-y": `${position.y}px`,
            } as React.CSSProperties)
          : undefined
      }
      {...props}
    >
      {/* Restrained Localized Edge Spotlight (Never washes out content or text readability) */}
      {!prefersReducedMotion && position && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(260px circle at ${position.x}px ${position.y}px, var(--jaipur-primary-light, rgba(201, 120, 120, 0.055)), transparent 72%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* High-Contrast Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
export default SpotlightCard;
