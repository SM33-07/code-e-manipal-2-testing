"use client"

import type { ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Scale, Trophy,
  FileText, BarChart3, LogOut
} from "lucide-react"

const sideNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Teams",     icon: Users,           href: "/team" },
  { label: "Judging",   icon: Scale,           href: "/judging" },
  { label: "Results",   icon: Trophy,          href: "/admin/results" },
  { label: "Report",    icon: FileText,        href: "/admin/report" },
  { label: "Analytics", icon: BarChart3,       href: "/admin/analytics" },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] w-full relative">
      {/* Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
      <aside className="w-full md:w-64 bg-[#1E1208] border-b md:border-b-0 md:border-r border-[#C9A227]/20 p-4 md:p-6 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
        
        <div className="hidden md:block mb-8 px-2">
           <h2 className="text-[#D4732A] font-bold tracking-widest text-xs uppercase opacity-80">Admin Menu</h2>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {sideNav.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
            return (
              <button
                key={label}
                type="button"
                onClick={() => router.push(href)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal shrink-0 text-sm font-semibold ${
                  isActive 
                    ? "bg-[#D4732A] text-[#1E1208] shadow-md" 
                    : "text-[#A08070] hover:bg-[#D4732A]/10 hover:text-[#C9A227]"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#1E1208]" : "text-[#D4732A]"} />
                {label}
              </button>
            )
          })}
        </nav>
        
        <div className="hidden md:block flex-1" />
        
        <div className="hidden md:block mt-8">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-transparent border border-[#C9A227]/30 text-[#D4732A] hover:bg-[#C9A227]/10 transition-all font-semibold shadow-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 relative z-0">
        {children}
      </main>
    </div>
  )
}
