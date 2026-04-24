"use client"

import { motion } from "framer-motion"
import { projects } from "@/data/projects"
import { Trophy, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function FeaturedProjects() {

  const router = useRouter()
  const featuredProjects = projects.filter(p => p.featured)

  const getBadgeColor = (placement?: string) => {
    switch (placement) {
      case "1st":
        return "from-yellow-400 to-yellow-600"
      case "2nd":
        return "from-gray-300 to-gray-500"
      case "3rd":
        return "from-orange-400 to-orange-600"
      default:
        return "from-purple-400 to-purple-600"
    }
  }

  const getBadgeText = (project:any) => {
    if (project.placement === "special") {
      return project.specialAward || "Special Award"
    }
    return `${project.placement?.toUpperCase()} PLACE`
  }

  return (
    <section className="py-12 relative">

      <div className="container mx-auto px-4">

        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6 }}
          className="text-center mb-10"
        >
          <span className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/20 text-yellow-300 text-sm">
            ⭐ Top Winners
          </span>

          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-white">
            Featured Winners
          </h2>

          <p className="text-white/60">
            Top innovations from Code-e-Manipal
          </p>

        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {featuredProjects.map((project,index)=>(
            <motion.div
              key={project.id}
              initial={{ opacity:0,y:30 }}
              animate={{ opacity:1,y:0 }}
              transition={{ delay:index*0.1 }}
            >

              <div
                onClick={()=>router.push(`/project/${project.id}`)}
                className="cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >

                <div className="relative aspect-video">

                  <Image
                    src={project.videoThumbnail}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />

                </div>

                <div className="p-4">

                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getBadgeColor(project.placement)}`}>
                    {project.placement === "special" ? (
                      <Award className="w-4 h-4 text-white"/>
                    ) : (
                      <Trophy className="w-4 h-4 text-white"/>
                    )}

                    <span className="text-xs font-bold text-white">
                      {getBadgeText(project)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3">
                    {project.title}
                  </h3>

                  <p className="text-purple-400 text-sm">
                    {project.teamName}
                  </p>

                </div>

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  )
}
