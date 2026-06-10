"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import GlassCard from "@/components/ui/GlassCard"

export default function WinnerPanel() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const calculateWinners = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/results?min_reviews=1")
      const json = await res.json()
      const data = Array.isArray(json.data) ? json.data : []
      // Top 3 by total_score
      const top3 = data
        .sort((a: any, b: any) => (b.computed?.total_score ?? 0) - (a.computed?.total_score ?? 0))
        .slice(0, 3)
      setWinners(top3)
    } catch (err) {
      console.error("Failed to calculate winners:", err)
    }
    setLoading(false)
  }

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          Hackathon Winners
        </h2>
        <button
          onClick={calculateWinners}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 text-white"
        >
          {loading ? "Calculating..." : "Calculate Winners"}
        </button>
      </div>

      {winners.length > 0 && (
        <div className="space-y-4">
          {winners.map((w, i) => (
            <div key={w.id} className="flex justify-between bg-white/5 p-4 rounded-lg">
              <div>
                <p className="text-white font-semibold">
                  {i === 0 && "🥇 "}
                  {i === 1 && "🥈 "}
                  {i === 2 && "🥉 "}
                  {w.title}
                </p>
                <p className="text-white/60 text-sm">
                  {w.teams?.name ?? "Unknown Team"}
                </p>
              </div>
              <p className="text-yellow-400 font-bold">
                {w.computed?.total_score?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
