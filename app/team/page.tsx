"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

import { useAuth } from "@/components/AuthProvider"

const TeamManagement = dynamic(
  () => import("@/components/TeamManagement").then((m) => m.TeamManagement),
  { ssr: false }
)

export default function TeamPage() {
  const { role, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (role !== "participant" && role !== "admin") {
      router.push("/")
    }
  }, [role, isAuthenticated, router])

  if (!isAuthenticated || (role !== "participant" && role !== "admin")) return null

  return <TeamManagement />
}
