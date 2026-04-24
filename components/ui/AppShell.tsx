"use client"

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GradientOrbs } from "@/components/GradientOrbs";

export default function AppShell({ children }) {
  return (
    <div className="relative min-h-screen bg-[#050816] overflow-hidden">

      <AnimatedBackground />
      <GradientOrbs />

      <div className="relative z-10">
        {children}
      </div>

    </div>
  )
}
