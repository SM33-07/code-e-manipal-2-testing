"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function HeaderGallery() {
  const router = useRouter()

  return (
    <header className="relative z-50 border-b border-jaipur-gold/30 bg-background transition-colors duration-300">

      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => router.push("/gallery")}
        >

          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >

            <Image
              src="/logo.png"
              alt="LearnIT Logo"
              width={42}
              height={42}
              className="object-contain"
            />

          </motion.div>

          <div>

            <h1 
              className="text-2xl md:text-3xl font-bold text-jaipur-primary"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Code-e-Manipal Hackathon Gallery
            </h1>

            <p className="text-xs text-muted-foreground mt-0.5 tracking-wider uppercase font-medium">
              Organized by LearnIT Club
            </p>

          </div>

        </motion.div>

        {/* Back to Portal / Login Button */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button
            onClick={() => router.push("/login")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-xl bg-jaipur-primary hover:bg-jaipur-primary-light text-white text-xs md:text-sm font-semibold tracking-wider shadow-md transition-all duration-200 border border-jaipur-gold/30 flex items-center gap-2"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>Portal Login</span>
          </motion.button>
        </div>

      </div>

    </header>
  )
}
