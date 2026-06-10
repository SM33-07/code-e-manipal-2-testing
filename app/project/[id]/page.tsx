"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import {
  ArrowLeft,
  Code2,
  Lightbulb,
  BookOpen,
  Github,
  Globe,
  Star
} from "lucide-react"
import dynamic from "next/dynamic"

import AppShell from "@/components/ui/AppShell"
import { Header } from "@/components/Header"
import GlassCard from "@/components/ui/GlassCard"

import { useAuth } from "@/components/AuthProvider"

const JudgeScorePanel = dynamic(
  () => import("@/components/JudgeScorePanel"),
  { ssr: false }
);

export default function ProjectDetail() {
  const params = useParams()
  const router = useRouter()
  const { user, role } = useAuth()
  const id = params.id as string

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProject()
  }, [])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/submissions/${id}`)
      const json = await res.json()
      setProject(json.data)
    } catch (err) {
      console.error("Failed to load project", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <h1 className="text-white text-xl">Loading project...</h1>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <h1 className="text-white text-2xl">Project not found</h1>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10">
          <Header />
          <div className="container mx-auto px-4 py-10">
            <motion.button
              onClick={() => router.push("/gallery")}
              className="flex items-center gap-2 text-white mb-8 hover:text-purple-400"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Gallery
            </motion.button>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <GlassCard className="p-6">
                  <h1 className="text-4xl text-white font-bold">
                    {project.title}
                  </h1>
                  <p className="text-purple-400 mt-2">
                    by {project.teams?.name ?? "Unknown Team"}
                  </p>
                </GlassCard>

                {project.demo_video_url && (
                  <GlassCard className="p-6">
                    <h2 className="text-white text-xl mb-4">Demo Video</h2>
                    <video
                      src={project.demo_video_url}
                      controls
                      autoPlay
                      muted
                      loop
                      className="rounded-lg w-full"
                    />
                  </GlassCard>
                )}

                <GlassCard className="p-6">
                  <h2 className="text-white text-xl flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Project Overview
                  </h2>
                  <p className="text-white/70 mt-3 leading-relaxed">
                    {project.description ?? project.summary}
                  </p>
                </GlassCard>

                {project.technical_challenges && (
                  <GlassCard className="p-6">
                    <h2 className="text-white text-xl flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      Technical Implementation
                    </h2>
                    <p className="text-white/70 mt-3 leading-relaxed">
                      {project.technical_challenges}
                    </p>
                  </GlassCard>
                )}

                {project.lessons_learned && (
                  <GlassCard className="p-6">
                    <h2 className="text-white text-xl flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Reflection
                    </h2>
                    <p className="text-white/70 mt-3 leading-relaxed">
                      {project.lessons_learned}
                    </p>
                  </GlassCard>
                )}
              </div>

              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h3 className="text-white text-lg mb-3 flex items-center gap-2">
                    <Star className="text-yellow-400" />
                    Project Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p className="text-white/70">
                      <span className="text-white">Category:</span> {project.category}
                    </p>
                    <p className="text-white/70">
                      <span className="text-white">Status:</span> {project.status}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="text-white/70">
                        <span className="text-white">Tech:</span> {project.technologies.join(", ")}
                      </p>
                    )}
                  </div>
                </GlassCard>

                {(project.github_url || project.demo_url || project.docs_url) && (
                  <GlassCard className="p-6 space-y-4">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                        <Github className="w-5 h-5" /> GitHub Repository
                      </a>
                    )}
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                        <Globe className="w-5 h-5" /> Live Demo
                      </a>
                    )}
                    {project.docs_url && (
                      <a href={project.docs_url} target="_blank" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                        <BookOpen className="w-5 h-5" /> Documentation
                      </a>
                    )}
                  </GlassCard>
                )}

                {role === "judge" && (
                  <JudgeScorePanel projectId={id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
