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

import AppShell from "@/components/ui/AppShell"
import { Header } from "@/components/Header"
import { AnimatedBackground } from "@/components/AnimatedBackground"
import { GradientOrbs } from "@/components/GradientOrbs"
import GlassCard from "@/components/ui/GlassCard"
import JudgeScorePanel from "@/components/JudgeScorePanel"

import { useAuth } from "@/components/AuthProvider"
import { publicAnonKey } from "@/lib/supabase/info"

const SERVER_URL =
  "https://ihnclawnbtkwvbfqwxfe.supabase.co/functions/v1/make-server-f5beda68"

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

      const res = await fetch(`${SERVER_URL}/submissions/${id}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      })

      const data = await res.json()

      setProject(data.submission)

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

  const scores = project.scores || []

  const avgScore =
    scores.length > 0
      ? scores.reduce((a:any,b:any)=>a+b.score,0) / scores.length
      : 0

  return (

    <AppShell>

      <div className="min-h-screen bg-[#050816] relative overflow-hidden">

        <AnimatedBackground />
        <GradientOrbs />

        <div className="relative z-10">

          <Header />

          <div className="container mx-auto px-4 py-10">

            {/* Back Button */}

            <motion.button
              onClick={() => router.push("/gallery")}
              className="flex items-center gap-2 text-white mb-8 hover:text-purple-400"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Gallery
            </motion.button>

            <div className="grid lg:grid-cols-3 gap-8">

              {/* LEFT SIDE */}

              <div className="lg:col-span-2 space-y-6">

                {/* Title */}

                <GlassCard className="p-6">

                  <h1 className="text-4xl text-white font-bold">
                    {project.projectName}
                  </h1>

                  <p className="text-purple-400 mt-2">
                    by {project.teamName}
                  </p>

                </GlassCard>


                {/* Demo Video */}

                {project.demoUrl && (

                  <GlassCard className="p-6">

                    <h2 className="text-white text-xl mb-4">
                      Demo Video
                    </h2>

                    <video
                      src={project.demoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      className="rounded-lg w-full"
                    />

                  </GlassCard>

                )}


                {/* Overview */}

                <GlassCard className="p-6">

                  <h2 className="text-white text-xl flex items-center gap-2">

                    <Lightbulb className="w-5 h-5" />
                    Project Overview

                  </h2>

                  <p className="text-white/70 mt-3 leading-relaxed">
                    {project.description}
                  </p>

                </GlassCard>


                {/* Technical */}

                <GlassCard className="p-6">

                  <h2 className="text-white text-xl flex items-center gap-2">

                    <Code2 className="w-5 h-5" />
                    Technical Implementation

                  </h2>

                  <p className="text-white/70 mt-3 leading-relaxed">
                    {project.technicalDetails || "Not provided"}
                  </p>

                </GlassCard>


                {/* Reflection */}

                {project.reflection && (

                  <GlassCard className="p-6">

                    <h2 className="text-white text-xl flex items-center gap-2">

                      <BookOpen className="w-5 h-5" />
                      Reflection

                    </h2>

                    <p className="text-white/70 mt-3 leading-relaxed">
                      {project.reflection}
                    </p>

                  </GlassCard>

                )}

              </div>


              {/* RIGHT SIDE */}

              <div className="space-y-6">

                {/* SCORE CARD */}

                <GlassCard className="p-6">

                  <h3 className="text-white text-lg mb-3 flex items-center gap-2">
                    <Star className="text-yellow-400"/>
                    Average Score
                  </h3>

                  <p className="text-3xl text-yellow-400 font-bold">
                    {avgScore.toFixed(2)}
                  </p>

                  <p className="text-white/60 text-sm">
                    {scores.length} judge reviews
                  </p>

                </GlassCard>


                {/* Project Details */}

                <GlassCard className="p-6">

                  <h3 className="text-white text-lg mb-4">
                    Project Details
                  </h3>

                  <div className="space-y-3 text-sm">

                    <p className="text-white/70">
                      <span className="text-white">Category:</span>{" "}
                      {project.category}
                    </p>

                    <p className="text-white/70">
                      <span className="text-white">Submitted:</span>{" "}
                      {new Date(project.submittedAt).toLocaleDateString()}
                    </p>

                  </div>

                </GlassCard>


                {/* Links */}

                <GlassCard className="p-6 space-y-4">

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                    >
                      <Github className="w-5 h-5" />
                      GitHub Repository
                    </a>
                  )}

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                    >
                      <Globe className="w-5 h-5" />
                      Live Demo
                    </a>
                  )}

                </GlassCard>


                {/* JUDGE PANEL */}

                {role === "judge" && (

                  <JudgeScorePanel
                    projectId={id}
                    judgeEmail={user?.email}
                  />

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </AppShell>

  )
}
