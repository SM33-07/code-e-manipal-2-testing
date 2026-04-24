"use client"

import { useEffect, useState } from "react"
import GlassCard from "@/components/ui/GlassCard"
import { Trophy, Activity } from "lucide-react"
import { publicAnonKey } from "@/lib/supabase/info"
import WinnerPanel from "@/components/WinnerPanel"

const SERVER_URL =
"https://ihnclawnbtkwvbfqwxfe.supabase.co/functions/v1/make-server-f5beda68"

export default function ResultsPage() {

  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {

    fetchResults()

    const interval = setInterval(() => {
      fetchResults()
    }, 10000) // refresh every 10 seconds

    return () => clearInterval(interval)

  }, [])

  const fetchResults = async () => {

    try {

      const res = await fetch(`${SERVER_URL}/submissions`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      })

      const data = await res.json()

      const ranked = (data.submissions || []).map((p: any) => {

        const scores = p.scores || []

        const avgScore =
          scores.length > 0
            ? scores.reduce((a: number, b: any) => a + b.score, 0) / scores.length
            : 0

        return {
          ...p,
          avgScore,
          judgeCount: scores.length
        }

      })

      ranked.sort((a: any, b: any) => b.avgScore - a.avgScore)

      setProjects(ranked)
      setLastUpdated(new Date())

    } catch (err) {

      console.error("Failed to fetch leaderboard:", err)

    } finally {

      setLoading(false)

    }

  }

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Loading leaderboard...
      </div>
    )
  }

  return (

    <div className="max-w-5xl mx-auto space-y-6">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h1 className="text-white text-3xl flex items-center gap-3">

          <Trophy className="text-yellow-400"/>

          Live Hackathon Leaderboard

        </h1>

        <div className="flex items-center gap-2 text-sm text-green-400">

          <Activity size={16}/>
          Live

        </div>

      </div>

      {lastUpdated && (
        <p className="text-white/40 text-sm">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* WINNER PANEL */}

      <WinnerPanel />

      {/* EMPTY STATE */}

      {projects.length === 0 && (

        <GlassCard className="p-6 text-center">

          <p className="text-white/70">
            No submissions yet
          </p>

        </GlassCard>

      )}

      {/* LEADERBOARD */}

      {projects.map((p, i) => (

        <GlassCard
          key={p.id}
          className="p-6 flex justify-between items-center"
        >

          <div>

            <h2 className="text-white text-lg font-semibold">

              #{i + 1} {p.projectName}

            </h2>

            <p className="text-white/60">
              {p.teamName}
            </p>

          </div>

          <div className="text-right">

            <p className="text-yellow-400 text-xl font-bold">
              {p.avgScore.toFixed(2)}
            </p>

            <p className="text-white/50 text-sm">
              {p.judgeCount} judges
            </p>

          </div>

        </GlassCard>

      ))}

    </div>

  )

}
