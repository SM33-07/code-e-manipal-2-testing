"use client"

import type { ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Scale, Trophy,
  FileText, BarChart3, Settings, LogOut,
  Bell, Shield, ChevronDown,
} from "lucide-react"

const sideNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Teams",     icon: Users,           href: "/team" },
  { label: "Judging",   icon: Scale,           href: "/judging" },
  { label: "Results",   icon: Trophy,          href: "/admin/results" },
  { label: "Report",    icon: FileText,        href: "/admin/report" },
  { label: "Analytics", icon: BarChart3,       href: "/admin/analytics" },
  { label: "Settings",  icon: Settings,        href: "/admin/settings" },
]

const topNav = [
  { label: "Team",    href: "/team" },
  { label: "Submit",  href: "/SubmissionForm" },
  { label: "Judging", href: "/judging" },
  { label: "Admin",   href: "/admin" },
  { label: "Gallery", href: "/gallery" },
]

// Image is 1672×941, canvas is 1500×900
// sx=0.8971, sy=0.9564
const W = 1500
const H = 900

// Derived from pixel analysis:
// Header sits top:18, spans to ~cy=72
// Sidebar: left=0, top=72, width=197 (imgX=220 → cx=197)
// Nav buttons start at cy=195, 42px tall, 5px gap → 47px pitch
// Sidebar artwork zone: cy=608–765 (decorative)
// Logout zone: cy=840–880
// Main content: left=240, top=72

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#F4EDE4" }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: W, height: H,
        transformOrigin: "top left",
        transform: `scale(calc(100vw / ${W}))`,
      }}>

        {/* ── MASTER IMAGE ── */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/images/backgrounds/admin_dashboard.webp)",
          backgroundSize: "100% 100%",
          backgroundPosition: "top left",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }} />

        {/* ── HEADER ── top:18, left:68 matches image header text baseline ── */}
        <header style={{
          position: "absolute",
          top: 18, left: 150,
          width: 1350, height: 54,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}>
          {/* Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
            onClick={() => router.push("/admin")}
          >
            <svg width="0" height="0" viewBox="0 0 0 0" fill="none">
              <path d="M14 3C14 3 10 9 7 11C4 13 4 14 4 14C4 14 7 18 14 18C21 18 24 14 24 14C24 14 24 13 21 11C18 9 14 3 14 3Z" fill="#6D1628"/>
              <circle cx="14" cy="21" r="1.8" fill="#C8941C"/>
            </svg>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#6D1628", lineHeight: 1 }}>
                
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <div style={{ height: 0, width: 0, background: "#C8941C" }} />
                <span style={{ fontSize: 8, fontWeight: 700, color: "#A46A49", letterSpacing: "0.08em" }}></span>
                <div style={{ height: 0, width: 0, background: "#C8941C" }} />
              </div>
            </div>
          </div>

          {/* Top nav — centered */}
          <nav style={{ display: "flex", alignItems: "center", gap: 55 }}>
            {topNav.map(({ label, href }) => {
              const active = label === "Admin"
              return (
                <button key={label} type="button" onClick={() => router.push(href)} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>
                  <span style={{
                    fontSize: 20, fontWeight: 500,
                    color: active ? "#8A1E35" : "#7A5A50",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {label}
                  </span>
                  {active && (
                    <svg width="24" height="6" viewBox="0 0 24 6" fill="none">
                      <line x1="0" y1="3" x2="8" y2="3" stroke="#C8941C" strokeWidth="0.8"/>
                      <polygon points="12,0 15,3 12,6 9,3" fill="#C8941C"/>
                      <line x1="16" y1="3" x2="24" y2="3" stroke="#C8941C" strokeWidth="0.8"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              height: 28, padding: "0 9px",
              background: "rgba(253,240,232,0.9)", border: "1px solid rgba(232,216,204,0.9)",
              borderRadius: 999, cursor: "pointer",
            }}>
              <Shield size={11} style={{ color: "#C8941C" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#6D1628" }}>Admin</span>
              <ChevronDown size={9} style={{ color: "#8D6B61" }} />
            </div>
            <div style={{ position: "relative", cursor: "pointer", padding: 4 }}>
              <Bell size={15} style={{ color: "#8D6B61" }} />
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 13, height: 13, borderRadius: "50%",
                background: "#C1392B", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 7, color: "white", fontWeight: 700 }}>3</span>
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "#8A1E35",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.45)",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>Y</span>
            </div>
          </div>
        </header>

        {/* ── SIDEBAR ── left:64, top:160 — nav starts at cy=195 ── */}
        {/* Image sidebar column is ~64-197px wide, top starts below header ~cy=160 */}
        <aside style={{
          position: "absolute",
          left: 70, top: 230,
          width: 145, height: H - 230,
          display: "flex", flexDirection: "column",
          zIndex: 10,
        }}>

          {/* Nav items: first at top=0, each 42px tall, 5px gap = 47px pitch */}
          {/* Pixel analysis: first active button center at cy=214 (relative: 214-160=54) */}
          <nav style={{ display: "flex", flexDirection: "column", padding: "0 8px", marginTop: 35 }}>
            {sideNav.map(({ label, icon: Icon, href }, idx) => {
              const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => router.push(href)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    height: 41, borderRadius: 9,
                    paddingLeft: 10, paddingRight: 8,
                    border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                    background: isActive ? "rgba(138,30,53,0.85)" : "transparent",
                    boxShadow: isActive ? "0 2px 8px rgba(120,24,44,0.18)" : "none",
                    transition: "background 0.1s",
                    marginBottom: idx < sideNav.length - 1 ? 5 : 0,
                  }}
                >
                  <Icon size={17} style={{ color: isActive ? "#F5DCC1" : "#8A1E35", flexShrink: 0 }} />
                  <span style={{
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#fff" : "#44211A",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Spacer that lets sidebar artwork show through */}
          <div style={{ flex: 1 }} />

          {/* Logout — sits at cy≈855 in canvas → relative: 855-160=695 from aside top */}
          {/* Artwork base (dark brown) ends ~cy=842, light zone cy=842+ = logout safe zone */}
          <div style={{ paddingBottom: 28, padding: "0 8px 28px" }}>
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                width: "100%", height: 44, borderRadius: 12, border: "none", cursor: "pointer",
                background: "rgba(138,30,53,0.88)", color: "white",
                fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                boxShadow: "0 3px 10px rgba(110,18,38,0.22)",
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── left starts after sidebar ~cx=240 ── */}
        <main style={{
          position: "absolute",
          left: 225, top: 12,
          width: W - 225,
          height: H - 12,
          overflowY: "auto",
          zIndex: 10,
        }}>
          {children}
        </main>

      </div>
    </div>
  )
}
