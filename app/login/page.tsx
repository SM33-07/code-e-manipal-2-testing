"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";

import AppShell from "@/components/ui/AppShell";
import GlassCard from "@/components/ui/GlassCard";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GradientOrbs } from "@/components/GradientOrbs";

import Link from "next/link";

export default function LoginPage() {

  const router = useRouter();
  const { login } = useAuth();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState<"participant" | "judge" | "admin" | null>(null);

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [shake,setShake] = useState(false);

  const triggerError = (msg:string)=>{
    setError(msg)
    setShake(true)
    setTimeout(()=>setShake(false),500)
  }

  const handleLogin = async(e:React.FormEvent)=>{

    e.preventDefault()

    if(!role){
      triggerError("Please select a role")
      return
    }

    setLoading(true)
    setError("")

    try{

      const data = await login(email,password)

      const actualRole =
        data?.user?.user_metadata?.role || "participant"

      // ROLE VALIDATION

      if(actualRole !== role){
        triggerError(`Incorrect role selected. This account is registered as ${actualRole}.`)
        setLoading(false)
        return
      }

      // REDIRECT ONLY IF ROLE MATCHES

      if(actualRole === "admin"){
        router.push("/admin")
      }
      else if(actualRole === "judge"){
        router.push("/judging")
      }
      else{
        router.push("/team")
      }

    }catch{

      triggerError("Login failed")

    }

    setLoading(false)

  }

  const roleCard = (value:"participant"|"judge"|"admin",label:string)=>{

    const active = role === value

    return(
      <button
        type="button"
        onClick={()=>setRole(value)}
        className={`flex-1 p-3 rounded-lg border text-sm font-medium transition
        ${active
          ? "bg-indigo-600 border-indigo-400 text-white"
          : "bg-slate-800 border-slate-600 text-gray-300 hover:bg-slate-700"
        }`}
      >
        {label}
      </button>
    )
  }

  return(

    <AppShell>

      <AnimatedBackground/>
      <GradientOrbs/>

      <div className="flex items-center justify-center min-h-screen">

        <GlassCard className={`w-full max-w-md p-8 ${shake ? "animate-shake" : ""}`}>

          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Login
          </h1>

          <p className="text-gray-400 text-center mb-6">
            Access the Code-e-Manipal portal
          </p>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* EMAIL */}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />

            {/* PASSWORD */}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />

            {/* ROLE SELECTOR */}

            <div className="flex gap-2">

              {roleCard("participant","👤 Participant")}
              {roleCard("judge","⚖️ Judge")}
              {roleCard("admin","🛠 Admin")}

            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg text-white transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p className="text-center text-gray-400 mt-4 text-sm">
            Demo mode enabled
          </p>

          <Link
            href="/gallery"
            className="block text-center text-purple-400 mt-4 hover:underline"
          >
            View Public Gallery
          </Link>

        </GlassCard>

      </div>

      {/* SHAKE ANIMATION */}

      <style jsx global>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }

        .animate-shake {
          animation: shake 0.4s ease;
        }
      `}</style>

    </AppShell>
  )
}
