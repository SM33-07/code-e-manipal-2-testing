"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar(){

  const { role, logout, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [menuOpen,setMenuOpen] = useState(false)

  /* Close dropdown when route changes */
  useEffect(()=>{
    setMenuOpen(false)
  },[pathname])

  const handleLogout = async ()=>{
    await logout()
    router.push("/login")
  }

  const linkClass = (path:string)=>
    `relative text-sm transition ${
      pathname === path
        ? "text-white font-semibold"
        : "text-gray-400 hover:text-white"
    }`

  /* Hide navbar AFTER hooks are declared */
  if(pathname === "/login") return null

  return(

    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#020817]/70 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}

        <Link href="/" className="flex items-center gap-3">

          <Image
            src="/logo.png"
            width={34}
            height={34}
            alt="LearnIT"
          />

          <span className="text-white font-semibold text-lg tracking-wide">
            Code-e-Manipal
          </span>

        </Link>


        {/* Desktop Navigation */}

        <div className="hidden md:flex items-center gap-8">

          {(role === "admin" || role === "participant") && (
            <Link href="/team" className={linkClass("/team")}>
              Team
            </Link>
          )}

          {(role === "admin" || role === "participant") && (
            <Link href="/SubmissionForm" className={linkClass("/SubmissionForm")}>
              Submit
            </Link>
          )}

          {(role === "admin" || role === "judge") && (
            <Link href="/judging" className={linkClass("/judging")}>
              Judging
            </Link>
          )}

          {role === "admin" && (
            <Link href="/admin" className={linkClass("/admin")}>
              Admin
            </Link>
          )}

          <Link href="/gallery" className={linkClass("/gallery")}>
            Gallery
          </Link>

        </div>


        {/* Right Side */}

        <div className="flex items-center gap-4">

          {/* Role Badge */}

          <span className="hidden md:block text-xs px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 capitalize">
            {role}
          </span>

          {/* Avatar */}

          <div className="relative">

            <button
              onClick={()=>setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition"
            >
              {user?.email?.charAt(0).toUpperCase()}
            </button>

            <AnimatePresence>

            {menuOpen && (

              <motion.div
                initial={{opacity:0,y:-10}}
                animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-10}}
                className="absolute right-0 mt-3 w-44 bg-[#0f172a] border border-white/10 rounded-xl shadow-lg"
              >

                <div className="p-3 border-b border-white/10 text-xs text-gray-400">
                  {user?.email}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-red-400"
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
