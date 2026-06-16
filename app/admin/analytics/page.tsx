"use client"

import { useEffect, useState } from "react"
import { BarChart3, Users, FileText, Scale } from "lucide-react"

function HeritageCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 150,
        background: "white",
        border: "1px solid #EDD8CC",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 2px 8px rgba(90,40,20,0.04)",
      }}
    >
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>({
    total_submissions: 0,
    submitted_count: 0,
    reviewed_count: 0,
    total_teams: 0,
    category_breakdown: {},
    avg_scores: {},
  })

  useEffect(() => { loadAnalytics() }, [])

  const loadAnalytics = async () => {
    try {
      const res  = await fetch("/api/admin/analytics")
      const json = await res.json()
      if (json.data) setStats(json.data)
    } catch (err) {
      console.error("Failed to load analytics:", err)
    }
  }

  const avgScores  = (stats.avg_scores       as Record<string, number>) || {}
  const categories = (stats.category_breakdown as Record<string, number>) || {}
  const avgAll     = Object.values(avgScores).filter(v => v > 0)
  const overallAvg = avgAll.length ? avgAll.reduce((a, b) => a + b, 0) / avgAll.length : 0

  const topStats = [
    { label: "Total Submissions", value: stats.total_submissions, Icon: FileText  },
    { label: "Reviewed",          value: stats.reviewed_count,    Icon: Scale     },
    { label: "Teams",             value: stats.total_teams,       Icon: Users     },
    { label: "Avg Score",         value: overallAvg.toFixed(2),   Icon: BarChart3 },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto 40px", padding: "0 18px" }}>

      <div className="flex items-center" style={{ gap: 12, marginBottom: 2 }}>
        <BarChart3 size={22} style={{ color: "#8B1C2E" }} />
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 700, color: "#4B1F24" }}>
          Hackathon Analytics
        </h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 24 }}>
        {topStats.map(({ label, value, Icon }) => (
          <HeritageCard key={label}>
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, background: "#7B1C2E", borderRadius: "50%", marginBottom: 5 }}>
              <Icon size={18} style={{ color: "white" }} />
            </div>
            <p style={{ fontSize: 13, color: "#9B7060" }}>{label}</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: "#2C1410", lineHeight: 1, marginTop: 4 }}>{value}</p>
          </HeritageCard>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 15 }}>
        <HeritageCard>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#2C1410", marginBottom: 14 }}>Average Scores by Criterion</h2>
          {Object.entries(avgScores).length === 0 ? (
            <p style={{ fontSize: 14, color: "#A08070" }}>No reviews yet</p>
          ) : (
            Object.entries(avgScores).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center" style={{ padding: "8px 0", borderBottom: "1px solid #F5EAE2" }}>
                <span style={{ fontSize: 13, color: "#5C3020", textTransform: "capitalize" }}>{key.replace("score_", "")}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#8B1C2E" }}>{(val as number).toFixed(2)}</span>
              </div>
            ))
          )}
        </HeritageCard>

        <HeritageCard>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#2C1410", marginBottom: 14}}>Category Distribution</h2>
          {Object.entries(categories).length === 0 ? (
            <p style={{ fontSize: 14, color: "#A08070" }}>No submissions yet</p>
          ) : (
            Object.entries(categories).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center" style={{ padding: "12px 0", borderBottom: "1px solid #F5EAE2" }}>
                <span style={{ fontSize: 13, color: "#5C3020" }}>{cat}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#8B1C2E" }}>{count}</span>
              </div>
            ))
          )}
        </HeritageCard>
      </div>
    </div>
  )
}
