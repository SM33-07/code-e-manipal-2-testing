"use client"

import { useEffect, useState } from "react"
import GlassCard from "@/components/ui/GlassCard"
import { BarChart3, Users, FileText, Scale } from "lucide-react"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>({
    total_submissions: 0,
    submitted_count: 0,
    reviewed_count: 0,
    total_teams: 0,
    category_breakdown: {},
    avg_scores: {},
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics")
      const json = await res.json()
      if (json.data) setStats(json.data)
    } catch (err) {
      console.error("Failed to load analytics:", err)
    }
  }

  const avgScores = stats.avg_scores as Record<string, number> || {}
  const categories = stats.category_breakdown as Record<string, number> || {}
  const avgAll = Object.values(avgScores).filter((v) => v > 0)
  const overallAvg = avgAll.length
    ? avgAll.reduce((a, b) => a + b, 0) / avgAll.length
    : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-white text-3xl flex items-center gap-3">
        <BarChart3 />
        Hackathon Analytics
      </h1>

      <div className="grid md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <FileText className="text-purple-400 mb-2" />
          <p className="text-white/60 text-sm">Total Submissions</p>
          <p className="text-white text-3xl">{stats.total_submissions}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <Scale className="text-yellow-400 mb-2" />
          <p className="text-white/60 text-sm">Reviewed</p>
          <p className="text-white text-3xl">{stats.reviewed_count}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <Users className="text-blue-400 mb-2" />
          <p className="text-white/60 text-sm">Teams</p>
          <p className="text-white text-3xl">{stats.total_teams}</p>
        </GlassCard>

        <GlassCard className="p-6">
          <BarChart3 className="text-green-400 mb-2" />
          <p className="text-white/60 text-sm">Avg Score</p>
          <p className="text-white text-3xl">{overallAvg.toFixed(2)}</p>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-white text-xl mb-4">Average Scores by Criterion</h2>
          {Object.entries(avgScores).length === 0 ? (
            <p className="text-white/40 text-sm">No reviews yet</p>
          ) : (
            Object.entries(avgScores).map(([key, val]) => (
              <div key={key} className="flex justify-between text-white/70 py-2">
                <span className="capitalize">{key.replace("score_", "")}</span>
                <span>{(val as number).toFixed(2)}</span>
              </div>
            ))
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-white text-xl mb-4">Category Distribution</h2>
          {Object.entries(categories).length === 0 ? (
            <p className="text-white/40 text-sm">No submissions yet</p>
          ) : (
            Object.entries(categories).map(([cat, count]) => (
              <div key={cat} className="flex justify-between text-white/70 py-2">
                <span>{cat}</span>
                <span>{count}</span>
              </div>
            ))
          )}
        </GlassCard>
      </div>
    </div>
  )
}
