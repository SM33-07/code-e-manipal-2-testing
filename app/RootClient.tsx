"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider"
import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false })

function getBackground(pathname: string) {
  if (pathname.startsWith("/SubmissionForm")) return "submission-generated.jpg"
  if (pathname.startsWith("/submission-result")) return "results-generated.jpg"
  if (pathname.startsWith("/project")) return "project-generated.jpg"
  if (pathname.startsWith("/judging")) return "judging-generated.jpg"
  if (pathname.startsWith("/admin/results")) return "results-generated.jpg"
  if (pathname.startsWith("/admin/analytics") || pathname.startsWith("/admin/report")) {
    return "analytics-generated.jpg"
  }
  if (pathname.startsWith("/admin")) return "admin-generated.jpg"
  if (pathname.startsWith("/gallery")) return "gallery-generated.jpg"
  return "team-generated.jpg"
}

interface Announcement {
  id: string;
  content: string;
  type: "info" | "warning" | "urgent" | "success";
}

function AnnouncementBanner({ onActiveChange }: { onActiveChange: (active: boolean) => void }) {
  const { isAuthenticated } = useAuth()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setAnnouncement(null)
      onActiveChange(false)
      return
    }

    const fetchAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcements")
        if (res.ok) {
          const result = await res.json()
          const data = result.data
          setAnnouncement(data)
          onActiveChange(!!data)
        } else {
          setAnnouncement(null)
          onActiveChange(false)
        }
      } catch (err) {
        console.error("Error fetching announcements:", err)
        setAnnouncement(null)
        onActiveChange(false)
      }
    }

    fetchAnnouncement()
    // Poll every 30 seconds
    const interval = setInterval(fetchAnnouncement, 30000)
    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated, onActiveChange])

  if (!announcement) return null

  const typeStyles = {
    info: {
      bg: "bg-blue-600 dark:bg-blue-900/90 text-white border-blue-500",
      icon: "ℹ️"
    },
    warning: {
      bg: "bg-amber-500 dark:bg-amber-800/90 text-white border-amber-500",
      icon: "⚠️"
    },
    urgent: {
      bg: "bg-red-600 dark:bg-red-950/95 text-white border-red-600 animate-pulse",
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
      className={`fixed top-0 left-0 right-0 z-[9999] h-10 px-4 flex items-center justify-center gap-2 border-b backdrop-blur-md shadow-sm transition-all duration-300 ${style.bg}`}
    >
      <span className="text-sm">{style.icon}</span>
      <p className="text-xs font-semibold tracking-wide text-center uppercase truncate max-w-[90%]">
        {announcement.content}
      </p>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"
  const isRegister = pathname === "/register"
  const isGallery = pathname === "/gallery"
  const isSubmissionForm = pathname.startsWith("/SubmissionForm")

  const [hasBanner, setHasBanner] = useState(false)

  if (isLogin || isRegister) {
    return <>{children}</>
  }

  const backgroundImage = getBackground(pathname)

  return (
    <>
      <div
        className="route-background"
        style={{
          backgroundImage: `url("/images/backgrounds/${backgroundImage}")`,
        }}
        aria-hidden="true"
      />
      <div className="route-background-veil" aria-hidden="true" />
      <AnnouncementBanner onActiveChange={setHasBanner} />
      
      {isGallery ? (
        <div style={{ paddingTop: hasBanner ? "40px" : "0px" }}>
          {children}
        </div>
      ) : isSubmissionForm ? (
        <div style={{ paddingTop: hasBanner ? "40px" : "0px" }}>
          <Suspense fallback={null}>
            <Navbar className={hasBanner ? "top-[40px]" : "top-0"} />
          </Suspense>
          {children}
        </div>
      ) : (
        <div style={{ paddingTop: hasBanner ? "40px" : "0px" }}>
          <Suspense fallback={null}>
            <Navbar className={hasBanner ? "top-[40px]" : "top-0"} />
          </Suspense>
          <main className="relative z-10 min-h-screen container mx-auto px-6 pt-28 pb-10">
            {children}
          </main>
        </div>
      )}
    </>
  )
}

export default function RootClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  )
}
