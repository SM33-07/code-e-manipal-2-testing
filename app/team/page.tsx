"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/AuthProvider"

import AppShell from "@/components/ui/AppShell"
import GlassCard from "@/components/ui/GlassCard"

import Image from "next/image"
import { TeamManagement } from "@/components/TeamManagement"

export default function TeamPage(){

  const { role, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(()=>{

    if(!isAuthenticated){
      router.push("/login")
      return
    }

    if(role !== "participant" && role !== "admin"){
      router.push("/")
    }

  },[role,isAuthenticated,router])

  if(!isAuthenticated || (role !== "participant" && role !== "admin")) return null

  return(

    <AppShell>

      <GlassCard className="p-6">

        <div className="flex items-center gap-4 mb-6">

          <Image
            src="/logo.png"
            width={40}
            height={40}
            alt="LearnIT"
          />

          <h1 className="text-white text-2xl font-bold">
            Team Dashboard
          </h1>

        </div>

        <TeamManagement/>

      </GlassCard>

    </AppShell>
  )
}
