"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { getHeritageRouteConfig } from "@/lib/heritage/routeConfig";

/**
 * CODE-e-MANIPAL 2.0 — Heritage Background & Atmospheric Frame
 *
 * Implements Section 6, 12, 13, 14, 15, 16, 30 of the Visual Overhaul Specification.
 *
 * Requirements:
 * - Route-aware asset loading using next/image
 * - Priority only for hero routes (/ , /login , /dashboard , /results)
 * - Level C / Dense operational admin pages remain 100% solid (NO PHOTOGRAPHY)
 * - Light assets loaded exclusively in light mode; dark assets exclusively in dark mode
 * - Custom focal positioning per route
 * - Genuine opaque veil overlay, zero glassmorphism / zero blur
 */
export function HeritageBackground() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const routeConfig = getHeritageRouteConfig(pathname);

  // Level C / Solid Operational Surfaces: Strictly zero photography
  if (routeConfig.mode === "none") {
    return null;
  }

  const isDark = resolvedTheme === "dark";
  const themeConfig = isDark ? routeConfig.dark : routeConfig.light;

  if (!themeConfig || !themeConfig.asset) {
    return null;
  }

  const isHero = routeConfig.mode === "hero";
  const position = themeConfig.position || "center center";
  const opacity = themeConfig.opacity ?? (isDark ? 0.45 : 0.75);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Authoritative Heritage Photographic Asset */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-in-out"
        style={{ opacity }}
      >
        <Image
          src={themeConfig.asset}
          alt=""
          fill
          priority={isHero}
          quality={85}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </div>

      {/* Atmospheric Veil Overlay (Pure Non-Sepia Gradient, Zero Glassmorphism) */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? routeConfig.mode === "hero"
              ? "linear-gradient(180deg, rgba(23, 17, 14, 0.35) 0%, rgba(23, 17, 14, 0.65) 45%, rgba(23, 17, 14, 0.88) 100%)"
              : "linear-gradient(180deg, rgba(23, 17, 14, 0.55) 0%, rgba(23, 17, 14, 0.80) 50%, rgba(23, 17, 14, 0.94) 100%)"
            : routeConfig.mode === "hero"
            ? "linear-gradient(180deg, rgba(247, 244, 239, 0.25) 0%, rgba(247, 244, 239, 0.55) 45%, rgba(247, 244, 239, 0.82) 100%)"
            : "linear-gradient(180deg, rgba(247, 244, 239, 0.45) 0%, rgba(247, 244, 239, 0.70) 50%, rgba(247, 244, 239, 0.88) 100%)",
        }}
      />
    </div>
  );
}
export default HeritageBackground;
