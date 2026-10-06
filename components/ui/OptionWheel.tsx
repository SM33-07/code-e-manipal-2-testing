"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  HeartPulse,
  Coins,
  ShieldCheck,
  Sparkles,
  Layers,
  Gamepad2,
  Building2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { cn } from "./utils";
import { DETAILED_TRACKS, TrackMetadata } from "@/lib/event/eventConstants";

export type TrackOption = TrackMetadata;

export const EVENT_TRACKS: TrackOption[] = DETAILED_TRACKS;

const TRACK_ICONS = [
  Cpu,          // AI/ML
  HeartPulse,   // HealthTech
  Coins,        // FinTech/EdTech
  ShieldCheck,  // Cybersecurity
  Sparkles,     // Generative AI & LLMs
  Layers,       // Multi-Agent Systems
  Gamepad2,     // Gaming & Immersive Tech
  Building2,    // Smart City and Infrastructure
  Lightbulb,    // Open Innovation
];

interface OptionWheelProps {
  className?: string;
  onSelectTrack?: (track: TrackOption) => void;
}

/**
 * CODE-e-MANIPAL 2.0 — Accessible Track Exploration Option Wheel
 *
 * Implements Track/Problem-Space Discovery:
 * - Scoped local rotation with arrow-key keyboard navigation
 * - Preserves native page scrolling (zero scroll hijacking)
 * - Zero audio / casino gimmicks
 * - Clear tablist / tab semantics
 * - Synchronized detail card with accessible alternative display
 */
export function OptionWheel({ className, onSelectTrack }: OptionWheelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    onSelectTrack?.(EVENT_TRACKS[idx]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (selectedIndex + 1) % EVENT_TRACKS.length;
      handleSelect(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (selectedIndex - 1 + EVENT_TRACKS.length) % EVENT_TRACKS.length;
      handleSelect(prev);
    }
  };

  const currentTrack = EVENT_TRACKS[selectedIndex];
  const CurrentIcon = TRACK_ICONS[selectedIndex];

  return (
    <div
      className={cn("w-full space-y-6", className)}
      role="region"
      aria-label="Hackathon Track Explorer"
    >
      {/* ── Interactive Track Dial / Selector ── */}
      <div
        role="tablist"
        aria-label="Problem Statement Tracks"
        onKeyDown={handleKeyDown}
        className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-xs"
      >
        {EVENT_TRACKS.map((track, idx) => {
          const isSelected = idx === selectedIndex;
          const Icon = TRACK_ICONS[idx];
          return (
            <button
              key={track.id}
              role="tab"
              id={`track-tab-${track.id}`}
              aria-selected={isSelected}
              aria-controls={`track-panel-${track.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelect(idx)}
              type="button"
              className={cn(
                "flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon size={14} className={isSelected ? "text-primary-foreground" : "text-secondary"} />
              <span className="truncate">{track.tag}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Track Highlight Surface (Opaque Card) ── */}
      <div
        id={`track-panel-${currentTrack.id}`}
        role="tabpanel"
        aria-labelledby={`track-tab-${currentTrack.id}`}
        className="rounded-3xl border border-secondary/40 bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold font-mono tracking-wider">
              <CurrentIcon size={13} />
              <span>{currentTrack.tag} &bull; DOMAIN SPRINT</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {currentTrack.title}
            </h3>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {currentTrack.desc}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-secondary uppercase tracking-wider">Target Tech:</span>
              <span className="px-2.5 py-1 rounded-md bg-accent text-foreground font-mono font-medium">
                {currentTrack.focus}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold text-center">
              Evaluated on Innovation &amp; Architecture
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OptionWheel;
