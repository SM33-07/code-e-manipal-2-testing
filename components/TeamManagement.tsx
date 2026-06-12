"use client"

// ─────────────────────────────────────────────────────────────────────────────
// components/TeamManagement.tsx
//
// BLUEPRINT OVERLAY COMPONENT — Team Dashboard
//
// HOW IT WORKS:
//   • team.webp is the MASTER VISUAL LAYER (rendered in layout.tsx as background).
//   • This component only renders FUNCTIONAL elements — text, forms, buttons —
//     positioned with pixel-exact absolute coordinates that match visual zones
//     already painted inside team.webp.
//   • ALL containers use background:transparent / border:none / boxShadow:none
//     because the artwork already provides card visuals, shadows, and borders.
//   • The user cannot distinguish where the image ends and React begins.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react"
import {
  Users, Lock, Unlock, Copy, Check, UserPlus,
  LogIn, LogOut, Shield, UserCircle,
} from "lucide-react"
import { useAuth } from "./AuthProvider"

// ── Type definitions ──────────────────────────────────────────────────────────
interface TeamMember {
  id: string
  name: string
  email: string
  joinedAt: string
}

interface TeamInfo {
  id: string
  name: string
  leaderId: string
  members: TeamMember[]
  inviteCode: string
  isLocked: boolean
  maxSize: number
  createdAt: string
}

// ── Hackathon config ──────────────────────────────────────────────────────────
const HACKATHON_CONFIG = {
  name: "",
  minTeamSize: 1,
  maxTeamSize: 4,
  phase: 1,
}

// ── Typography tokens ─────────────────────────────────────────────────────────
const F     = "'Inter', sans-serif"
const SERIF = "'Playfair Display', 'Cormorant Garamond', Georgia, serif"

// ── Helpers ───────────────────────────────────────────────────────────────────
function mapApiTeamToInfo(team: any): TeamInfo {
  const members: TeamMember[] = (team.team_members || []).map((m: any) => ({
    id: m.user_id,
    name: m.profiles?.name || m.name || "Unknown",
    email: m.profiles?.email || m.email || "",
    joinedAt: m.joined_at,
  }))
  const leader = team.team_members?.find((m: any) => m.role === "leader")
  return {
    id: team.id,
    name: team.name,
    leaderId: leader?.user_id || team.created_by || "",
    members,
    inviteCode: team.invite_code || "",
    isLocked: team.is_locked || false,
    maxSize: HACKATHON_CONFIG.maxTeamSize,
    createdAt: team.created_at,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export function TeamManagement() {
  const { user, role, isAuthenticated, login, logout } = useAuth()

  // ── State ─────────────────────────────────────────────────────────────────
  const [allTeams, setAllTeams]       = useState<TeamInfo[]>([])
  const [myTeam, setMyTeam]           = useState<TeamInfo | null>(null)
  const [teamName, setTeamName]       = useState("")
  const [inviteCode, setInviteCode]   = useState("")
  const [copiedCode, setCopiedCode]   = useState(false)
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(true)

  // ── Fetch data from API on mount ──────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTeam()
      fetchAllTeams()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  // ── Auto-refresh every 5s when in a team — picks up new members & stable code ──
  useEffect(() => {
    if (!myTeam) return
    const id = setInterval(fetchMyTeam, 5000)
    return () => clearInterval(id)
  }, [myTeam?.id])

  const fetchMyTeam = async () => {
    try {
      const res = await fetch("/api/teams")
      if (res.ok) {
        const json = await res.json()
        setMyTeam(mapApiTeamToInfo(json.data))
      } else {
        setMyTeam(null)
      }
    } catch {
      setMyTeam(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTeams = async () => {
    try {
      const res = await fetch("/api/teams?all=true")
      if (res.ok) {
        const json = await res.json()
        setAllTeams((json.data || []).map(mapApiTeamToInfo))
      }
    } catch {
      // silently fail
    }
  }

  const refreshAll = async () => {
    await Promise.all([fetchMyTeam(), fetchAllTeams()])
  }

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      setEmail(""); setPassword(""); setError("")
    } catch {
      setError("Login failed")
    }
  }

  // ── Create Team — calls POST /api/teams ───────────────────────────────────
  const createTeam = async () => {
    if (!user)            return setError("Please log in to create a team")
    if (!teamName.trim()) return setError("Please enter a team name")
    if (myTeam)           return setError("You are already in a team")
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: teamName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        return setError(data.error || "Failed to create team")
      }
      setTeamName(""); setError("")
      await refreshAll()
    } catch {
      setError("Failed to create team. Please try again.")
    }
  }

  // ── Join Team — calls POST /api/teams ─────────────────────────────────────
  const joinTeam = async () => {
    if (!user)              return setError("Please log in to join a team")
    if (!inviteCode.trim()) return setError("Please enter an invite code")
    if (myTeam)             return setError("You are already in a team. Leave your current team first.")
      try {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", invite_code: inviteCode.trim() }),
        })
      if (!res.ok) {
        const data = await res.json()
        return setError(data.error || "Invalid invite code")
      }
      setInviteCode(""); setError("")
      await refreshAll()
    } catch {
      setError("Failed to join team. Please try again.")
    }
  }

  // ── Leave / Disband Team ──────────────────────────────────────────────────
  const leaveTeam = async () => {
    if (!myTeam || !user) return
    try {
      if (myTeam.leaderId === user.id) {
        if (myTeam.members.length > 1) return setError("Transfer leadership or disband the team first")
        const res = await fetch(`/api/teams/${myTeam.id}`, { method: "DELETE" })
        if (!res.ok) {
          const data = await res.json()
          return setError(data.error || "Failed to disband team")
        }
      } else {
        const res = await fetch(`/api/teams/${myTeam.id}/members`, { method: "DELETE" })
        if (!res.ok) {
          const data = await res.json()
          return setError(data.error || "Failed to leave team")
        }
      }
      setError("")
      await refreshAll()
    } catch {
      setError("An error occurred. Please try again.")
    }
  }

  // ── Toggle lock — calls PUT /api/teams/[id] ───────────────────────────────
  const toggleLock = async () => {
    if (!myTeam || !user || myTeam.leaderId !== user.id) return
    if (HACKATHON_CONFIG.phase === 2 && !myTeam.isLocked) return setError("Cannot unlock team during Phase 2")
    try {
      const res = await fetch(`/api/teams/${myTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_locked: !myTeam.isLocked }),
      })
      if (!res.ok) {
        const data = await res.json()
        return setError(data.error || "Failed to update team")
      }
      setError("")
      await refreshAll()
    } catch {
      setError("An error occurred. Please try again.")
    }
  }

  // ── Copy invite code to clipboard ─────────────────────────────────────────
  const copyInviteCode = () => {
    if (myTeam) {
      navigator.clipboard.writeText(myTeam.inviteCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const isTeamLeader = myTeam && user && myTeam.leaderId === user.id

  // ── LOGIN WALL ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ position: "absolute", left: 654, top: 359, width: 420 }}>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required
            style={inputStyle}
          />
          <input
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" required
            style={inputStyle}
          />
          {error && <span style={errorStyle}>{error}</span>}
          <button type="submit" style={primaryBtn}>Sign In with SSO</button>
        </form>
      </div>
    )
  }

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        position: "absolute", left: 300, top: 420, width: 540, height: 370,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: F, fontSize: 16, color: "#8B1C2E",
      }}>
        Loading your team...
      </div>
    )
  }

  // ── AUTHENTICATED DASHBOARD ───────────────────────────────────────────────
  return (
    <>

      {/* ── HERO TEXT BLOCK ────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", left: 200, top: 118, width: 1040, height: 230 }}>
        <h1 style={{
          position: "absolute", left: 80, top: 48,
          fontFamily: SERIF, fontSize: 62, fontWeight: 700,
          color: "#8B1C2E", lineHeight: 1.1, margin: 0,
        }}>
          
        </h1>
        <p style={{
          position: "absolute", left: 92, top: 155,
          fontFamily: F, fontSize: 18, color: "#7A4B38", margin: 0,
        }}>
          {HACKATHON_CONFIG.name}
        </p>
        <div style={{
          position: "absolute", left: 92, top: 220,
          width: 0, height: 2,
          background: "linear-gradient(to right, #C8941C, transparent)",
        }} />
      </div>

      {/* ── PHASE BAR ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", left: 220, top: 350,
        width: 1100, height: 60,
        background: "transparent",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(200,160,110,0.25)",
        borderRadius: 20,
        boxShadow: "0 4px 20px rgba(120,70,40,0.07)",
        display: "flex", alignItems: "center", gap: 20, paddingInline: 28,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(139,28,46,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Shield size={24} style={{ color: "#C8941C" }} />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 23, fontWeight: 700, color: "#8B1C2E", fontFamily: F }}>
            Phase {HACKATHON_CONFIG.phase}:
          </span>
          <span style={{ fontSize: 23, color: "#7A4B38", fontFamily: F, marginLeft: 5 }}>
            {HACKATHON_CONFIG.phase === 1 ? "Team Registration Open" : "Submission Period — Teams Locked"}
            {" — "}Team size: {HACKATHON_CONFIG.minTeamSize}–{HACKATHON_CONFIG.maxTeamSize} members
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
            height: 38, padding: "0 18px", borderRadius: 10,
            background: "transparent", border: "none", boxShadow: "none",
            color: "#8B1C2E", fontSize: 23, fontWeight: 600,
            fontFamily: F, cursor: "pointer",
          }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* ── ERROR BANNER ───────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          position: "absolute", left: 260, top: 492,
          width: 1040,
          padding: "10px 18px",
          background: "rgba(254,240,238,0.9)", borderRadius: 10,
          border: "1px solid #F5C6C0",
          fontSize: 13, color: "#8B1C2E", fontFamily: F,
        }}>
          {error}
        </div>
      )}

      {/* ── LEFT CARD ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", left: 300, top: 420,
        width: 540, height: 370,
        background: "rgba(255,252,248,0.45)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(200,160,110,0.22)",
        borderRadius: 24,
        boxShadow: "0 8px 40px rgba(120,70,40,0.10)",
        overflow: "visible",
      }}>
        {myTeam ? (
          // ── TEAM INFO VIEW ────────────────────────────────────────────────
          <div style={{ padding: "16px 28px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <UserCircle size={29} style={{ color: "#8B1C2E" }} />
                </div>
                <div>
                  <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: "#8B1C2E", margin: 0, lineHeight: 1.1 }}>
                    {myTeam.name}
                  </h1>
                  <p style={{ fontSize: 16, color: "#9A6B56", margin: "4px 0 0", fontFamily: F }}>
                    {isTeamLeader ? "You are the team leader" : "Team member"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, marginTop: 6 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  height: 34, padding: "0 16px",
                  background: "rgba(255,248,240,0.7)", border: "1px solid rgba(228,200,166,0.5)",
                  borderRadius: 999,
                }}>
                  {myTeam.isLocked
                    ? <Lock   size={11} style={{ color: "#8B5A1A" }} />
                    : <Unlock size={11} style={{ color: "#8B5A1A" }} />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#8B5A1A", fontFamily: F }}>
                    {myTeam.isLocked ? "Locked" : "Open"}
                  </span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 50, height: 34,
                  background: "rgba(139,28,46,0.88)", borderRadius: 999,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: F }}>
                    {myTeam.members.length}/{myTeam.maxSize}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, flex: "none" }}>
              <p style={sectionLabel}>Team Members</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {myTeam.members.map((member) => (
                  <div key={member.id} style={{
                    height: 50,
                    background: "rgba(255,248,240,0.70)",
                    border: "1px solid rgba(220,190,160,0.30)",
                    borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingInline: 14,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <UserCircle size={28} style={{ color: "#8B1C2E" }} />
                      <span style={{ fontSize: 19, color: "#5B2D1F", fontFamily: F }}>{member.name}</span>
                    </div>
                    {member.id === myTeam.leaderId && (
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#8B5A1A", fontFamily: F, letterSpacing: "0.5px" }}>
                        LEADER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isTeamLeader && !myTeam.isLocked && myTeam.members.length < myTeam.maxSize && (
              <div style={{ marginTop: 20 }}>
                <p style={sectionLabel}>Invite Code</p>
                <div style={{ display: "flex", gap: 10, position: "relative" }}>
                  <div style={{
                    flex: 1, height: 54,
                    background: "rgba(255,248,235,0.85)",
                    border: "1px solid rgba(200,148,28,0.35)",
                    borderRadius: 14,
                    display: "flex", alignItems: "center",
                    paddingLeft: 18,
                    fontFamily: SERIF, fontSize: 22, color: "#8B1C2E",
                    letterSpacing: "2px", fontWeight: 600,
                  }}>
                    {myTeam.inviteCode}
                  </div>
                  <button
                    type="button"
                    onClick={copyInviteCode}
                    style={{
                      flexShrink: 0,
                      height: 54, padding: "0 22px",
                      borderRadius: 14, border: "none",
                      background: "rgba(139,28,46,0.88)",
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      fontFamily: F, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      boxShadow: "0 3px 10px rgba(139,28,46,0.15)",
                    }}
                  >
                    {copiedCode ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 16, marginTop: 24, alignItems: "center" }}>
              {isTeamLeader && (
                <button
                  type="button"
                  onClick={toggleLock}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    height: 48, padding: "0 22px", borderRadius: 14,
                    border: "1px solid rgba(139,28,46,0.35)",
                    background: "rgba(255,248,240,0.9)",
                    color: "#8B1C2E", fontSize: 14, fontWeight: 600,
                    fontFamily: F, cursor: "pointer",
                  }}
                >
                  {myTeam.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                  {myTeam.isLocked ? "Unlock Team" : "Lock Team"}
                </button>
              )}
              <button
                type="button"
                onClick={leaveTeam}
                style={{
                  background: "none", border: "none",
                  color: "#8B1C2E", fontSize: 14, fontWeight: 600,
                  fontFamily: F, cursor: "pointer", padding: 0,
                }}
              >
                {isTeamLeader ? "Disband Team" : "Leave Team"}
              </button>
            </div>
          </div>
        ) : (
          // ── CREATE / JOIN FORMS ───────────────────────────────────────────
          <div style={{ padding: "28px 32px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Users size={22} style={{ color: "#8B1C2E" }} />
              <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#8B1C2E", margin: 0 }}>
                Create a Team
              </h2>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                style={inputStyle}
              />
              <button type="button" onClick={createTeam} style={primaryBtn}>
                <UserPlus size={15} /> Create
              </button>
            </div>
            <div style={{ borderTop: "1px solid rgba(234,215,202,0.4)", margin: "24px 0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <LogIn size={22} style={{ color: "#8B1C2E" }} />
              <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#8B1C2E", margin: 0 }}>
                Join a Team
              </h2>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={inviteCode}
                placeholder="Enter invite code"
                style={{ ...inputStyle, fontFamily: SERIF, letterSpacing: "2px", fontWeight: 600 }}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <button type="button" onClick={joinTeam} style={primaryBtn}>
                <UserPlus size={15} /> Join
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT CARD — All Teams List (admin only) ────────────────────────── */}
      {role === "admin" && (
        <div style={{
          position: "absolute", left: 860, top: 420,
          width: 380, height: 370,
          background: "rgba(255,252,248,0.40)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(200,160,110,0.22)",
          borderRadius: 24,
          boxShadow: "0 8px 40px rgba(120,70,40,0.10)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          padding: "15px 24px",
          boxSizing: "border-box",
        }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: "#8B1C2E", margin: 0 }}>
            All Teams ({allTeams.length})
          </h2>
          <p style={{ fontSize: 16, color: "#9A6B56", margin: "2px 0 16px", fontFamily: F }}>
            All registered teams
          </p>
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {allTeams.length > 0 ? (
              allTeams.map((team) => (
                <div key={team.id} style={{
                  background: "rgba(255,248,240,1.90)",
                  border: "1px solid rgba(220,190,160,0.30)",
                  borderRadius: 14,
                  padding: "9px 14px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <UserCircle size={20} style={{ color: "#8B1C2E" }} />
                    <div>
                      <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: "#8B1C2E", margin: 0 }}>
                        {team.name}
                      </p>
                      <p style={{ fontSize: 12, color: "#9A6B56", margin: 0, fontFamily: F }}>
                        {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {team.isLocked && <Lock size={10} style={{ color: "#C8941C" }} />}
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#8B1C2E", fontFamily: F,
                      background: "rgba(139,28,46,0.1)", padding: "3px 8px", borderRadius: 999,
                    }}>
                      {team.members.length}/{team.maxSize}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ paddingTop: 24, textAlign: "center", fontSize: 13, color: "#9A6B56", fontFamily: F }}>
                No teams registered yet
              </div>
            )}
          </div>
        </div>
      )}

    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED MICRO-STYLES
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  flex: 1, height: 48, borderRadius: 12,
  border: "1px solid rgba(220,200,185,0.35)",
  background: "rgba(255,253,251,0.15)",
  paddingLeft: 14, fontSize: 14, color: "#5B2D1F",
  fontFamily: "'Inter', sans-serif", outline: "none",
}

const primaryBtn: React.CSSProperties = {
  height: 48, padding: "0 20px", borderRadius: 12, border: "none",
  background: "rgba(139,28,46,0.88)",
  color: "#fff", fontSize: 13, fontWeight: 600,
  fontFamily: "'Inter', sans-serif", cursor: "pointer",
  display: "flex", alignItems: "center", gap: 6,
}

const errorStyle: React.CSSProperties = {
  fontSize: 13, color: "#8B1C2E",
  fontFamily: "'Inter', sans-serif",
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, letterSpacing: "1px", color: "#8B5A1A",
  fontWeight: 600, fontFamily: "'Inter', sans-serif",
  textTransform: "uppercase", margin: "0 0 8px",
}
