"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { projects } from "@/data/projects"
import { Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTheme } from "next-themes"
import { OrnamentalDivider, MandalaWatermark } from "./ThemeOrnaments"

export default function FeaturedProjects() {
  const router = useRouter()
  const sectionRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Track scroll progress of the section relative to viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"]
  })

  // Subtle Y swivel and X tilt instead of a dramatic 360 spin for a shorter, smoother motion
  const rotateY = useTransform(scrollYProgress, [0, 0.8], [-15, 0])
  const rotateX = useTransform(scrollYProgress, [0, 0.8], [15, 0])
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.92, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.3, 1])

  // Screen lid rotation: starts partially closed (85 degrees) and folds open to upright (0 degrees)
  const lidRotateX = useTransform(scrollYProgress, [0.15, 0.85], [85, 0])

  const p1 = projects.find(p => p.placement === '1st')
  const p2 = projects.find(p => p.placement === '2nd')
  const p3 = projects.find(p => p.placement === '3rd')

  const isDark = mounted && resolvedTheme === "dark"

  const winners = isDark
    ? [
        { p: p2, place: "2nd", color: "#808588", bg: "rgba(30, 18, 8, 0.9)", border: "rgba(201, 162, 39, 0.2)", text: "#DFCDBD", team: "#B89A85", link: "#F0C060" },
        { p: p1, place: "1st", color: "#C8941C", bg: "rgba(30, 18, 8, 0.98)", border: "rgba(232, 181, 90, 0.6)", text: "#F0C060", team: "#DFCDBD", link: "#F0C060" },
        { p: p3, place: "3rd", color: "#A0522D", bg: "rgba(30, 18, 8, 0.9)", border: "rgba(201, 162, 39, 0.2)", text: "#B89A85", team: "#B89A85", link: "#B89A85" }
      ]
    : [
        { p: p2, place: "2nd", color: "#808588", bg: "rgba(240, 240, 240, 0.9)", border: "#B4B8B9", text: "#4B1F24", team: "#A46A49", link: "#8F102A" },
        { p: p1, place: "1st", color: "#C8941C", bg: "rgba(255, 248, 230, 0.95)", border: "#E8B55A", text: "#4B1F24", team: "#A46A49", link: "#8F102A" },
        { p: p3, place: "3rd", color: "#A0522D", bg: "rgba(245, 235, 225, 0.9)", border: "#D27D2D", text: "#4B1F24", team: "#A46A49", link: "#8F102A" }
      ]

  if (isMobile) {
    return (
      <section ref={sectionRef} className="py-12 relative overflow-hidden">
        <MandalaWatermark className="absolute -left-16 top-1/3 pointer-events-none opacity-[0.02]" size={160} />
        <MandalaWatermark className="absolute -right-16 bottom-1/3 pointer-events-none opacity-[0.02]" size={160} />

        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="text-center mb-8 relative z-10">
            <span className="px-4 py-1.5 rounded-full bg-[#8F102A]/10 border border-[#8F102A]/20 text-[#8F102A] text-xs font-bold tracking-widest uppercase">
              🏆 The Shahi Darbar
            </span>
            <h2 
              className="text-3xl font-bold mt-3 text-[#4B1F24] dark:text-[#F5EFE0]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Royal Court of Winners
            </h2>
            <div className="flex justify-center my-3">
              <OrnamentalDivider />
            </div>
            <p className="text-[#7A5A4A] dark:text-[#A08070] text-sm max-w-sm mx-auto leading-relaxed">
              Presenting the top three standout innovations evaluated by our panel of judges.
            </p>
          </div>

          <div className="w-full flex flex-col gap-5 max-w-md relative z-10">
            {[
              { p: p1, place: "1st", color: "#C8941C", badgeColor: "bg-amber-500", text: isDark ? "#F0C060" : "#4B1F24" },
              { p: p2, place: "2nd", color: "#808588", badgeColor: "bg-slate-400", text: isDark ? "#DFCDBD" : "#4B1F24" },
              { p: p3, place: "3rd", color: "#A0522D", badgeColor: "bg-amber-700", text: isDark ? "#B89A85" : "#4B1F24" }
            ].map(({ p, place, color, badgeColor, text }) => {
              if (!p) return null;
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/project/${p.id}`)}
                  className="cursor-pointer rounded-2xl border flex flex-col overflow-hidden shadow-md transition-all active:scale-98"
                  style={{
                    background: isDark ? "rgba(30, 18, 8, 0.9)" : "rgba(255, 248, 230, 0.95)",
                    borderColor: isDark ? "rgba(201, 162, 39, 0.3)" : "rgba(233, 216, 199, 0.8)",
                  }}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-[#DFCDBD]/40">
                    <Image
                      src={p.videoThumbnail}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1 bg-black/45 backdrop-blur-sm">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      {place} Place
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        className="text-lg font-bold leading-snug line-clamp-2"
                        style={{ color: isDark ? "#F5EFE0" : "#4B1F24", fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs font-semibold tracking-wide uppercase mt-1.5 text-jaipur-primary">
                        {p.teamName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {p.shortIdea}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-jaipur-primary hover:underline mt-4 inline-block">
                      View Project Details &rarr;
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden">
      {/* Background Watermark decoration */}
      <MandalaWatermark className="absolute -left-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]" size={220} />
      <MandalaWatermark className="absolute -right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]" size={220} />

      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Title / Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 relative z-10"
        >
          <span className="px-4 py-1.5 rounded-full bg-[#8F102A]/10 border border-[#8F102A]/20 text-[#8F102A] text-xs font-bold tracking-widest uppercase">
            🏆 The Shahi Darbar
          </span>

          <h2 
            className="text-3xl md:text-5xl font-bold mt-3 text-[#4B1F24]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Royal Court of Winners
          </h2>

          <div className="flex justify-center my-3">
            <OrnamentalDivider />
          </div>

          <p className="text-[#7A5A4A] text-sm max-w-lg mx-auto leading-relaxed">
            Presenting the top three standout innovations evaluated by our panel of judges. Scroll to watch the laptop open.
          </p>
        </motion.div>

        {/* Laptop Mockup Wrapper */}
        <motion.div
          style={{ rotateY, rotateX, scale, opacity, transformStyle: "preserve-3d" }}
          className="laptop-mockup-wrapper flex flex-col items-center w-full max-w-4xl relative z-10"
        >
          {/* Laptop Screen */}
          <motion.div
            className="laptop-screen-container relative rounded-t-2xl border-[10px] md:border-[14px] border-[#1e1e1e] bg-[#FAF5EE]"
            style={{
              width: "min(720px, 90vw)",
              aspectRatio: "16/10",
              boxShadow: "0 25px 50px -12px rgba(60, 20, 20, 0.15)",
              transformOrigin: "bottom center",
              rotateX: lidRotateX,
              transformStyle: "preserve-3d",
            }}
          >
            {/* FRONT SIDE PANEL (Web Page Content) */}
            <div 
              className="absolute inset-0 p-2 md:p-4 flex flex-col justify-between select-none overflow-hidden rounded-t-lg"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Glossy overlay sheen */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-20" />
              
              {/* Screen Top Bar */}
              <div className="flex justify-between items-center border-b border-[#DFCDBD]/80 pb-1.5 mb-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
                <div className="text-[9px] font-bold text-[#8F102A] tracking-widest uppercase">
                  🏆 CODE-E-MANIPAL HACKATHON
                </div>
                <div className="w-6" /> {/* Spacer */}
              </div>

              {/* Winners Columns */}
              <div className="flex-1 grid grid-cols-3 gap-2 md:gap-4 items-end pb-2">
                {winners.map(({ p, place, color, bg, border, text, team, link }) => {
                  if (!p) return null;
                  const isFirst = place === "1st";

                  return (
                    <motion.div
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/project/${p.id}`)
                      }}
                      className="cursor-pointer rounded-lg border flex flex-col justify-between overflow-hidden shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-md h-[92%] md:h-[95%]"
                      style={{
                        background: bg,
                        borderColor: border,
                        transform: isFirst ? 'scale(1.04)' : 'none',
                        zIndex: isFirst ? 10 : 1
                      }}
                      whileHover={{ scale: isFirst ? 1.08 : 1.04 }}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[#DFCDBD]">
                        <Image
                          src={p.videoThumbnail}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                        {/* Metallic Badge Banner */}
                        <div 
                          className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-0.5"
                          style={{ background: color }}
                        >
                          <Trophy className="w-2 h-2" />
                          {place}
                        </div>
                      </div>

                      {/* Details Area */}
                      <div className="p-1.5 md:p-3 flex-1 flex flex-col justify-between text-center">
                        <div>
                          <h3 
                            className="text-[10px] md:text-xs font-bold line-clamp-2"
                            style={{ color: text, fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            {p.title}
                          </h3>
                          <p 
                            className="text-[8px] md:text-[9px] font-medium tracking-wide uppercase mt-0.5"
                            style={{ color: team }}
                          >
                            {p.teamName}
                          </p>
                        </div>
                        <span 
                          className="text-[7px] md:text-[8px] font-bold underline mt-2 block"
                          style={{ color: link }}
                        >
                          View Project &rarr;
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* BACK SIDE PANEL (Lid Cover) */}
            <div 
              className="absolute inset-0 bg-[#2d2922] border border-[#3e3a32] flex flex-col items-center justify-center rounded-t-lg overflow-hidden"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="flex flex-col items-center gap-2 select-none">
                <Trophy className="w-12 h-12 text-[#E8B55A] animate-pulse" />
                <span 
                  className="text-lg font-bold tracking-widest text-[#E8B55A]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Code-e-Manipal
                </span>
                <span className="text-[8px] tracking-wider uppercase font-semibold text-[#DFCDBD] opacity-60">
                  Judges' Choice
                </span>
              </div>
            </div>
          </motion.div>

          {/* Hinge */}
          <div className="bg-[#111] h-3 w-[min(590px, 74vw)] rounded-b-md shadow-inner" />

          {/* Laptop Keyboard Base */}
          <div
            className="laptop-base h-3 rounded-b-2xl relative"
            style={{
              width: "min(810px, 100vw)",
              boxShadow: "0 20px 45px rgba(60, 20, 20, 0.16)",
            }}
          >
            {/* Touchpad contour */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-[#b8af9f]/40 rounded-b" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
