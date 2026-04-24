"use client"

import { motion } from "framer-motion"

import HeaderGallery from "@/components/HeaderGallery"
import FeaturedProjects from "@/components/FeaturedProjects"
import VideoCarousel from "@/components/VideoCarousel"
import ProjectGrid from "@/components/ProjectGrid"

import { AnimatedBackground } from "@/components/AnimatedBackground"
import { GradientOrbs } from "@/components/GradientOrbs"
import GlassCard from "@/components/ui/GlassCard"

export default function Gallery() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Global animated backgrounds */}
      <AnimatedBackground />
      <GradientOrbs />

      {/* Page Content */}
      <div className="relative z-10">

        <HeaderGallery />

        {/* Hero Section */}
        <section className="py-16 md:py-24">

          <div className="max-w-6xl mx-auto px-6 text-center">

            <GlassCard className="p-10 rounded-2xl">

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <span className="px-6 py-2 rounded-full bg-blue-500/10 border border-white/10 text-blue-300 text-sm font-medium">
                    🏆 Celebrating Innovation & Excellence
                  </span>
                </motion.div>

                <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                  Innovation Knowledge Base
                </h2>

                <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
                  Explore groundbreaking projects, watch demos, and learn from the
                  technical expertise of our talented teams at Code-e-Manipal 2026
                </p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex justify-center gap-8 mt-12"
                >

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      8+
                    </div>
                    <div className="text-sm text-slate-400 mt-1">Projects</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      25+
                    </div>
                    <div className="text-sm text-slate-400 mt-1">Participants</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-400">
                      30+
                    </div>
                    <div className="text-sm text-slate-400 mt-1">Technologies</div>
                  </div>

                </motion.div>

              </motion.div>

            </GlassCard>

          </div>

        </section>

        {/* Gallery Sections */}

        <FeaturedProjects />

        <VideoCarousel />

        <ProjectGrid />

        {/* Footer */}

        <footer className="border-t border-border py-8 mt-16">

          <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">

            <p>© 2026 LearnIT Club — Code-e-Manipal Hackathon</p>

            <p className="mt-2">
              Empowering innovation through technology
            </p>

          </div>

        </footer>

      </div>

    </div>
  )
}
