"use client";

import { AuthProvider } from "@/components/AuthProvider"
import dynamic from "next/dynamic"

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false })
const AnimatedBackground = dynamic(
  () => import("@/components/AnimatedBackground").then((m) => m.AnimatedBackground),
  { ssr: false }
)
const GradientOrbs = dynamic(
  () => import("@/components/GradientOrbs").then((m) => m.GradientOrbs),
  { ssr: false }
)

export default function RootClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AnimatedBackground />
      <GradientOrbs />
      <Navbar />
      <main className="relative z-10 min-h-screen container mx-auto px-6 py-10">
        {children}
      </main>
    </AuthProvider>
  )
}
