"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LoaderAnimationProps {
  onComplete: () => void;
}

export default function LoaderAnimation({ onComplete }: LoaderAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Check reduced motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        onComplete();
      }
    }
  }, [onComplete]);

  // Memoize particle positions
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 2,
        yTravel: Math.random() * 60 + 20,
      })),
    []
  );

  const handleSkip = useCallback(() => {
    setProgress(100);
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 200);
  }, [onComplete]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  // Fast, responsive progress ticker (reaches 100% in ~800ms)
  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 100);

      const completeTimer = setTimeout(() => {
        onComplete();
      }, 400);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }

    const timer = setTimeout(() => {
      setProgress((prev) => {
        const increment = Math.random() * 4 + 3.5;
        return Math.min(100, prev + increment);
      });
    }, 25);

    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] overflow-hidden flex flex-col items-center justify-between"
          style={{
            background: "linear-gradient(180deg, #100B09 0%, #17110E 50%, #211713 100%)",
          }}
        >
          {/* Subtle Jali Background Texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(184, 138, 69, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(184, 138, 69, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 35%, rgba(16,11,9,0.7) 70%, rgba(16,11,9,0.95) 100%)",
            }}
          />

          {/* Floating Particles */}
          <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#B88A45]"
                style={{
                  width: p.size + "px",
                  height: p.size + "px",
                  left: p.left + "%",
                  top: p.top + "%",
                }}
                animate={{
                  y: [0, -p.yTravel],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
                }}
              />
            ))}
          </div>

          {/* HUD Frame Corners */}
          <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-[10] pointer-events-none w-10 h-10 sm:w-16 sm:h-16">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <path d="M 0 24 L 0 6 Q 0 0 6 0 L 24 0" stroke="#B88A45" strokeWidth="1.5" opacity="0.6" />
              <rect x="0" y="0" width="3" height="3" fill="#B95745" />
            </svg>
          </div>

          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-[10] pointer-events-none w-10 h-10 sm:w-16 sm:h-16">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <path d="M 64 24 L 64 6 Q 64 0 58 0 L 40 0" stroke="#B88A45" strokeWidth="1.5" opacity="0.6" />
              <rect x="61" y="0" width="3" height="3" fill="#B95745" />
            </svg>
          </div>

          {/* SKIP BUTTON */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-6 sm:top-6 sm:right-10 z-[20] rounded-full border border-[#B88A45]/40 bg-[#17110E]/90 px-4 py-1.5 font-mono text-[10px] sm:text-xs text-[#B88A45] tracking-wider transition-all duration-200 hover:bg-[#B88A45] hover:text-[#17110E] focus:outline-none cursor-pointer"
          >
            SKIP INTRO (ESC)
          </button>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col items-center justify-center z-[15] w-full px-4 max-w-md mx-auto">
            {/* LOGO SECTION */}
            <motion.div
              className="relative mb-5 flex justify-center items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div
                className="absolute w-28 h-28 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(184,138,69,0.2) 0%, transparent 70%)",
                }}
              />

              <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#B88A45]/50 shadow-[0_0_25px_rgba(184,138,69,0.2)] bg-[#211713] flex items-center justify-center p-3">
                <Image
                  src="/logo.png"
                  alt="Code-e-Manipal 2.0"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* BRAND TITLES */}
            <motion.div
              className="text-center mb-1"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(180deg, #F4EBDD 0%, #B88A45 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                CODE-ए-MANIPAL 2.0
              </h1>
              <p className="text-[10px] sm:text-xs tracking-[0.25em] font-medium uppercase text-[#B88A45]/90 mt-1">
                Manipal University Jaipur
              </p>
            </motion.div>

            {/* PROGRESS CARD */}
            <motion.div
              className="w-full mt-6 rounded-2xl border border-[#B88A45]/30 bg-[#211713] p-5 shadow-2xl"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-neutral-300">
                  Initializing Workspace...
                </span>
                <span className="text-sm font-mono font-bold text-[#B88A45]">
                  {Math.min(Math.round(progress), 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-black/60 border border-[#B88A45]/20 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#B95745] via-[#B88A45] to-[#C97878] rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-[10px] text-muted-foreground font-mono">
                <span className="text-[#B88A45]/80">E-CELL &amp; LEARNIT</span>
                <span className="text-[#B95745]">OCT 15-16, 2026</span>
              </div>
            </motion.div>
          </div>

          {/* FOOTER */}
          <div className="z-[15] pb-4 sm:pb-6 text-center">
            <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-[#D4AB65]/60 font-medium">
              A Premier 36-Hour Hackathon
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
