"use client"

import { useEffect, useState } from "react"
import GlassCard from "@/components/ui/GlassCard"
import { FileDown, FileText, Search, Trophy } from "lucide-react"

export default function ReportPage() {
  const [ranked, setRanked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [minScore, setMinScore] = useState(0)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/results")
      const json = await res.json()
      setRanked(Array.isArray(json.data) ? json.data : [])
    } catch (err) {
      console.error("Failed to load report:", err)
    } finally {
      setLoading(false)
    }
  }

  const qualified = ranked.filter((r) => {
    const score = r.computed?.total_score ?? 0
    const matchesSearch = search
      ? r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.teams?.name?.toLowerCase().includes(search.toLowerCase())
      : true
    return score >= minScore && matchesSearch
  })

  const exportUrl = "/api/admin/report/export"

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-3xl flex items-center gap-3">
          <Trophy className="text-yellow-400" />
          Final Report
        </h1>
        <a
          href={exportUrl}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FileDown size={18} />
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-white/60 text-sm">Min Score:</label>
          <input
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 w-20"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Search size={16} className="text-white/40" />
          <input
            type="text"
            placeholder="Search by project or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 flex-1"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-white/50 text-sm">Loading report...</p>
      ) : qualified.length === 0 ? (
        <GlassCard className="p-6 text-center">
          <FileText className="mx-auto mb-2 text-white/30" size={32} />
          <p className="text-white/70">
            {ranked.length === 0
              ? "No reviewed submissions yet."
              : "No submissions match the current filters."}
          </p>
        </GlassCard>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="text-left py-3 px-2">Rank</th>
                <th className="text-left py-3 px-2">Team</th>
                <th className="text-left py-3 px-2">Project</th>
                <th className="text-left py-3 px-2">Category</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-center py-3 px-2">Innovation</th>
                <th className="text-center py-3 px-2">Technical</th>
                <th className="text-center py-3 px-2">Presentation</th>
                <th className="text-center py-3 px-2">Impact</th>
                <th className="text-center py-3 px-2">Reviews</th>
                <th className="text-right py-3 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {qualified.map((entry: any) => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2 text-white font-bold">
                    #{entry.computed?.rank}
                  </td>
                  <td className="py-3 px-2 text-white">
                    {entry.teams?.name ?? "—"}
                  </td>
                  <td className="py-3 px-2 text-white/80">
                    {entry.title}
                  </td>
                  <td className="py-3 px-2 text-white/60">
                    {entry.category}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      entry.status === "reviewed"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-white/70">
                    {entry.computed?.avg_innovation?.toFixed(1) ?? "—"}
                  </td>
                  <td className="py-3 px-2 text-center text-white/70">
                    {entry.computed?.avg_technical?.toFixed(1) ?? "—"}
                  </td>
                  <td className="py-3 px-2 text-center text-white/70">
                    {entry.computed?.avg_presentation?.toFixed(1) ?? "—"}
                  </td>
                  <td className="py-3 px-2 text-center text-white/70">
                    {entry.computed?.avg_impact?.toFixed(1) ?? "—"}
                  </td>
                  <td className="py-3 px-2 text-center text-white/60">
                    {entry.computed?.review_count ?? 0}
                  </td>
                  <td className="py-3 px-2 text-right text-yellow-400 font-bold">
                    {entry.computed?.total_score?.toFixed(2) ?? "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {qualified.length > 0 && (
        <GlassCard className="p-4">
          <p className="text-white/60 text-sm">
            Showing {qualified.length} of {ranked.length} total submissions
            {minScore > 0 && ` (min score: ${minScore})`}
          </p>
        </GlassCard>
      )}
    </div>
  )
}
