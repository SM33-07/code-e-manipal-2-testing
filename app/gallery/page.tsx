"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"
import { projects } from "@/data/projects"

import HeaderGallery from "@/components/HeaderGallery"
import FeaturedProjects from "@/components/FeaturedProjects"
import VideoCarousel from "@/components/VideoCarousel"
import ProjectGrid from "@/components/ProjectGrid"
import { MandalaWatermark, CornerOrnament, JharokhaDivider } from "@/components/ThemeOrnaments"

export default function Gallery() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fade out and scale down the background isometric grid on scroll
  const gridOpacity = useTransform(scrollY, [0, 450], [0.38, 0])
  const gridScale = useTransform(scrollY, [0, 450], [1.02, 0.96])
  const gridTranslateY = useTransform(scrollY, [0, 450], [0, -40])

  // Fade out the Hawa Mahal monument silhouette watermark backdrop on scroll
  const monumentOpacity = useTransform(scrollY, [0, 320], [0.14, 0])
  const monumentScale = useTransform(scrollY, [0, 320], [1.0, 0.94])
  const monumentTranslateY = useTransform(scrollY, [0, 320], [0, -20])

  // Fill a 4x4 isometric background grid using actual project thumbnails
  const bgGridProjects = [...projects, ...projects, ...projects, ...projects].slice(0, 16)

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Scroll-fade Isometric Project Grid Background */}
      <motion.div
        style={{ opacity: gridOpacity, scale: gridScale, y: gridTranslateY }}
        className="absolute inset-0 z-0 pointer-events-none isometric-grid-container h-[85vh] w-full"
      >
        <div className="isometric-grid">
          {bgGridProjects.map((project, idx) => (
            <div key={idx} className="isometric-card bg-jaipur-card">
              <div className="relative w-full h-full opacity-75">
                <Image
                  src={project.videoThumbnail.replace("w=800", "w=200&q=50")}
                  alt={project.title}
                  fill
                  className="object-cover filter grayscale contrast-[1.1] brightness-[0.8]"
                />
              </div>
            </div>
          ))}
        </div>
        {/* Soft parchment gradient mask at the bottom to blend with background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </motion.div>

      {/* Scroll-fade Hawa Mahal Monument Watermark Backdrop */}
      <motion.div
        style={{ opacity: monumentOpacity, scale: monumentScale, y: monumentTranslateY }}
        className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-none top-[6%] h-[380px] w-[640px] max-w-[90vw]"
      >
        <Image
          src={isDark ? "/images/heritage/dark/architectural-atmosphere.webp" : "/images/heritage/light/jaipur-atmosphere.webp"}
          alt="Hawa Mahal Jaipur Monument Silhouette"
          fill
          className="object-contain filter sepia hue-rotate-[320deg] saturate-[0.8] contrast-[1.05]"
          priority
        />
      </motion.div>

      {/* Page Content */}
      <div className="relative z-10">
        <HeaderGallery />

        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div 
              className="relative overflow-hidden"
              style={{
                background: "var(--jaipur-card)",
                border: "1px solid var(--jaipur-secondary-light)",
                borderRadius: 24,
                boxShadow: isDark ? "0 16px 48px rgba(0, 0, 0, 0.4)" : "0 16px 48px rgba(60, 20, 20, 0.06)",
                padding: "48px 40px",
              }}
            >
              {/* Corner ornaments for heritage structure */}
              <CornerOrnament className="absolute top-4 left-4" size={24} />
              <CornerOrnament className="absolute top-4 right-4 rotate-90" size={24} />
              <CornerOrnament className="absolute bottom-4 left-4 -rotate-90" size={24} />
              <CornerOrnament className="absolute bottom-4 right-4 rotate-180" size={24} />

              {/* Mandala background watermarks */}
              <MandalaWatermark className="absolute -top-12 -left-12 pointer-events-none opacity-[0.03]" size={160} />
              <MandalaWatermark className="absolute -bottom-12 -right-12 pointer-events-none opacity-[0.03]" size={160} />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <span className="px-5 py-1.5 rounded-full bg-jaipur-primary/10 border border-jaipur-primary/20 text-jaipur-primary text-xs font-bold tracking-widest uppercase">
                    🏆 Celebrating Innovation & Excellence
                  </span>
                </motion.div>

                <h2 
                  className="text-4xl md:text-5xl font-bold mb-2 text-foreground"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Innovation Knowledge Base
                </h2>

                {/* Jaipur Arch Jharokha Divider */}
                <div className="flex justify-center mb-6">
                  <JharokhaDivider />
                </div>

                <p 
                  className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Explore groundbreaking projects, watch demos, and learn from the
                  technical expertise of our talented teams at Code-e-Manipal 2026
                </p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex justify-center gap-16 mt-10"
                >
                  <div className="text-center">
                    <div 
                      className="text-4xl font-bold text-jaipur-primary"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      8+
                    </div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-1">Projects</div>
                  </div>

                  <div className="text-center">
                    <div 
                      className="text-4xl font-bold text-jaipur-primary"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      25+
                    </div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-1">Participants</div>
                  </div>

                  <div className="text-center">
                    <div 
                      className="text-4xl font-bold text-jaipur-primary"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      30+
                    </div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-1">Technologies</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <FeaturedProjects />
        <VideoCarousel />
        <ProjectGrid />

        {/* Footer */}
        <footer className="border-t border-jaipur-secondary-light py-8 mt-16 bg-jaipur-card/40">
          <div className="max-w-6xl mx-auto px-6 text-center text-muted-foreground/80 text-xs tracking-wider">
            <p>© 2026 LearnIT Club — Code-e-Manipal Hackathon</p>
            <p className="mt-2 font-medium">
              Empowering innovation through technology
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
