"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LoaderAnimationProps {
  onComplete: () => void;
}

export default function LoaderAnimation({ onComplete }: LoaderAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize particle positions
  const particles = useMemo(() =>
    Array.from({ length: 25 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 5,
      yTravel: Math.random() * 80 + 30,
    })), []
  );

  // Memoize bird data
  const birds = useMemo(() => [
    { left: "28%", top: "32%", delay: 2, scale: 0.7 },
    { left: "32%", top: "30%", delay: 2.3, scale: 0.5 },
    { left: "68%", top: "31%", delay: 3, scale: 0.6 },
    { left: "72%", top: "33%", delay: 3.4, scale: 0.45 },
    { left: "25%", top: "28%", delay: 4, scale: 0.4 },
  ], []);

  const handleSkip = useCallback(() => {
    setProgress(100);
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  // Smooth, snappy progress counter
  useEffect(() => {
    if (!mounted) return;

    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 150);

      const completeTimer = setTimeout(() => {
        onComplete();
      }, 650);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }

    const timer = setTimeout(() => {
      setProgress((prev) => {
        const increment = Math.random() * 2.5 + 1.2;
        return Math.min(100, prev + increment);
      });
    }, 20);

    return () => clearTimeout(timer);
  }, [progress, onComplete, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] overflow-hidden flex flex-col items-center justify-between"
          style={{ background: "linear-gradient(180deg, #050505 0%, #070a12 50%, #050505 100%)" }}
        >
          {/* Subtle Grid Texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(246,196,83,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(246,196,83,0.3) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Cinematic Vignette */}
          <div
            className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.7) 70%, rgba(5,5,5,0.95) 100%)"
            }}
          />

          {/* MUJ Building Wireframe Background */}
          <motion.div
            className="absolute z-[1] pointer-events-none w-[180vw] sm:w-[97vw] left-[-40vw] sm:left-[1%] -top-[10%] sm:-top-[25%]"
            style={{
              transform: "translateX(-50%)",
              maxWidth: "1650px",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
          >
            <Image
              src="/MUJ-BUILD.webp"
              alt="MUJ Campus Building"
              width={1600}
              height={1600}
              className="w-full h-auto object-contain opacity-[0.35] mix-blend-screen"
              style={{
                filter: "drop-shadow(0 0 12px rgba(246,196,83,0.15))",
              }}
              priority
            />
          </motion.div>

          {/* Floating Particles */}
          <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#F6C453]"
                style={{
                  width: p.size + "px",
                  height: p.size + "px",
                  left: p.left + "%",
                  top: p.top + "%",
                  filter: "blur(0.5px)",
                }}
                animate={{
                  y: [0, -p.yTravel],
                  opacity: [0, 0.7, 0],
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

          {/* Bird Silhouettes */}
          {birds.map((bird, i) => (
            <motion.div
              key={`bird-${i}`}
              className="absolute z-[3] pointer-events-none"
              style={{ left: bird.left, top: bird.top, transform: `scale(${bird.scale})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.25, 0.15, 0] }}
              transition={{ duration: 6, delay: bird.delay, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="24" height="10" viewBox="0 0 24 10" fill="none">
                <path d="M 0 8 Q 6 0 12 5 Q 18 0 24 8" stroke="#F6C453" strokeWidth="1" fill="none" opacity="0.6" />
              </svg>
            </motion.div>
          ))}

          {/* HUD Frame Corners */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[10] pointer-events-none w-10 h-10 sm:w-20 sm:h-20">
            <svg className="w-full h-full sm:w-auto sm:h-auto" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M 0 30 L 0 8 Q 0 0 8 0 L 30 0" stroke="#F6C453" strokeWidth="1.5" opacity="0.5" />
              <path d="M 8 8 L 25 8" stroke="#F6C453" strokeWidth="1" opacity="0.4" />
              <path d="M 8 8 L 8 25" stroke="#F6C453" strokeWidth="1" opacity="0.4" />
              <rect x="0" y="0" width="3" height="3" fill="#F6C453" opacity="0.8" />
            </svg>
          </div>

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[10] pointer-events-none w-10 h-10 sm:w-20 sm:h-20">
            <svg className="w-full h-full sm:w-auto sm:h-auto" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M 80 30 L 80 8 Q 80 0 72 0 L 50 0" stroke="#F6C453" strokeWidth="1.5" opacity="0.5" />
              <path d="M 72 8 L 55 8" stroke="#F6C453" strokeWidth="1" opacity="0.4" />
              <path d="M 72 8 L 72 25" stroke="#F6C453" strokeWidth="1" opacity="0.4" />
              <rect x="77" y="0" width="3" height="3" fill="#F6C453" opacity="0.8" />
            </svg>
          </div>

          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[10] pointer-events-none w-10 h-10 sm:w-20 sm:h-20">
            <svg className="w-full h-full sm:w-auto sm:h-auto" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M 0 50 L 0 72 Q 0 80 8 80 L 30 80" stroke="#F6C453" strokeWidth="1.5" opacity="0.5" />
              <rect x="0" y="77" width="3" height="3" fill="#F6C453" opacity="0.8" />
            </svg>
          </div>

          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-[10] pointer-events-none w-10 h-10 sm:w-20 sm:h-20">
            <svg className="w-full h-full sm:w-auto sm:h-auto" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M 80 50 L 80 72 Q 80 80 72 80 L 50 80" stroke="#F6C453" strokeWidth="1.5" opacity="0.5" />
              <rect x="77" y="77" width="3" height="3" fill="#F6C453" opacity="0.8" />
            </svg>
          </div>

          {/* SKIP BUTTON */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-6 sm:top-6 sm:right-10 z-[20] rounded-full border border-[#F6C453]/40 bg-black/85 px-4 py-1.5 font-mono text-[10px] sm:text-xs text-[#F6C453] tracking-wider transition-all duration-300 hover:bg-[#F6C453] hover:text-black hover:shadow-[0_0_15px_rgba(246,196,83,0.4)] focus:outline-none cursor-pointer"
          >
            SKIP INTRO (ESC)
          </button>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col items-center justify-center z-[15] w-full px-4 max-w-4xl mx-auto">
            {/* LOGO SECTION */}
            <motion.div
              className="relative mb-4 sm:mb-6 flex justify-center items-center"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(246,196,83,0.15) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Animated Circuit Lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[
                  { angle: -30, len: 100 },
                  { angle: 30, len: 90 },
                  { angle: -60, len: 70 },
                  { angle: 60, len: 75 },
                  { angle: 150, len: 55 },
                  { angle: 210, len: 55 },
                ].map((line, i) => (
                  <motion.div
                    key={`circuit-${i}`}
                    className="absolute h-[1px] origin-left"
                    style={{
                      transform: `rotate(${line.angle}deg)`,
                      background: "linear-gradient(90deg, rgba(246,196,83,0.6), rgba(246,196,83,0))",
                    }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: [0, line.len, line.len],
                      opacity: [0, 0.7, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.4 + 0.3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Logo Container */}
              <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 rounded-full border border-[#F6C453]/40 shadow-[0_0_25px_rgba(246,196,83,0.15)] bg-[#050505] flex items-center justify-center p-2">
                <motion.div
                  className="absolute inset-1 rounded-full border border-dashed border-[#F6C453]/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <Image
                  src="/logo.png"
                  alt="Code-e-Manipal Logo"
                  width={90}
                  height={90}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(246,196,83,0.7)]"
                  priority
                />
              </div>
            </motion.div>

            {/* TITLE SECTION */}
            <motion.div
              className="text-center mb-1 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <h1
                className="text-3xl min-[400px]:text-4xl sm:text-5xl md:text-6xl font-serif tracking-widest text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(180deg, #FFF8E1 0%, #F6C453 60%, #C9A227 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 20px rgba(246,196,83,0.3))",
                }}
              >
                LearnIT
              </h1>
            </motion.div>

            <motion.div
              className="text-center mb-1"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <h2
                className="text-[9px] min-[400px]:text-xs md:text-sm tracking-[0.2em] min-[400px]:tracking-[0.35em] font-light uppercase"
                style={{ color: "#F6C453", opacity: 0.8 }}
              >
                Manipal University Jaipur
              </h2>
            </motion.div>

            {/* Three diamonds */}
            <motion.div
              className="flex items-center gap-2 mb-6 sm:mb-8 mt-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="w-1.5 h-1.5 rotate-45 bg-[#F6C453]/50" />
              <div className="w-2 h-2 rotate-45 bg-[#F6C453]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#F6C453]/50" />
            </motion.div>

            {/* LOADING CARD */}
            <motion.div
              className="w-full max-w-lg relative z-[15]"
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            >
              <div
                className="relative p-[2px] rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(246,196,83,0.4), rgba(246,196,83,0.1), rgba(246,196,83,0.4))",
                }}
              >
                <div className="p-[3px] rounded-lg bg-[#0A0A0A]/90">
                  <div
                    className="relative p-[1px] rounded-md"
                    style={{
                      background: "linear-gradient(135deg, rgba(246,196,83,0.5), rgba(246,196,83,0.15), rgba(246,196,83,0.5))",
                    }}
                  >
                    <div className="relative overflow-hidden rounded-md bg-[#0A0A0A] px-6 py-5 md:px-8 md:py-6">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F6C453]/60 to-transparent" />

                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold tracking-wide" style={{ color: "#FFF5E1" }}>
                            CODE-ए-MANIPAL 2.0
                          </h3>
                          <p className="text-xs md:text-sm mt-1 font-light tracking-wider" style={{ color: "rgba(246,196,83,0.6)" }}>
                            Portal is initializing. Please wait.
                          </p>
                        </div>
                        <div className="text-2xl md:text-3xl font-light tabular-nums tracking-tighter" style={{ color: "#F6C453" }}>
                          {Math.min(Math.round(progress), 100)}
                          <span className="text-sm ml-0.5" style={{ color: "rgba(246,196,83,0.5)" }}>%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div
                        className="h-2 w-full rounded-full overflow-hidden relative"
                        style={{ background: "#111111", border: "1px solid rgba(246,196,83,0.15)" }}
                      >
                        <motion.div
                          className="h-full relative"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            background: "linear-gradient(90deg, #C9A227, #F6C453, #FFE066)",
                          }}
                          layout
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 60%)" }} />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/90 shadow-[0_0_10px_rgba(246,196,83,1),0_0_20px_rgba(246,196,83,0.6)]" style={{ filter: "blur(1px)" }} />
                        </motion.div>
                      </div>

                      {/* Micro HUD Elements */}
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-1">
                          <motion.div className="w-1 h-1 bg-[#F6C453]" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                          <motion.div className="w-1 h-1 bg-[#F6C453]" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                          <motion.div className="w-1 h-1 bg-[#F6C453]" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                        </div>
                        <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(246,196,83,0.4)" }}>
                          SYS.INIT.2026
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#F6C453]/60 rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#F6C453]/60 rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#F6C453]/60 rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#F6C453]/60 rounded-br-sm" />
            </motion.div>
          </div>

          {/* FOOTER SECTION */}
          <motion.div
            className="z-[15] pb-4 sm:pb-6 pt-2 sm:pt-4 flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="flex items-center gap-3">
              <div className="hidden min-[400px]:block h-[1px] w-8 bg-gradient-to-r from-transparent to-[#F6C453]/40" />
              <p
                className="text-[8px] min-[400px]:text-[10px] md:text-xs uppercase tracking-[0.15em] min-[400px]:tracking-[0.2em] font-light italic text-center px-2"
                style={{ color: "rgba(246,196,83,0.7)" }}
              >
                Empowering Minds. Building the Future.
              </p>
              <div className="hidden min-[400px]:block h-[1px] w-8 bg-gradient-to-l from-transparent to-[#F6C453]/40" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
