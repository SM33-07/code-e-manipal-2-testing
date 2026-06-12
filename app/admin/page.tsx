"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight, ChevronDown, CheckCircle, FileText,
  Flame, Scale, Shuffle, Trophy, UserCircle, Users, Trash2,
} from "lucide-react"

const stats = [
  { label: "Total Teams",       value: 1,  Icon: Users       },
  { label: "Total Submissions", value: 3,  Icon: FileText    },
  { label: "Submitted",         value: 3,  Icon: Scale       },
  { label: "Reviewed",          value: 3,  Icon: CheckCircle },
]

const submissionOptions = [
  "Unknown — xyz",
  "Unknown — xyz",
  "Unknown — PREM0905's Project",
]

const judgeOptions = [
  "judge@learnit-muj.com",
  "judge2@learnit-muj.com",
]

const initialAssignments = [
  { name: "Unknown — xyz",                sub: "Assigned to: judge@learnit-muj.com" },
  { name: "Unknown — xyz",                sub: "Assigned to: judge@learnit-muj.com" },
  { name: "Unknown — PREM0905's Project", sub: "Assigned to: judge@learnit-muj.com" },
]

const F     = "'Inter', sans-serif"
const SERIF = "'Cormorant Garamond', serif"

/*
  Canvas: 1500×900. Main content origin: left=225, top=12.
  So page coords = canvas coords minus (225, 12).

  From pixel analysis (canvas coords):
    Hero card:     cy ≈ 96–210   → page top = 96-12  = 84,  height=114
    Hero content starts at canvas left ≈ 270 → page left = 270-225 = 45
    Hero card right edge ≈ cx=1460 → width = 1460-270 = 1190

    Stat cards:    cy ≈ 306–406  → page top = 294,  height=100
    Stat left ≈ cx=270 → page left=45
    Stat right ≈ cx=1460 → width=1190

    Judge panel:   cy ≈ 400–870  → page top=388, height=470
    Judge left ≈ cx=270 → page left=45
    Judge right ≈ cx=1050 → width=780

    Results panel: cy ≈ 400–870  → page top=388, height=470
    Results left ≈ cx=1070 → page left=845
    Results right ≈ cx=1460 → width=390
*/

export default function AdminPage() {
  const router = useRouter()
  const [selSub,      setSelSub]      = useState("")
  const [selJudge,    setSelJudge]    = useState("")
  const [assignments, setAssignments] = useState(initialAssignments)

  const canAssign = selSub !== "" && selJudge !== ""

  const handleAssign = () => {
    if (!canAssign) return
    setAssignments(prev => [...prev, { name: selSub, sub: `Assigned to: ${selJudge}` }])
    setSelSub(""); setSelJudge("")
  }

  const handleShuffle = () => {
    const s = submissionOptions[Math.floor(Math.random() * submissionOptions.length)]
    const j = judgeOptions[Math.floor(Math.random() * judgeOptions.length)]
    setAssignments(prev => [...prev, { name: s, sub: `Assigned to: ${j}` }])
  }

  const handleDelete = (i: number) =>
    setAssignments(prev => prev.filter((_, idx) => idx !== i))

  const dropStyle: React.CSSProperties = {
    height: 38, width: "100%",
    border: "1px solid rgba(225,210,198,0.85)", borderRadius: 10,
    background: "rgba(253,246,241,0.92)",
    paddingLeft: 11, paddingRight: 30,
    fontSize: 13, color: "#44211A",
    fontFamily: F, outline: "none", appearance: "none", cursor: "pointer",
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", fontFamily: F }}>

      {/* ═══════════════════════════════════════════
          HERO BANNER
          Canvas: cy=96–210, cx=270–1460
          Page:   top=84,    left=45, w=1190, h=114
      ═══════════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        left: 45, top: 84,
        width: 1190, height: 114,
        display: "flex", alignItems: "center",
        background: "transparent",
        pointerEvents: "none",
      }}>
        {/* Icon bubble — aligns to the flame icon in image */}
        <div style={{
          width: 0, height: 0, flexShrink: 0, borderRadius: 14,
          background: "rgba(139,23,48,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginLeft: 24,
        }}>
          
        </div>
        <div style={{ marginLeft: 18 }}>
          <h1 style={{
            fontFamily: SERIF, fontSize: 24, fontWeight: 700,
            color: "#5A1420", margin: 0, lineHeight: 1.2,
          }}>
            
          </h1>
          <p style={{ fontSize: 13, color: "#A36F55", margin: "4px 0 0", fontFamily: F }}>
            
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          STAT CARDS ROW
          Canvas: cy=306–406, cx=270–1460
          Page:   top=294,    left=45, w=1190, h=100
      ═══════════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        left: 65, top: 298,
        width: 1190, height: 100,
        display: "flex", gap: 18,
      }}>
        {stats.map(({ label, value, Icon }) => (
          <div key={label} style={{
            flex: 1, height: 100,
            background: "transparent",
            display: "flex", alignItems: "center",
            padding: "0 16px", gap: 12,
          }}>
            <div style={{
              width: 40, height: 38, flexShrink: 0, borderRadius: "50%",
              background: "rgba(138,30,53,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={18} style={{ color: "#8A1E35" }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#8D6B61", margin: 0, fontWeight: 500 }}>{label}</p>
              <p style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: "#44211A", margin: "1px 0 0", lineHeight: 1 }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          JUDGE ASSIGNMENT PANEL
          Canvas: cy=400–870, cx=270–1050
          Page:   top=388,    left=45, w=780, h=470
      ═══════════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        left: 55, top: 375,
        width: 700, height: 470,
        display: "flex", flexDirection: "column",
        padding: "20px 22px",
        background: "transparent",
        overflow: "hidden",
      }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <UserCircle size={32} style={{ color: "#8A1E35" }} />
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: "#6E1628", margin: 0, fontFamily: SERIF }}>Judge Assignment</h2>
              <p style={{ fontSize: 13, color: "#8D6B61", margin: "2px 0 0" }}>
                Assign judges to submissions quickly, with a shuffle option to randomize.
              </p>
            </div>
          </div>
          <button type="button" onClick={handleShuffle} style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
            height: 34, padding: "0 13px", borderRadius: 10,
            border: "1px solid rgba(225,210,198,0.9)",
            background: "rgba(253,240,232,0.9)", color: "#6D1B2E",
            fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            <Shuffle size={14} /> Auto-Assign
          </button>
        </div>

        {/* Dropdowns + Assign */}
        <div style={{ display: "flex", gap: 9, marginTop: 13, alignItems: "center", flexShrink: 0 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <select value={selSub} onChange={e => setSelSub(e.target.value)} style={dropStyle}>
              <option value="">Select Submission</option>
              {submissionOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#8A1E35", pointerEvents: "none" }} />
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <select value={selJudge} onChange={e => setSelJudge(e.target.value)} style={dropStyle}>
              <option value="">Select Judge</option>
              {judgeOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#8A1E35", pointerEvents: "none" }} />
          </div>
          <button type="button" onClick={handleAssign} disabled={!canAssign} style={{
            height: 38, padding: "0 18px", borderRadius: 10, border: "none",
            background: canAssign ? "rgba(138,30,53,0.88)" : "rgba(190,155,150,0.7)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 5,
            cursor: canAssign ? "pointer" : "not-allowed", flexShrink: 0,
          }}>
            Assign <ArrowRight size={12} />
          </button>
        </div>

        {/* Assignment list */}
        <div style={{ flex: 1, overflowY: "auto", marginTop: 11, display: "flex", flexDirection: "column", gap: 6 }}>
          {assignments.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 9,
              background: "rgba(251,243,238,0.80)", border: "1px solid rgba(238,220,208,0.75)",
              borderRadius: 10, padding: "8px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(241,217,209,0.85)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <UserCircle size={16} style={{ color: "#8A1E35" }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#44211A", margin: 0 }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: "#8D6B61", margin: "1px 0 0" }}>{item.sub}</p>
                </div>
              </div>
              <button type="button" onClick={() => handleDelete(i)} style={{
                width: 26, height: 26, flexShrink: 0, borderRadius: 7,
                border: "1px solid rgba(228,210,198,0.8)", background: "rgba(255,255,255,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#8A1E35",
              }}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RESULTS MANAGEMENT PANEL
          Canvas: cy=400–870, cx=1070–1460
          Page:   top=388,    left=845, w=390, h=470
      ═══════════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        left: 785, top: 375,
        width: 450, height: 328,
        display: "flex", flexDirection: "column",
        padding: "20px 22px",
        background: "transparent",
        overflow: "hidden",
      }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <Trophy size={28} style={{ color: "#C89A4A" }} />
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: "#6E1628", margin: 0, fontFamily: SERIF }}>Results Management</h2>
            <p style={{ fontSize: 13, color: "#8D6B61", margin: "2px 0 0" }}>
              View the final ranked report with scores and export data.
            </p>
          </div>
        </div>

        <button type="button" onClick={() => router.push("/admin/report")} style={{
          marginTop: 14, height: 38, padding: "0 16px", borderRadius: 10, border: "none",
          background: "rgba(138,30,53,0.88)", color: "#fff",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          flexShrink: 0,
        }}>
          View Full Report <ArrowRight size={12} />
        </button>

        <svg width="44" height="7" viewBox="0 0 44 7" fill="none" style={{ marginTop: 11, flexShrink: 0 }}>
          <line x1="0" y1="3.5" x2="16" y2="3.5" stroke="#D3A64F" strokeWidth="0.9"/>
          <polygon points="22,0.5 25.5,3.5 22,6.5 18.5,3.5" fill="#D3A64F"/>
          <line x1="28" y1="3.5" x2="44" y2="3.5" stroke="#D3A64F" strokeWidth="0.9"/>
        </svg>

        {/* Summary box */}
        <div style={{
          marginTop: 12, flex: 1,
          background: "rgba(251,243,238,0.78)",
          border: "1px solid rgba(238,220,208,0.65)",
          borderRadius: 12, padding: "13px 15px",
          overflow: "hidden",
        }}>
          <p style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em",
            color: "#8D6B61", margin: 0, fontWeight: 500,
          }}>
            Summary
          </p>
          <div style={{ marginTop: 11, display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { label: "Projects reviewed", val: "3"   },
              { label: "Pending reports",   val: "0"   },
              { label: "Export ready",      val: "Yes" },
            ].map(({ label, val }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingBottom: 9, borderBottom: "1px solid rgba(238,224,214,0.8)",
              }}>
                <span style={{ fontSize: 12, color: "#6B4840" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#44211A", fontFamily: SERIF }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
