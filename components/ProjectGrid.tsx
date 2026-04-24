"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { projects, categories, allTechnologies } from "@/data/projects"

export default function ProjectGrid() {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTech, setSelectedTech] = useState("All")

  const router = useRouter()

  const filteredProjects = projects.filter(project => {

    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.shortIdea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.teamName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory

    const matchesTech =
      selectedTech === "All" || project.technologies.includes(selectedTech)

    return matchesSearch && matchesCategory && matchesTech

  })

  return (
    <section className="py-12 relative">

      <div className="container mx-auto px-4">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >

          <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            All Submissions
          </h2>

          <p className="text-white/60 text-center">
            Explore innovative projects from Code-e-Manipal
          </p>

        </motion.div>

        {/* SEARCH */}
        <div className="relative max-w-2xl mx-auto mb-6">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />

          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40"
          />

        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            <option value="All">All Categories</option>

            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}

          </select>

          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            <option value="All">All Technologies</option>

            {allTechnologies.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}

          </select>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredProjects.map((project, index) => (

            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >

              <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">

                {/* THUMBNAIL */}
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={() => router.push(`/project/${project.id}`)}
                >

                  <Image
                    src={project.videoThumbnail}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                  />

                </div>

                {/* CONTENT */}
                <div className="p-5">

                  <h3
                    onClick={() => router.push(`/project/${project.id}`)}
                    className="text-lg font-bold text-white cursor-pointer"
                  >
                    {project.title}
                  </h3>

                  <p className="text-purple-400 text-sm">
                    {project.teamName}
                  </p>

                  <p className="text-white/70 text-sm mt-2">
                    {project.shortIdea}
                  </p>

                  <button
                    onClick={() => router.push(`/project/${project.id}`)}
                    className="flex items-center gap-2 mt-4 text-blue-400"
                  >
                    View Full Idea
                    <ExternalLink className="w-4 h-4" />
                  </button>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  )
}
