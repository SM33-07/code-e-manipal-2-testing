"use client"

import type { ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Trophy,
  FileText, BarChart3, LogOut, ClipboardList, Radio, Users
} from "lucide-react"

const sideNav = [
  { label: "Dashboard",     icon: LayoutDashboard, href: "/admin" },
  { label: "Registrations", icon: ClipboardList,   href: "/admin/registrations" },
  { label: "Event Control", icon: Radio,           href: "/admin/event-control" },
  { label: "Users",         icon: Users,           href: "/admin/users" },
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
      <aside className="w-full md:w-64 bg-sidebar text-sidebar-foreground border-b md:border-b-0 md:border-r border-sidebar-border p-4 md:p-6 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.18)]">
        
        <div className="hidden md:block mb-8 px-2">
           <h2 className="text-primary font-bold tracking-widest text-xs uppercase opacity-80">Admin Menu</h2>
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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon size={18} className={isActive ? "text-sidebar-primary-foreground" : "text-primary"} />
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
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-transparent border border-sidebar-border text-primary hover:bg-sidebar-accent transition-all font-semibold shadow-sm"
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
