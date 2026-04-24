"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Scale, Trophy, BarChart3 } from "lucide-react"

const links = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Teams", href: "/team", icon: Users },
  { name: "Judging", href: "/judging", icon: Scale },
  { name: "Results", href: "/admin/results", icon: Trophy },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
]

export default function AdminSidebar() {

  const pathname = usePathname()

  return (

    <aside className="w-64 h-screen bg-[#020817] border-r border-white/10 p-6">

      <h2 className="text-white text-xl font-bold mb-8">
        Admin Panel
      </h2>

      <div className="space-y-2">

        {links.map(link => {

          const Icon = link.icon
          const active = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
              ${active
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          )

        })}

      </div>

    </aside>
  )
}
