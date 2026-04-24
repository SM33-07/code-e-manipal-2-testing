"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { JudgeDashboard } from "@/components/JudgeDashboard";

import AppShell from "@/components/ui/AppShell";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GradientOrbs } from "@/components/GradientOrbs";

export default function JudgingPage(){

  const router = useRouter()
  const { logout, user, role, isAuthenticated } = useAuth()

  const [judgeName] = useState(user?.email || "Judge")

  useEffect(()=>{

    if(!isAuthenticated){
      router.push("/login")
      return
    }

    if(role !== "judge" && role !== "admin"){
      router.push("/team")
    }

  },[role,isAuthenticated,router])

  if(!isAuthenticated || (role !== "judge" && role !== "admin")) return null

  const handleLogout = async()=>{

    await logout()
    router.push("/login")

  }

  return(

    <ProtectedRoute>

      <AppShell>

        <AnimatedBackground/>
        <GradientOrbs/>

        <JudgeDashboard
          judgeName={judgeName}
          onLogout={handleLogout}
        />

      </AppShell>

    </ProtectedRoute>

  )
}
