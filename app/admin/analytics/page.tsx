"use client"

import { useEffect, useState } from "react"

import GlassCard from "@/components/ui/GlassCard"

import { BarChart3, Users, FileText, Scale } from "lucide-react"

import { publicAnonKey } from "@/lib/supabase/info"

const SERVER_URL =
"https://ihnclawnbtkwvbfqwxfe.supabase.co/functions/v1/make-server-f5beda68"

export default function AnalyticsPage(){

  const [stats,setStats] = useState<any>({
    submissions:0,
    categories:{},
    avgScore:0
  })

  useEffect(()=>{
    loadAnalytics()
  },[])

  const loadAnalytics = async()=>{

    const res = await fetch(`${SERVER_URL}/submissions`,{
      headers:{
        Authorization:`Bearer ${publicAnonKey}`
      }
    })

    const data = await res.json()

    const submissions = data.submissions || []

    let totalScore = 0
    let scoreCount = 0
    const categories:any = {}

    submissions.forEach((s:any)=>{

      categories[s.category] =
        (categories[s.category] || 0) + 1

      if(s.scores){

        s.scores.forEach((score:any)=>{

          totalScore += score.score
          scoreCount++

        })

      }

    })

    const avgScore =
      scoreCount > 0 ? totalScore / scoreCount : 0

    setStats({
      submissions: submissions.length,
      categories,
      avgScore
    })

  }

  return(

    <div className="max-w-6xl mx-auto space-y-6">

      <h1 className="text-white text-3xl flex items-center gap-3">

        <BarChart3/>

        Hackathon Analytics

      </h1>


      <div className="grid md:grid-cols-3 gap-6">

        <GlassCard className="p-6">

          <FileText className="text-purple-400 mb-2"/>

          <p className="text-white/60 text-sm">
            Total Submissions
          </p>

          <p className="text-white text-3xl">
            {stats.submissions}
          </p>

        </GlassCard>


        <GlassCard className="p-6">

          <Scale className="text-yellow-400 mb-2"/>

          <p className="text-white/60 text-sm">
            Average Judge Score
          </p>

          <p className="text-white text-3xl">
            {stats.avgScore.toFixed(2)}
          </p>

        </GlassCard>


        <GlassCard className="p-6">

          <Users className="text-blue-400 mb-2"/>

          <p className="text-white/60 text-sm">
            Categories
          </p>

          <p className="text-white text-3xl">
            {Object.keys(stats.categories).length}
          </p>

        </GlassCard>

      </div>


      <GlassCard className="p-6">

        <h2 className="text-white text-xl mb-4">
          Category Distribution
        </h2>

        {Object.entries(stats.categories).map(([cat,count]:any)=>(

          <div
            key={cat}
            className="flex justify-between text-white/70 py-2"
          >

            <span>{cat}</span>

            <span>{count}</span>

          </div>

        ))}

      </GlassCard>

    </div>

  )

}
