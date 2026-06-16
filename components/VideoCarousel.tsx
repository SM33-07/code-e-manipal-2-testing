"use client"

import { motion } from "framer-motion"
import Slider from "react-slick"
import { projects } from "@/data/projects"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { OrnamentalDivider } from "./ThemeOrnaments"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

interface VideoCarouselProps {
  videoUrl?: string;
  title?: string;
}

function PrevArrow(props: any) {
  const { onClick } = props
  return (
    <button
      onClick={onClick}
      className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-jaipur-primary hover:bg-jaipur-primary-light text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-jaipur-gold/30 active:scale-95 group focus:outline-none"
      aria-label="Previous slide"
    >
      <ChevronLeft className="w-6 h-6 text-[#FFF8F1] transition-transform group-hover:-translate-x-0.5" />
    </button>
  )
}

function NextArrow(props: any) {
  const { onClick } = props
  return (
    <button
      onClick={onClick}
      className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-jaipur-primary hover:bg-jaipur-primary-light text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-jaipur-gold/30 active:scale-95 group focus:outline-none"
      aria-label="Next slide"
    >
      <ChevronRight className="w-6 h-6 text-[#FFF8F1] transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

export default function VideoCarousel({ videoUrl, title }: VideoCarouselProps){
  const router = useRouter()

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    centerMode: true,
    centerPadding: "24%",
    autoplay: true,
    autoplaySpeed: 4500,
    pauseOnHover: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          centerPadding: "15%",
        }
      },
      {
        breakpoint: 640,
        settings: {
          centerPadding: "8%",
        }
      }
    ]
  }

  return(
    <section className="py-12 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="px-4 py-1.5 rounded-full bg-jaipur-primary/10 border border-jaipur-primary/20 text-jaipur-primary text-xs font-bold tracking-widest uppercase">
            🎬 The Video Chaupal
          </span>

          <h2 
            className="text-3xl md:text-5xl font-bold text-foreground mt-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Explore Our Gallery
          </h2>

          <div className="flex justify-center my-3">
            <OrnamentalDivider />
          </div>

          <p className="text-muted-foreground text-sm mt-1">
            Watch project demos from Code-e-Manipal
          </p>
        </motion.div>

        <div className="video-carousel-container py-4 relative">
          <Slider {...settings}>
            {projects.map(project=>(
              <div key={project.id} className="px-4 focus:outline-none">
                <div
                  onClick={()=>router.push(`/project/${project.id}`)}
                  className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 group bg-jaipur-card border border-jaipur-secondary-light shadow-md hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={project.videoThumbnail}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority
                    />
                    
                    {/* Dark gradient shadow inside card */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end h-1/3">
                      <h3 
                        className="text-white text-lg md:text-xl font-bold line-clamp-1"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-[#F5DCC1] text-xs font-medium tracking-wide uppercase mt-0.5">
                        {project.teamName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  )
}
