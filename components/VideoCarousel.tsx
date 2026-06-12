"use client"

import { motion } from "framer-motion"
import Slider from "react-slick"
import { projects } from "@/data/projects"
import { useRouter } from "next/navigation"
import Image from "next/image"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

interface VideoCarouselProps {
  videoUrl?: string;
  title?: string;
}

export default function VideoCarousel({ videoUrl, title }: VideoCarouselProps){

  const router = useRouter()

  const settings = {
    dots:true,
    infinite:true,
    speed:500,
    slidesToShow:3,
    slidesToScroll:1,
    autoplay:true,
    autoplaySpeed:4000,
    pauseOnHover:true,
    responsive:[
      { breakpoint:1024, settings:{ slidesToShow:2 }},
      { breakpoint:640, settings:{ slidesToShow:1 }}
    ]
  }

  return(

    <section className="py-12 relative overflow-hidden">

      <div className="container mx-auto px-4">

        <motion.div
          initial={{ opacity:0,y:20 }}
          animate={{ opacity:1,y:0 }}
          transition={{ duration:0.6 }}
          className="text-center mb-10"
        >

          <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm">
            🎬 Video Demos
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Demo Showcase
          </h2>

          <p className="text-white/60">
            Watch project demos from Code-e-Manipal
          </p>

        </motion.div>

        <Slider {...settings}>

          {projects.map(project=>(
            <div key={project.id} className="px-3">

              <div
                onClick={()=>router.push(`/project/${project.id}`)}
                className="cursor-pointer rounded-xl overflow-hidden"
              >

                <div className="relative aspect-video">

                  <Image
                    src={project.videoThumbnail}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />

                </div>

                <div className="p-3 bg-black/40">

                  <h3 className="text-white font-bold">
                    {project.title}
                  </h3>

                  <p className="text-purple-300 text-sm">
                    {project.teamName}
                  </p>

                </div>

              </div>

            </div>
          ))}

        </Slider>

      </div>

    </section>
  )
}
