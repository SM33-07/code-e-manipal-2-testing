"use client"

import { useEffect, useState } from "react"
import GlassCard from "@/components/ui/GlassCard"
import { Trophy, Activity } from "lucide-react"

export default function ResultsPage() {
  const [ranked, setRanked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/admin/results")
      const json = await res.json()
      const data = Array.isArray(json.data) ? json.data : []

      setRanked(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch results:", err)
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
      <div className="flex justify-between items-center">
        <h1 className="text-white text-3xl flex items-center gap-3">
          <Trophy className="text-yellow-400"/>
          Hackathon Leaderboard
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

      {ranked.length === 0 && (
        <GlassCard className="p-6 text-center">
          <p className="text-white/70">No reviewed submissions yet</p>
        </GlassCard>
      )}

      {ranked.map((entry, i) => (
        <GlassCard
          key={entry.id}
          className="p-6 flex justify-between items-center"
        >
          <div>
            <h2 className="text-white text-lg font-semibold">
              #{entry.computed?.rank ?? i + 1} {entry.title}
            </h2>
            <p className="text-white/60">
              {entry.teams?.name ?? "Unknown Team"}
            </p>
            <p className="text-white/40 text-sm mt-1">
              Avg: {entry.computed?.avg_innovation?.toFixed(1) ?? "?"}I · {entry.computed?.avg_technical?.toFixed(1) ?? "?"}T · {entry.computed?.avg_presentation?.toFixed(1) ?? "?"}P · {entry.computed?.avg_impact?.toFixed(1) ?? "?"}M
            </p>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 text-xl font-bold">
              {entry.computed?.total_score?.toFixed(2) ?? "0.00"}
            </p>
            <p className="text-white/50 text-sm">
              {entry.computed?.review_count ?? 0} reviews
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
