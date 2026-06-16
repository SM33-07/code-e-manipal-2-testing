"use client"

import { useEffect, useState } from "react"
import { FileDown, FileText, Search, Trophy } from "lucide-react"

export default function ReportPage() {
  const [ranked,  setRanked]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [minScore, setMinScore] = useState(0)
  const [search,   setSearch]   = useState("")

  useEffect(() => { loadReport() }, [])

  const loadReport = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/admin/results")
      const json = await res.json()
      setRanked(Array.isArray(json.data) ? json.data : [])
    } catch (err) {
      console.error("Failed to load report:", err)
    } finally {
      setLoading(false)
    }
  }

  const qualified = ranked.filter(r => {
    const score = r.computed?.total_score ?? 0
    const matchesSearch = search
      ? r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.teams?.name?.toLowerCase().includes(search.toLowerCase())
      : true
    return score >= minScore && matchesSearch
  })

  const inputStyle = {
    height: 40,
    border: "1px solid #DCC4B5",
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 12,
    background: "white",
    fontSize: 14,
    color: "#2C1410",
    outline: "none",
    fontFamily: "'Inter',sans-serif",
  }

  return (
    <div style={{ maxWidth: 980, width: "100%", margin: "0 auto", padding: "0 20px", boxSizing: "border-box" }}>

      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <Trophy size={22} style={{ color: "#C8941C" }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#4B1F24" }}>
            Final Report
          </h1>
        </div>
        <a
          href="/api/admin/report/export"
          className="flex items-center transition-opacity hover:opacity-80"
          style={{
            gap: 8,
            background: "linear-gradient(135deg,#8B1C2E,#6B142F)",
            color: "white",
            padding: "8px 18px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'Inter',sans-serif",
            textDecoration: "none",
          }}
        >
          <FileDown size={16} />
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          border: "1px solid #EDD8CC",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 16,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "0 2px 8px rgba(90,40,20,0.04)",
        }}
      >
        <div className="flex items-center" style={{ gap: 8 }}>
          <label style={{ fontSize: 13, color: "#8B6040" }}>Min Score:</label>
          <input
            type="number"
            min={0} max={40} step={0.5}
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            style={{ ...inputStyle, width: 72 }}
          />
        </div>
        <div className="flex items-center flex-1" style={{ gap: 8 }}>
          <Search size={15} style={{ color: "#A08070", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by project or team…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ fontSize: 13, color: "#A08070" }}>Loading report…</p>
      ) : qualified.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #EDD8CC", borderRadius: 14, padding: 40, textAlign: "center" }}>
          <FileText size={28} style={{ color: "#DCC4B5", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 14, color: "#A08070" }}>
            {ranked.length === 0 ? "No reviewed submissions yet." : "No submissions match the current filters."}
          </p>
        </div>
      ) : (
        <div style={{ background: "white", border: "1px solid #EDD8CC", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(90,40,20,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FBF3EC", borderBottom: "1px solid #EDD8CC" }}>
                  {["Rank","Team","Project","Category","Status","Innovation","Technical","Presentation","Impact","Reviews","Total"].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#8B6040",
                        textAlign: h === "Total" ? "right" : ["Innovation","Technical","Presentation","Impact","Reviews","Status"].includes(h) ? "center" : "left",
                        whiteSpace: "nowrap",
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {qualified.map((entry: any) => (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: "1px solid #F5EAE2" }}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "#8B1C2E" }}>#{entry.computed?.rank}</td>
                    <td style={{ padding: "12px 14px", fontSize: 14, color: "#2C1410" }}>{entry.teams?.name ?? "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 14, color: "#4A2010" }}>{entry.title}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#9B7060" }}>{entry.category}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 20,
                        background: entry.status === "reviewed" ? "#E8F5E9" : "#FFF8E7",
                        color:      entry.status === "reviewed" ? "#2E7D32"  : "#A0720A",
                        fontWeight: 500,
                      }}>
                        {entry.status}
                      </span>
                    </td>
                    {["avg_innovation","avg_technical","avg_presentation","avg_impact"].map(k => (
                      <td key={k} style={{ padding: "12px 14px", textAlign: "center", fontSize: 14, color: "#5C3020" }}>
                        {entry.computed?.[k]?.toFixed(1) ?? "—"}
                      </td>
                    ))}
                    <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 14, color: "#9B7060" }}>{entry.computed?.review_count ?? 0}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 15, fontWeight: 700, color: "#C8941C", fontFamily: "'Cormorant Garamond',serif" }}>
                      {entry.computed?.total_score?.toFixed(2) ?? "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #F5EAE2", background: "#FDFAF7" }}>
            <p style={{ fontSize: 12, color: "#A08070" }}>
              Showing {qualified.length} of {ranked.length} submissions
              {minScore > 0 && ` · min score: ${minScore}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
