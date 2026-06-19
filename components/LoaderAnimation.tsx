"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LoaderAnimationProps {
  onComplete: () => void;
}

export default function LoaderAnimation({ onComplete }: LoaderAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("INITIALIZING INNOVATION...");

  // Increment progress counter
  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 300);
      
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1000); // Wait for fade-out animations to complete
      
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }

    const timer = setTimeout(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 8) + 5; // increment between 5% and 12%
        return Math.min(100, prev + increment);
      });
    }, Math.random() * 120 + 80);

    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  // Update loading status text based on progress
  useEffect(() => {
    if (progress < 25) {
      setStatusMessage("INITIALIZING INNOVATION...");
    } else if (progress < 50) {
      setStatusMessage("LOADING SECURE DATABASE...");
    } else if (progress < 75) {
      setStatusMessage("CONFIGURING ENVIRONMENT...");
    } else if (progress < 100) {
      setStatusMessage("PREPARING THE EXPERIENCE...");
    } else {
      setStatusMessage("WELCOME TO CODE-E-MANIPAL");
    }
  }, [progress]);

  const handleSkip = () => {
    setProgress(100);
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-gradient-to-b from-[#06040A] via-[#090514] to-[#040207] overflow-hidden flex flex-col items-center justify-center"
        >
          {/* Background Richness */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(201,162,39,0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(201,162,39,0.2) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#FFE066]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, 20],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
              />
            ))}
          </div>

          {/* Skip Intro Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 z-[99] rounded-full border border-[#C9A227]/30 bg-black/40 px-5 py-2 font-mono text-[10px] sm:text-xs text-[#C9A227] tracking-wider transition-all duration-300 hover:bg-[#C9A227] hover:text-black hover:shadow-[0_0_15px_rgba(201,162,39,0.4)] focus:outline-none cursor-pointer"
          >
            SKIP INTRO
          </button>

          {/* Centerpiece Vector Visualizer */}
          <div className="relative flex flex-col items-center justify-center z-20">
            <svg viewBox="0 0 350 350" className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px]">
              <defs>
                <filter id="loader-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="logo-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#E0E0E0" />
                  <stop offset="100%" stopColor="#9C9C9C" />
                </linearGradient>
                <linearGradient id="loader-gold" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A227" />
                  <stop offset="50%" stopColor="#F0C060" />
                  <stop offset="100%" stopColor="#FFE066" />
                </linearGradient>
                <radialGradient id="goldGlow">
                  <stop offset="0%" stopColor="#FFE066" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#C9A227" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Glowing Outer gold ring */}
              <circle cx="175" cy="175" r="90" fill="none" stroke="url(#loader-gold)" strokeWidth="2" filter="url(#loader-glow)" opacity="0.8" />

              {/* Decorative inner rings */}
              <circle cx="175" cy="175" r="82" fill="none" stroke="rgba(201,162,39,0.25)" strokeWidth="0.8" />
              <circle cx="175" cy="175" r="75" fill="none" stroke="rgba(201,162,39,0.15)" strokeWidth="0.5" strokeDasharray="5 3" />

              {/* MANDALA SECTION (LEFT HALF) */}
              <g transform="translate(175, 175)">
                {Array.from({ length: 17 }).map((_, i) => {
                  const angle = -90 + (i * 180) / 16;
                  return (
                    <g key={i} transform={`rotate(${angle})`}>
                      {/* Outer petal outline */}
                      <motion.path 
                        d="M -90 0 C -100 -12, -112 -12, -120 0 C -112 12, -100 12, -90 0" 
                        fill="none" 
                        stroke="rgba(201,162,39,0.3)" 
                        strokeWidth="0.8" 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: i * 0.04 }}
                      />
                      {/* Inner petal outline */}
                      <motion.path 
                        d="M -90 0 C -96 -6, -104 -6, -108 0 C -104 6, -96 6, -90 0" 
                        fill="none" 
                        stroke="rgba(201,162,39,0.45)" 
                        strokeWidth="0.6" 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: i * 0.04 + 0.1 }}
                      />
                      {/* Petal tip node */}
                      <motion.circle 
                        cx="-120" cy="0" r="1.5" 
                        fill="#FFE066" 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.04 + 0.3 }}
                      />
                    </g>
                  );
                })}
              </g>

              {/* CIRCUIT SECTION (RIGHT HALF) */}
              <g filter="url(#loader-glow)">
                {/* Track 1 (upper right) */}
                <motion.path 
                  d="M 238.6 111.4 L 260 90 L 300 90" 
                  fill="none" 
                  stroke="url(#loader-gold)" 
                  strokeWidth="1.2" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
                />
                <motion.path 
                  d="M 260 90 L 275 75 L 300 75" 
                  fill="none" 
                  stroke="url(#loader-gold)" 
                  strokeWidth="0.8" 
                  opacity="0.7" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.0, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.circle 
                  cx="300" cy="90" r="2.5" 
                  fill="#FFE066" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1.2 }}
                />
                <motion.circle 
                  cx="300" cy="75" r="2" 
                  fill="#FFE066" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1.4 }}
                />

                {/* Track 2 (right-upper-right) */}
                <motion.path 
                  d="M 259.6 144.2 L 280 144.2 L 300 125 L 320 125" 
                  fill="none" 
                  stroke="url(#loader-gold)" 
                  strokeWidth="1.2" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                />
                <motion.circle 
                  cx="320" cy="125" r="2.5" 
                  fill="#FFE066" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1.3 }}
                />

                {/* Track 3 (straight right) */}
                <motion.path 
                  d="M 265 175 L 325 175" 
                  fill="none" 
                  stroke="url(#loader-gold)" 
                  strokeWidth="1.8" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.0, ease: "easeInOut", delay: 0.3 }}
                />
                <motion.circle 
                  cx="325" cy="175" r="3.5" 
                  fill="#FFE066" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1.1 }}
                />

                {/* Track 4 (right-lower-right) */}
                <motion.path 
                  d="M 259.6 205.8 L 280 205.8 L 300 225 L 320 225" 
                  fill="none" 
                  stroke="url(#loader-gold)" 
                  strokeWidth="1.2" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                />
                <motion.circle 
                  cx="320" cy="225" r="2.5" 
                  fill="#FFE066" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1.3 }}
                />

                {/* Track 5 (lower right) */}
                <motion.path 
                  d="M 238.6 238.6 L 260 260 L 300 260" 
                  fill="none" 
                  stroke="url(#loader-gold)" 
                  strokeWidth="1.2" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
                />
                <motion.path 
                  d="M 260 260 L 275 275 L 300 275" 
                  fill="none" 
                  stroke="url(#loader-gold)" 
                  strokeWidth="0.8" 
                  opacity="0.7" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.0, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.circle 
                  cx="300" cy="260" r="2.5" 
                  fill="#FFE066" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1.2 }}
                />
                <motion.circle 
                  cx="300" cy="275" r="2" 
                  fill="#FFE066" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1.4 }}
                />
              </g>

              {/* CENTER LOGO */}
              <radialGradient id="goldGlow">
                <stop offset="0%" stopColor="#FFE066" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#C9A227" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
              </radialGradient>

              <motion.circle
                cx="175"
                cy="175"
                r="55"
                fill="url(#goldGlow)"
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />

              <foreignObject
                x="120"
                y="120"
                width="110"
                height="110"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <Image
                    src="/logo.png"
                    alt="Code-E-Manipal"
                    width={90}
                    height={90}
                    className="drop-shadow-[0_0_20px_rgba(255,224,102,0.55)] object-contain"
                  />

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#FFE066] shadow-[0_0_12px_#FFE066]" />
                  </motion.div>
                </motion.div>
              </foreignObject>
            </svg>
          </div>

          {/* Scanner Sweep */}
          <motion.div
            className="absolute w-[420px] h-[2px] bg-gradient-to-r from-transparent via-[#FFE066] to-transparent blur-sm"
            animate={{
              y: [-120, 120],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* BRAND TITLE SECTION */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center font-serif text-3xl sm:text-4xl font-bold tracking-[0.2em] text-[#F5EFE0] uppercase mt-8"
            style={{
              textShadow: "0 2px 10px rgba(245,239,224,0.12)",
            }}
          >
            Code-E-Manipal
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 mt-2"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B88A72]" />
            <span 
              className="font-mono text-sm font-semibold text-[#B88A72]"
              style={{ letterSpacing: "0.2em" }}
            >
              ♦ 2.0 ♦
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B88A72]" />
          </motion.div>

          {/* STATUS MESSAGE */}
          <motion.p 
            key={statusMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="mt-6 font-mono text-[10px] sm:text-xs tracking-[0.25em] text-[#A08070] text-center uppercase min-h-[16px] px-4"
          >
            {statusMessage}
          </motion.p>

          {/* PROGRESS SLIDER */}
          <div className="w-64 sm:w-80 flex flex-col items-center mt-8 z-20">
            {/* Progress line */}
            <div className="w-full h-[2px] bg-white/10 relative rounded-full">
              {/* Glowing progress fill */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#C9A227] to-[#FFE066] shadow-[0_0_8px_#C9A227] transition-all duration-150 ease-out" 
                style={{ width: `${progress}%` }}
              />
              {/* Glowing sliding orb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#FFE066] border border-[#C9A227] shadow-[0_0_12px_#C9A227] transition-all duration-150 ease-out"
                style={{ left: `calc(${progress}% - 7px)` }}
              />
            </div>

            {/* Monospace progress status and percentage */}
            <span className="mt-4 font-mono text-sm tracking-widest text-[#C9A227] font-bold">
              {progress}%
            </span>
          </div>

          {/* Premium Footer Line */}
          <div className="absolute bottom-14 left-0 right-0 flex justify-center">
            <motion.div
              animate={{
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="h-px w-[450px] bg-gradient-to-r from-transparent via-[#C9A227] to-transparent"
            />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
