import type { Metadata } from "next"
import { AuthProvider } from "@/components/AuthProvider"
import Navbar from "@/components/Navbar"

import { AnimatedBackground } from "@/components/AnimatedBackground"
import { GradientOrbs } from "@/components/GradientOrbs"

import "@/styles/fonts.css"
import "@/styles/index.css"
import "@/styles/tailwind.css"
import "@/styles/theme.css"

export const metadata: Metadata = {
  title: "Code-e-Manipal Portal",
  description: "Hackathon submission and judging platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">

      <body className="min-h-screen bg-[#050816] text-white relative overflow-x-hidden">

        <AuthProvider>

          {/* Global Animated Background */}
          <AnimatedBackground />
          <GradientOrbs />

          {/* Global Navbar */}
          <Navbar />

          {/* Main Page Content */}
          <main className="relative z-10 min-h-screen container mx-auto px-6 py-10">

            {children}

          </main>

        </AuthProvider>

      </body>

    </html>
  )
}
