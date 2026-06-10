"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/components/AuthProvider"

import { Header } from "@/components/Header"
import { StatCard } from "@/components/StatCard"
const LifecycleManagement = dynamic(
  () => import("@/components/LifecycleManagement").then((m) => m.LifecycleManagement),
  { ssr: false }
);
const JudgeAssignment = dynamic(
  () => import("@/components/JudgeAssignment").then((m) => m.JudgeAssignment),
  { ssr: false }
);
const ResultsManagement = dynamic(
  () => import("@/components/ResultsManagement").then((m) => m.ResultsManagement),
  { ssr: false }
);
const DataExport = dynamic(
  () => import("@/components/DataExport").then((m) => m.DataExport),
  { ssr: false }
);

import { Users, FileText, Scale, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminPage(){
  const { role, isAuthenticated } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState({
    total_teams: 0,
    total_submissions: 0,
    reviewed_count: 0,
    submitted_count: 0,
  })

  useEffect(()=>{
    if(!isAuthenticated){
      router.push("/login")
      return
    }
    if(role !== "admin"){
      router.push("/team")
      return
    }

    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setStats({
            total_teams: json.data.total_teams ?? 0,
            total_submissions: json.data.total_submissions ?? 0,
            reviewed_count: json.data.reviewed_count ?? 0,
            submitted_count: json.data.submitted_count ?? 0,
          })
        }
      })
      .catch(console.error)
  },[role,isAuthenticated,router])

  if(!isAuthenticated) return <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">Checking access...</div>
  if(role !== "admin") return <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">Redirecting...</div>

  return(
    <div className="min-h-screen relative overflow-hidden bg-[#050816]">
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
            <StatCard title="Total Teams" value={stats.total_teams} icon={Users}/>
            <StatCard title="Total Submissions" value={stats.total_submissions} icon={FileText}/>
            <StatCard title="Submitted" value={stats.submitted_count} icon={Scale}/>
            <StatCard title="Reviewed" value={stats.reviewed_count} icon={CheckCircle}/>
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
