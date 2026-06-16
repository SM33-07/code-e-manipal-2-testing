"use client"

// ─────────────────────────────────────────────────────────────────────────────
// components/TeamManagement.tsx
//
// BLUEPRINT OVERLAY COMPONENT — Team Dashboard
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
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
  leaderName: string
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
    leaderName: team.leader_name || "",
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
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // ── State ─────────────────────────────────────────────────────────────────
  const [allTeams, setAllTeams]       = useState<TeamInfo[]>([])
  const [myTeam, setMyTeam]           = useState<TeamInfo | null>(null)
  const [teamName, setTeamName]       = useState("")
  const [leaderName, setLeaderName]   = useState("")
  const [inviteCode, setInviteCode]   = useState("")
  const [copiedCode, setCopiedCode]   = useState(false)
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Fetch data from API on mount ──────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTeam()
      fetchAllTeams()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  // ── Auto-refresh every 5s when in a team ──
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

  // ── Create Team ───────────────────────────────────────────────────────────
  const createTeam = async () => {
    if (!user)            return setError("Please log in to create a team")
    if (!teamName.trim()) return setError("Please enter a team name")
    if (myTeam)           return setError("You are already in a team")
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: teamName.trim(), leader_name: leaderName.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        return setError(data.error || "Failed to create team")
      }
      setTeamName(""); setLeaderName(""); setError("")
      await refreshAll()
    } catch {
      setError("Failed to create team. Please try again.")
    }
  }

  // ── Join Team ─────────────────────────────────────────────────────────────
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

  // ── Toggle lock ───────────────────────────────────────────────────────────
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

  const isDark = mounted && resolvedTheme === "dark"
  const isTeamLeader = myTeam && user && myTeam.leaderId === user.id

  // Dynamic Theme Definitions
  const inputStyleComputed: React.CSSProperties = {
    flex: 1,
    height: 48,
    borderRadius: 12,
    border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid #DFCDBD",
    background: isDark ? "rgba(15,10,5,0.6)" : "rgba(255,250,245,0.92)",
    paddingLeft: 14,
    fontSize: 14,
    color: isDark ? "#F5EFE0" : "#5B4640",
    fontFamily: F,
    outline: "none",
  }

  const primaryBtnComputed: React.CSSProperties = {
    height: 48,
    padding: "0 20px",
    borderRadius: 12,
    border: "none",
    background: isDark ? "linear-gradient(135deg,#D4732A,#C1440E)" : "linear-gradient(135deg,#8B1F44,#6B142F)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: F,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  }

  const sectionLabelComputed: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: "1px",
    color: isDark ? "#C9A227" : "#8A3150",
    fontWeight: 600,
    fontFamily: F,
    textTransform: "uppercase",
    margin: "0 0 8px",
  }

  // ── LOGIN WALL ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div style={{ width: 420 }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" required
              style={inputStyleComputed}
            />
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required
              style={inputStyleComputed}
            />
            {error && <span style={{ fontSize: 13, color: isDark ? "#F5EFE0" : "#8B1C2E", fontFamily: F }}>{error}</span>}
            <button type="submit" style={primaryBtnComputed}>Sign In with SSO</button>
          </form>
        </div>
      </div>
    )
  }

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div style={{
          width: 540, height: 370,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: F, fontSize: 16, color: isDark ? "#D4732A" : "#8B1C2E",
        }}>
          Loading your team...
        </div>
      </div>
    )
  }

  // ── AUTHENTICATED DASHBOARD ───────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 flex flex-col gap-6 pb-20">

      {/* ── HERO TEXT BLOCK ────────────────────────────────────────────────── */}
      <div className="relative w-full">
        <h1 style={{
          fontFamily: SERIF, fontSize: 48, fontWeight: 700,
          color: isDark ? "#D4732A" : "#8B1F44", lineHeight: 1.1, margin: 0,
        }}>
          Team Dashboard
        </h1>
        <p style={{
          fontFamily: F, fontSize: 18, color: isDark ? "#A08070" : "#6E5A55", margin: "8px 0 0 0",
        }}>
          {HACKATHON_CONFIG.name || "Code-E-Manipal Hackathon"}
        </p>
        <div style={{
          width: "100%", height: 1, marginTop: 16,
          background: isDark ? "linear-gradient(to right, #C9A227, transparent)" : "linear-gradient(to right, #8B1F44, transparent)",
        }} />
      </div>

      {/* ── PHASE BAR ──────────────────────────────────────────────────────── */}
      <div style={{
        width: "100%", height: "auto", minHeight: 60,
        background: isDark ? "#1E1208" : "rgba(252, 246, 239, 0.97)",
        border: isDark ? "1px solid #C9A227" : "1px solid rgba(233, 216, 199, 0.8)",
        borderRadius: 16,
        boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(60,20,20,0.06)",
        display: "flex", alignItems: "center", gap: 20, padding: "16px 28px",
        flexWrap: "wrap"
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: isDark ? "#2D1B10" : "rgba(139, 28, 46, 0.06)", 
          border: isDark ? "1px solid #C9A227" : "1px solid rgba(139, 28, 46, 0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Shield size={20} style={{ color: isDark ? "#D4732A" : "#8B1F44" }} />
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#F5EFE0" : "#4B1F24", fontFamily: F }}>
            Phase {HACKATHON_CONFIG.phase}:
          </span>
          <span style={{ fontSize: 16, color: isDark ? "#A08070" : "#6E5A55", fontFamily: F, marginLeft: 8 }}>
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
            background: isDark ? "#2D1B10" : "rgba(139, 28, 46, 0.06)", 
            border: isDark ? "1px solid #D4732A" : "1px solid #DFCDBD",
            color: isDark ? "#F5EFE0" : "#8B1F44", fontSize: 15, fontWeight: 600,
            fontFamily: F, cursor: "pointer", transition: "all 0.2s"
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* ── ERROR BANNER ───────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          width: "100%",
          padding: "12px 18px",
          background: isDark ? "rgba(212,115,42,0.1)" : "rgba(139,28,46,0.06)", 
          borderRadius: 10,
          border: isDark ? "1px solid #D4732A" : "1px solid #8B1F44",
          fontSize: 14, color: isDark ? "#F5EFE0" : "#8B1C2E", fontFamily: F,
        }}>
          {error}
        </div>
      )}

      {/* ── CONTENT GRID ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 items-start w-full">

        {/* ── LEFT CARD ──────────────────────────────────────────────────────── */}
        <div style={{
          flex: "1 1 540px",
          minHeight: 370,
          background: isDark ? "#1E1208" : "rgba(252, 246, 239, 0.97)",
          border: isDark ? "1px solid #C9A227" : "1px solid rgba(233, 216, 199, 0.8)",
          borderRadius: 20,
          boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.4)" : "0 8px 40px rgba(60, 20, 20, 0.06)",
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
                    <UserCircle size={29} style={{ color: isDark ? "#D4732A" : "#8B1C2E" }} />
                  </div>
                  <div>
                    <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: isDark ? "#F5EFE0" : "#8B1C2E", margin: 0, lineHeight: 1.1 }}>
                      {myTeam.name}
                    </h1>
                    <p style={{ fontSize: 16, color: isDark ? "#A08070" : "#6E5A55", margin: "4px 0 0", fontFamily: F }}>
                      {isTeamLeader ? "You are the team leader" : "Team member"}
                    </p>
                    {myTeam.leaderName && (
                      <p style={{ fontSize: 13, color: isDark ? "#C9A227" : "#8A3150", margin: "2px 0 0", fontFamily: F, fontWeight: 600 }}>
                        Leader: {myTeam.leaderName}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, marginTop: 6, marginLeft: "auto" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    height: 34, padding: "0 16px",
                    background: isDark ? "rgba(42, 29, 22, 0.7)" : "rgba(241, 227, 214, 0.7)", 
                    border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid #DFCDBD",
                    borderRadius: 999,
                  }}>
                    {myTeam.isLocked
                      ? <Lock   size={11} style={{ color: isDark ? "#C9A227" : "#8A3150" }} />
                      : <Unlock size={11} style={{ color: isDark ? "#C9A227" : "#8A3150" }} />}
                    <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? "#C9A227" : "#8A3150", fontFamily: F }}>
                      {myTeam.isLocked ? "Locked" : "Open"}
                    </span>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 50, height: 34,
                    background: isDark ? "#D4732A" : "rgba(139,28,46,0.88)", 
                    borderRadius: 999,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#0F0A05" : "#fff", fontFamily: F, margin: "auto" }}>
                      {myTeam.members.length}/{myTeam.maxSize}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, flex: "none" }}>
                <p style={sectionLabelComputed}>Team Members</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {myTeam.members.map((member) => (
                    <div key={member.id} style={{
                      height: 50,
                      background: isDark ? "rgba(42, 29, 22, 0.7)" : "rgba(241, 227, 214, 0.7)",
                      border: isDark ? "1px solid rgba(201,162,39,0.2)" : "1px solid #DFCDBD",
                      borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      paddingInline: 14,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <UserCircle size={28} style={{ color: isDark ? "#D4732A" : "#8B1C2E" }} />
                        <span style={{ fontSize: 19, color: isDark ? "#F5EFE0" : "#4B1F24", fontFamily: F }}>{member.name}</span>
                      </div>
                      {member.id === myTeam.leaderId && (
                        <span style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#C9A227" : "#8A3150", fontFamily: F, letterSpacing: "0.5px", marginLeft: "auto" }}>
                          LEADER
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isTeamLeader && !myTeam.isLocked && myTeam.members.length < myTeam.maxSize && (
                <div style={{ marginTop: 20 }}>
                  <p style={sectionLabelComputed}>Invite Code</p>
                  <div style={{ display: "flex", gap: 10, position: "relative" }}>
                    <div style={{
                      flex: 1, height: 54,
                      background: isDark ? "rgba(42, 29, 22, 0.7)" : "rgba(241, 227, 214, 0.7)",
                      border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid #DFCDBD",
                      borderRadius: 14,
                      display: "flex", alignItems: "center",
                      paddingLeft: 18,
                      fontFamily: SERIF, fontSize: 22, color: isDark ? "#C9A227" : "#8B1C2E",
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
                        background: isDark ? "linear-gradient(135deg,#D4732A,#C1440E)" : "linear-gradient(135deg,#8B1F44,#6B142F)",
                        color: "#fff", fontSize: 13, fontWeight: 600,
                        fontFamily: F, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                        boxShadow: isDark ? "0 3px 10px rgba(212,115,42,0.15)" : "0 3px 10px rgba(139,28,46,0.15)",
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
                      border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid #DFCDBD",
                      background: isDark ? "rgba(42, 29, 22, 0.7)" : "rgba(255, 250, 245, 0.92)",
                      color: isDark ? "#F5EFE0" : "#8B1C2E", fontSize: 14, fontWeight: 600,
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
                    color: isDark ? "#D4732A" : "#8B1C2E", fontSize: 14, fontWeight: 600,
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
                <Users size={22} style={{ color: isDark ? "#D4732A" : "#8B1C2E" }} />
                <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: isDark ? "#F5EFE0" : "#8B1C2E", margin: 0 }}>
                  Create a Team
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  style={{ ...inputStyleComputed, flex: "unset", width: "100%" }}
                />
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Team leader name"
                    style={inputStyleComputed}
                  />
                  <button type="button" onClick={createTeam} style={primaryBtnComputed}>
                    <UserPlus size={15} /> Create
                  </button>
                </div>
              </div>
              <div style={{ borderTop: isDark ? "1px solid rgba(201,162,39,0.15)" : "1px solid rgba(234,215,202,0.4)", margin: "24px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <LogIn size={22} style={{ color: isDark ? "#D4732A" : "#8B1C2E" }} />
                <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: isDark ? "#F5EFE0" : "#8B1C2E", margin: 0 }}>
                  Join a Team
                </h2>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={inviteCode}
                  placeholder="Enter invite code"
                  style={{ ...inputStyleComputed, fontFamily: SERIF, letterSpacing: "2px", fontWeight: 600 }}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <button type="button" onClick={joinTeam} style={primaryBtnComputed}>
                  <UserPlus size={15} /> Join
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT CARD — All Teams List (admin only) ────────────────────────── */}
        {role === "admin" && (
          <div style={{
            flex: "0 1 380px",
            height: 500,
            background: isDark ? "#1E1208" : "rgba(252, 246, 239, 0.97)",
            border: isDark ? "1px solid #C9A227" : "1px solid rgba(233, 216, 199, 0.8)",
            borderRadius: 20,
            boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.4)" : "0 8px 40px rgba(60, 20, 20, 0.06)",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            padding: "20px 24px",
            boxSizing: "border-box",
          }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: isDark ? "#F5EFE0" : "#8B1C2E", margin: 0 }}>
              All Teams ({allTeams.length})
            </h2>
            <p style={{ fontSize: 16, color: isDark ? "#A08070" : "#6E5A55", margin: "2px 0 16px", fontFamily: F }}>
              All registered teams
            </p>
            <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {allTeams.length > 0 ? (
                allTeams.map((team) => (
                  <div key={team.id} style={{
                    background: isDark ? "rgba(42, 29, 22, 0.7)" : "rgba(241, 227, 214, 0.7)",
                    border: isDark ? "1px solid rgba(201,162,39,0.2)" : "1px solid #DFCDBD",
                    borderRadius: 14,
                    padding: "9px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <UserCircle size={20} style={{ color: isDark ? "#D4732A" : "#8B1C2E" }} />
                      <div>
                        <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: isDark ? "#F5EFE0" : "#8B1C2E", margin: 0 }}>
                          {team.name}
                        </p>
                        <p style={{ fontSize: 12, color: isDark ? "#A08070" : "#6E5A55", margin: 0, fontFamily: F }}>
                          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                      {team.isLocked && <Lock size={10} style={{ color: isDark ? "#C9A227" : "#8A3150" }} />}
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: isDark ? "#0F0A05" : "#8B1C2E", fontFamily: F,
                        background: isDark ? "#C9A227" : "rgba(139,28,46,0.1)", padding: "3px 8px", borderRadius: 999,
                      }}>
                        {team.members.length}/{team.maxSize}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ paddingTop: 24, textAlign: "center", fontSize: 13, color: isDark ? "#A08070" : "#6E5A55", fontFamily: F }}>
                  No teams registered yet
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
