"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { useAuth } from "@/components/AuthProvider";

import AppShell from "@/components/ui/AppShell";

const JudgeDashboard = dynamic(
  () => import("@/components/JudgeDashboard").then((m) => m.JudgeDashboard),
  { ssr: false }
);

export default function JudgingPage(){

  const { logout, user, role, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = async()=>{
    await logout()
    router.push("/login")
  }

  if(!isAuthenticated) return <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">Checking access...</div>
  if(role !== "judge" && role !== "admin") return <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">Redirecting...</div>

  return(
    <AppShell>
      <JudgeDashboard
        judgeId={user?.id || ""}
        judgeName={user?.email || "Judge"}
        onLogout={handleLogout}
      />
    </AppShell>
  )
}
