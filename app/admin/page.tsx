"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

import { AnimatedBackground } from "@/components/AnimatedBackground"
import { GradientOrbs } from "@/components/GradientOrbs"

import { Header } from "@/components/Header"
import { StatCard } from "@/components/StatCard"
import { LifecycleManagement } from "@/components/LifecycleManagement"
import { JudgeAssignment } from "@/components/JudgeAssignment"
import { ResultsManagement } from "@/components/ResultsManagement"
import { DataExport } from "@/components/DataExport"

import { Users, FileText, Scale, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminPage(){

  const { role, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(()=>{

    if(!isAuthenticated){
      router.push("/login")
      return
    }

    if(role !== "admin"){
      router.push("/team")
    }

  },[role,isAuthenticated,router])

  if(!isAuthenticated || role !== "admin") return null

  return(

    <div className="min-h-screen relative overflow-hidden bg-[#050816]">

      <AnimatedBackground/>
      <GradientOrbs/>

      <div className="relative z-10">

        <Header/>

        <main className="container mx-auto px-6 py-10">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">
              LearnIT Admin Dashboard
            </h1>
            <p className="text-white/60 mt-1">
              Hackathon Control Center
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            <StatCard title="Total Teams" value={48} icon={Users}/>
            <StatCard title="Total Submissions" value={42} icon={FileText}/>
            <StatCard title="Judges Assigned" value={12} icon={Scale}/>
            <StatCard title="Submissions Judged" value={28} icon={CheckCircle}/>

          </div>

          <div className="space-y-10">

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <LifecycleManagement/>
            </motion.div>

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <JudgeAssignment/>
            </motion.div>

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <ResultsManagement/>
            </motion.div>

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <DataExport/>
            </motion.div>

          </div>

        </main>

      </div>

    </div>
  )
}
