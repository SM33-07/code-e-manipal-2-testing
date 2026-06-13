"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Grid, List as ListIcon, X, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { projects, categories } from "@/data/projects"

export default function ProjectGrid() {
  const router = useRouter()
  
  // State variables
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [visibleCount, setVisibleCount] = useState(15) // DOM batching size

  // Real-time filtering and sorting (Memoized for performance)
  const processedProjects = useMemo(() => {
    let list = [...projects]

    // 1. Search Filter
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase()
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.shortIdea.toLowerCase().includes(query) ||
          p.teamName.toLowerCase().includes(query) ||
          p.technologies.some(t => t.toLowerCase().includes(query))
      )
    }

    // 2. Pill Filter
    if (activeFilter === "Newest") {
      // Sort by ID descending (mocking time creation)
      list = list.sort((a, b) => b.id.localeCompare(a.id))
    } else if (activeFilter !== "All") {
      list = list.filter(p => p.category === activeFilter)
    }

    return list
  }, [searchTerm, activeFilter])

  // Get active batch for DOM rendering
  const activeBatchProjects = useMemo(() => {
    return processedProjects.slice(0, visibleCount)
  }, [processedProjects, visibleCount])

  // Handle Loading more items (batching DOM updates)
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 15)
  }

  // Handle filter changes (resets pagination)
  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter)
    setVisibleCount(15)
  }

  // Quick filters list
  const quickFilters = ["All", "Newest", ...categories]

  return (
    <section className="py-12 relative z-10">
      <div className="container mx-auto px-4">
        
        {/* ROW 1: THE CONTROL CENTER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5 pb-4 border-b border-[#DFCDBD]/40">
          
          {/* Spotlight Search (Left) */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A7B73]" />
            <input
              type="text"
              placeholder="Search projects by title, team, or tech stack..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setVisibleCount(15)
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none transition-all border text-sm"
              style={{
                background: "rgba(255, 250, 245, 0.92)",
                border: "1px solid #DFCDBD",
                color: "#5B4640",
              }}
            />
          </div>

          {/* Grid / List Toggle (Right) */}
          <div className="flex items-center gap-1.5 bg-[#8F102A]/5 border border-[#DFCDBD]/60 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid" 
                  ? "bg-[#8B1F44] text-white shadow-sm" 
                  : "text-[#8D6B61] hover:bg-[#8F102A]/5"
              }`}
              title="Grid Mode"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list" 
                  ? "bg-[#8B1F44] text-white shadow-sm" 
                  : "text-[#8D6B61] hover:bg-[#8F102A]/5"
              }`}
              title="List Mode"
            >
              <ListIcon size={18} />
            </button>
          </div>

        </div>

        {/* ROW 2: THE QUICK FILTER BAR */}
        <div className="w-full overflow-x-auto scrollbar-none mb-8 -mx-4 px-4">
          <div className="flex gap-2 min-w-max pb-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterSelect(filter)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all"
                style={{
                  background: activeFilter === filter ? "#8B1F44" : "rgba(255, 251, 247, 0.85)",
                  borderColor: activeFilter === filter ? "#8B1F44" : "#E2D0C1",
                  color: activeFilter === filter ? "#FFFFFF" : "#6D524A",
                  boxShadow: activeFilter === filter ? "0 4px 10px rgba(139, 31, 68, 0.15)" : "none"
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN BODY: RESPONSIVE GRID / LIST */}
        {activeBatchProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-[#7A5A4A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              No projects found matching the criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          
          /* GRID MODE: 3-5 columns of square, uniformly cropped images */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeBatchProjects.map((project) => (
              <motion.div
                key={project.id}
                layoutId={`project-container-${project.id}`}
                onClick={() => setSelectedProject(project)}
                className="cursor-pointer group flex flex-col items-center"
              >
                <div 
                  className="w-full aspect-square rounded-xl overflow-hidden relative border border-[#DFCDBD]/50 transition-all duration-300 hover:shadow-md hover:border-[#8F102A]/40"
                  style={{ background: "rgba(252, 246, 239, 0.95)" }}
                >
                  <Image
                    src={project.videoThumbnail}
                    alt={project.title}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-[#8F102A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {/* Tiny Title Below Image */}
                <span 
                  className="text-xs font-semibold text-[#4B1F24] mt-2 text-center line-clamp-1 max-w-full px-1 hover:text-[#8F102A] transition-colors"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {project.title}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          
          /* LIST MODE: Single vertical column with thumbnail on left, details on right */
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {activeBatchProjects.map((project) => (
              <motion.div
                key={project.id}
                layoutId={`project-container-${project.id}`}
                className="flex items-center gap-4 md:gap-6 p-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:border-[#8F102A]/40 group"
                style={{
                  background: "rgba(252, 246, 239, 0.95)",
                  borderColor: "rgba(223, 205, 189, 0.8)",
                }}
              >
                {/* Square Left Thumbnail */}
                <div 
                  onClick={() => setSelectedProject(project)}
                  className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 relative aspect-square rounded-lg overflow-hidden border border-[#DFCDBD]/60 cursor-pointer"
                >
                  <Image
                    src={project.videoThumbnail}
                    alt={project.title}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Right details */}
                <div className="flex-1 min-w-0">
                  <h3 
                    onClick={() => setSelectedProject(project)}
                    className="text-base md:text-xl font-bold text-[#4B1F24] hover:text-[#8F102A] transition-colors cursor-pointer line-clamp-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {project.title}
                  </h3>
                  <span className="text-[10px] md:text-xs text-[#A46A49] font-semibold tracking-wider uppercase">
                    {project.teamName}
                  </span>
                  <p className="text-xs md:text-sm text-[#7A5A4A] mt-1 md:mt-2 line-clamp-2 leading-relaxed">
                    {project.shortIdea}
                  </p>
                </div>

                {/* Direct Hyperlink Button */}
                <button
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="flex-shrink-0 p-2 md:p-3 rounded-xl border border-[#DFCDBD] text-[#8F102A] hover:bg-[#8F102A] hover:text-white hover:border-[#8F102A] transition-all duration-200"
                  title="View details"
                >
                  <ExternalLink size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button (Batch Loader) */}
        {processedProjects.length > visibleCount && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-full border border-[#DFCDBD] text-xs font-bold uppercase tracking-wider text-[#6D524A] bg-[#rgba(255,251,247,0.9)] hover:bg-[#8B1F44] hover:text-white hover:border-[#8B1F44] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Load More Projects
            </button>
          </div>
        )}

        {/* INTERACTIVITY LAYER: LIGHTBOX PREVIEW MODAL */}
        <AnimatePresence>
          {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              
              {/* Dimmed Background Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Lightbox Content Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl z-10 flex flex-col md:flex-row"
                style={{
                  background: "rgba(252, 246, 239, 0.98)",
                  borderColor: "rgba(223, 205, 189, 0.9)",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute right-4 top-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Left Side: Image (aspect-video on mobile, fill on desktop) */}
                <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto md:h-96 overflow-hidden">
                  <Image
                    src={selectedProject.videoThumbnail}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Right Side: Text & Hyperlink Button */}
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                  <div>
                    {/* Category tag */}
                    <span className="inline-block px-2 py-0.5 rounded bg-[#8F102A]/10 border border-[#8F102A]/20 text-[#8F102A] text-[9px] font-bold uppercase tracking-wider mb-2">
                      {selectedProject.category}
                    </span>

                    <h2 
                      className="text-xl md:text-2xl font-bold text-[#4B1F24]"
                      style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}
                    >
                      {selectedProject.title}
                    </h2>

                    <span className="text-xs text-[#A46A49] font-semibold tracking-wider uppercase mt-1 block">
                      {selectedProject.teamName}
                    </span>

                    <p className="text-xs text-[#7A5A4A] mt-3 leading-relaxed max-h-36 overflow-y-auto scrollbar-none pr-1">
                      {selectedProject.shortIdea}
                    </p>

                    {/* Tech stack badges */}
                    <div className="flex flex-wrap gap-1 mt-4">
                      {selectedProject.technologies.map((t: string) => (
                        <span key={t} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#FFF8F1] border border-[#DFCDBD] text-[#6D524A]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Link Button */}
                  <button
                    onClick={() => {
                      setSelectedProject(null)
                      router.push(`/project/${selectedProject.id}`)
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md hover:opacity-90 transition-opacity mt-6 flex items-center justify-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg, #8B1F44, #6D1632)",
                    }}
                  >
                    View Project Details
                    <ExternalLink size={12} />
                  </button>
                </div>
              </motion.div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}
