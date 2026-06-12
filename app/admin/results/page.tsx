"use client"

import { useEffect, useState } from "react"
import { Trophy, Activity, RefreshCw } from "lucide-react"

export default function ResultsPage() {
  const [ranked,      setRanked]      = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchResults = async () => {
    try {
      const res  = await fetch("/api/admin/results")
      const json = await res.json()
      setRanked(Array.isArray(json.data) ? json.data : [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch results:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100, width: "100%", margin: "310px auto 0", padding: "0 1px", boxSizing: "border-box" }}>

      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div className="flex items-end" style={{ gap: 12 }}>
          <Trophy size={32} style={{ color: "#C8941C" }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: "#4B1F24" }}>
            Hackathon Leaderboard
          </h1>
        </div>
        <div className="flex items-center" style={{ gap: 3 }}>
          <Activity size={14} style={{ color: "#7B8C3A" }} />
          <span style={{ fontSize: 13, color: "#7B8C3A", fontWeight: 500 }}>Live</span>
        </div>
      </div>

      {lastUpdated && (
        <p style={{ fontSize: 12, color: "#A08070", marginBottom: 16 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: 200 }}>
          <RefreshCw size={20} style={{ color: "#8B1C2E", animation: "spin 1s linear infinite" }} />
        </div>
      ) : ranked.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #EDD8CC", borderRadius: 14, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#A08070" }}>No reviewed submissions yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ranked.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                background: "white",
                border: "1px solid #EDD8CC",
                borderRadius: 14,
                padding: "3px 24px",
                boxShadow: "0 2px 8px rgba(90,40,20,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Rank badge */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: i === 0 ? "#C8941C" : i === 1 ? "#A0A0A0" : i === 2 ? "#A0664A" : "#F5EAE2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 5,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: i < 3 ? "white" : "#8B1C2E" }}>
                    {entry.computed?.rank ?? i + 1}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#2C1410" }}>{entry.title}</p>
                  <p style={{ fontSize: 13, color: "#9B7060", marginTop: 2 }}>{entry.teams?.name ?? "Unknown Team"}</p>
                  <p style={{ fontSize: 12, color: "#B09080", marginTop: 4 }}>
                    I:{entry.computed?.avg_innovation?.toFixed(1) ?? "—"} · T:{entry.computed?.avg_technical?.toFixed(1) ?? "—"} · P:{entry.computed?.avg_presentation?.toFixed(1) ?? "—"} · M:{entry.computed?.avg_impact?.toFixed(1) ?? "—"}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#C8941C" }}>
                  {entry.computed?.total_score?.toFixed(2) ?? "0.00"}
                </p>
                <p style={{ fontSize: 12, color: "#9B7060" }}>{entry.computed?.review_count ?? 0} reviews</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
