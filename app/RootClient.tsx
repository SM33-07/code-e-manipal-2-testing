"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider"
import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false })

function getBackgroundClass(pathname: string) {
  if (pathname === "/") return "route-landing"
  if (pathname.startsWith("/SubmissionForm") || pathname.startsWith("/submit")) return "route-submit"
  if (pathname.startsWith("/submission-result")) return "route-results"
  if (pathname.startsWith("/project") || pathname.startsWith("/gallery")) return "route-gallery"
  if (pathname.startsWith("/judging") || pathname.startsWith("/judge")) return "route-judging"
  if (pathname.startsWith("/admin/results")) return "route-results"
  if (pathname.startsWith("/admin")) return "route-admin"
  if (pathname.startsWith("/dashboard")) return "route-dashboard"
  if (pathname.startsWith("/timeline")) return "route-dashboard"
  if (pathname.startsWith("/problem-statements") || pathname.startsWith("/guidelines")) return "route-dashboard"
  return "route-team"
}

interface Announcement {
  id: string;
  content: string;
  type: "info" | "warning" | "urgent" | "success";
}

function AnnouncementBanner({ onActiveChange }: { onActiveChange: (active: boolean) => void }) {
  const { isAuthenticated } = useAuth()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [publishingAlert, setPublishingAlert] = useState<boolean>(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setAnnouncement(null)
      setPublishingAlert(false)
      onActiveChange(false)
      return
    }

    const fetchStatus = async () => {
      try {
        const [annRes, cfgRes] = await Promise.all([
          fetch("/api/announcements"),
          fetch("/api/event-config"),
        ])

        let hasPublishingAlert = false
        if (cfgRes.ok) {
          const cfgJson = await cfgRes.json()
          const cfg = cfgJson.data || {}
          if (cfg.results_published === "publishing") {
            hasPublishingAlert = true
          }
        }
        setPublishingAlert(hasPublishingAlert)

        if (annRes.ok) {
          const result = await annRes.json()
          const data = result.data
          setAnnouncement(data)
          onActiveChange(hasPublishingAlert || !!data)
        } else {
          setAnnouncement(null)
          onActiveChange(hasPublishingAlert)
        }
      } catch (err) {
        console.error("Error fetching announcements/config:", err)
        setAnnouncement(null)
        onActiveChange(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated, onActiveChange])

  if (publishingAlert) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 z-[9999] h-10 px-4 flex items-center justify-center gap-2 border-b shadow-sm transition-all duration-300 bg-amber-600 dark:bg-amber-950 text-white border-amber-500 animate-pulse"
      >
        <span className="text-sm">🏆</span>
        <p className="text-xs font-bold tracking-wide text-center uppercase truncate max-w-[90%]">
          Official Announcement: Results announcement in progress! The leaderboard will be live in 5 minutes.
        </p>
      </div>
    )
  }

  if (!announcement) return null

  const typeStyles = {
    info: {
      bg: "bg-primary text-primary-foreground border-primary/30",
      icon: "ℹ️"
    },
    warning: {
      bg: "bg-secondary text-secondary-foreground border-secondary/30",
      icon: "⚠️"
    },
    urgent: {
      bg: "bg-destructive text-destructive-foreground border-destructive/40 animate-pulse",
      icon: "🚨"
    },
    success: {
      bg: "bg-emerald-600 dark:bg-emerald-900/90 text-white border-emerald-500",
      icon: "✅"
    }
  }

  const style = typeStyles[announcement.type] || typeStyles.info

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[9999] h-10 px-4 flex items-center justify-center gap-2 border-b shadow-sm transition-all duration-300 ${style.bg}`}
    >
      <span className="text-sm">{style.icon}</span>
      <p className="text-xs font-semibold tracking-wide text-center uppercase truncate max-w-[90%]">
        {announcement.content}
      </p>
    </div>
  )
}

const LoaderAnimation = dynamic(() => import("@/components/LoaderAnimation"), { ssr: false })

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"
  const isRegister = pathname === "/register"

  const [hasBanner, setHasBanner] = useState(false)

  if (isLogin || isRegister) {
    return <>{children}</>
  }

  const backgroundClass = getBackgroundClass(pathname)
  const isFullBleedRoute = pathname.startsWith("/admin") || pathname.startsWith("/judge") || pathname.startsWith("/judging")

  return (
    <>
      <div
        className={`route-background ${backgroundClass}`}
        aria-hidden="true"
      />
      <div className="route-background-veil" aria-hidden="true" />
      <AnnouncementBanner onActiveChange={setHasBanner} />
      
      <div style={{ paddingTop: hasBanner ? "40px" : "0px" }}>
        <Suspense fallback={null}>
          <Navbar className={hasBanner ? "top-[40px]" : "top-0"} />
        </Suspense>
        <div className={`relative z-10 min-h-screen ${isFullBleedRoute ? "pt-20" : "pt-24 pb-12"}`}>
          {children}
        </div>
      </div>
    </>
  )
}

export default function RootClient({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true)

  // Safety fallback so the page will never hang
  useEffect(() => {
    const safety = setTimeout(() => {
      setShowLoader(false)
    }, 3500)
    return () => clearTimeout(safety)
  }, [])

  return (
    <AuthProvider>
      {showLoader && (
        <LoaderAnimation onComplete={() => setShowLoader(false)} />
      )}
      <Shell>{children}</Shell>
    </AuthProvider>
  )
}
