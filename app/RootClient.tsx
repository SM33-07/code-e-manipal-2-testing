"use client";

import { AuthProvider } from "@/components/AuthProvider"
import { Suspense } from "react"
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

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"
  const isRegister = pathname === "/register"
  const isGallery = pathname === "/gallery"
  const isSubmissionForm = pathname.startsWith("/SubmissionForm")

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
      {isGallery ? (
        <>{children}</>
      ) : isSubmissionForm ? (
        <>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          {children}
        </>
      ) : (
        <>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="relative z-10 min-h-screen container mx-auto px-6 pt-28 pb-10">
            {children}
          </main>
        </>
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
