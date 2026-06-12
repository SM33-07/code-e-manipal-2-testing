"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, X, Bell } from "lucide-react"

export default function Navbar() {
  const { role, logout, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const linkClass = (path: string) =>
    pathname === path
      ? "text-[#8B1C2E] font-semibold"
      : "text-[#7A5A50] hover:text-[#8B1C2E]"

  if (pathname === "/login") return null

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(255,248,239,0.88)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(232,216,204,0.2)",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "0 32px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image
            src="/logo.png"
            width={40}
            height={40}
            alt="LearnIT"
          />
          <span style={{
            fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
            fontSize: 32,
            fontWeight: 700,
            color: "#8B1C2E",
          }}>
            Code-e-Manipal
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 35 }}>
          {(role === "admin" || role === "participant") && (
            <Link href="/team" className={linkClass("/team")} style={{ fontSize: 20, fontFamily: "'Inter', sans-serif", transition: "color 0.15s", textDecoration: "none" }}>
              Team
            </Link>
          )}
          {(role === "admin" || role === "participant") && (
            <Link href="/SubmissionForm" className={linkClass("/SubmissionForm")} style={{ fontSize: 20, fontFamily: "'Inter', sans-serif", transition: "color 0.15s", textDecoration: "none" }}>
              Submit
            </Link>
          )}
          {(role === "admin" || role === "judge") && (
            <Link href="/judging" className={linkClass("/judging")} style={{ fontSize: 20, fontFamily: "'Inter', sans-serif", transition: "color 0.15s", textDecoration: "none" }}>
              Judging
            </Link>
          )}
          {role === "admin" && (
            <Link href="/admin" className={linkClass("/admin")} style={{ fontSize: 20, fontFamily: "'Inter', sans-serif", transition: "color 0.15s", textDecoration: "none" }}>
              Admin
            </Link>
          )}
          <Link href="/gallery" className={linkClass("/gallery")} style={{ fontSize: 20, fontFamily: "'Inter', sans-serif", transition: "color 0.15s", textDecoration: "none" }}>
            Gallery
          </Link>
        </div>

        {/* Right Side */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Role Badge */}
          <span style={{
            fontSize: 14, padding: "4px 10px", borderRadius: 999,
            background: "rgba(139,28,46,0.1)",
            border: "1px solid rgba(139,28,46,0.2)",
            color: "#8B1C2E",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            textTransform: "capitalize",
          }}>
            {role}
          </span>

          {/* Notification */}
          <div style={{ position: "relative", cursor: "pointer" }}>
            <Bell size={22} style={{ color: "#7A5A50" }} />
            <div style={{
              position: "absolute", top: -3, right: -3,
              width: 14, height: 14, borderRadius: "50%",
              background: "#C8941C",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 8, color: "#fff", fontWeight: 700 }}>3</span>
            </div>
          </div>

          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "#8B1C2E",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.5), 0 2px 8px rgba(139,28,46,0.2)",
                fontSize: 16, fontWeight: 700, color: "#fff",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    position: "absolute", right: 0, marginTop: 10,
                    width: 180,
                    background: "#FFFDFB",
                    border: "1px solid #EAD7CA",
                    borderRadius: 14,
                    boxShadow: "0 8px 24px rgba(120,60,20,0.10)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid #EAD7CA",
                    fontSize: 12, color: "#9A6B56",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {user?.email}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "10px 14px",
                      background: "none", border: "none",
                      fontSize: 13, color: "#8B1C2E",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}
