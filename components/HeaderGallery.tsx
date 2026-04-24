"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Slider from "react-slick";
import { projects } from "../data/projects";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HeaderGallery() {
  const router = useRouter()

  return (
    <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">

      <div className="container mx-auto px-4 py-6">

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
              width={48}
              height={48}
              className="object-contain"
            />

          </motion.div>

          <div>

            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Code-e-Manipal Hackathon Gallery
            </h1>

            <p className="text-sm text-white/60 mt-1">
              Organized by LearnIT Club
            </p>

          </div>

        </motion.div>

      </div>

    </header>
  )
}
