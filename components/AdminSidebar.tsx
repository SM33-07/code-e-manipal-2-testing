"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Scale, Trophy, FileSpreadsheet, BarChart3, Settings } from "lucide-react"

const links = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Teams", href: "/team", icon: Users },
  { name: "Judging", href: "/judging", icon: Scale },
  { name: "Results", href: "/admin/results", icon: Trophy },
  { name: "Report", href: "/admin/report", icon: FileSpreadsheet },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="absolute flex flex-col"
      style={{
        left: 20,
        top: 110,
        width: 265,
        height: 870,
        background: "rgba(255,248,242,0.92)",
        border: "1px solid #E9D9C8",
        borderRadius: 28,
        boxShadow: "0 10px 30px rgba(80,20,20,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Admin Panel Title */}
      <div
        className="absolute"
        style={{
          left: 40,
          top: 45,
          fontSize: 20,
          letterSpacing: 5,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: "#5E142B",
        }}
      >
        ADMIN<br/>PANEL
      </div>

      {/* Navigation Buttons */}
      <div className="absolute flex flex-col" style={{ left: 12, top: 128, gap: 16 }}>
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 font-medium no-underline transition-all"
              style={{
                width: 240,
                height: 58,
                borderRadius: 16,
                paddingLeft: 20,
                fontSize: 17,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: active ? "#FFFFFF" : "#5E142B",
                background: active
                  ? "linear-gradient(135deg, #9A234A, #6D1632)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(94,20,43,0.06)"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              <Icon size={18} style={{ opacity: active ? 1 : 0.6 }} />
              {link.name}
            </Link>
          )
        })}
      </div>

      {/* Temple artwork at bottom */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: 240,
          opacity: 0.14,
        }}
      >
        <svg viewBox="0 0 265 240" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
          <path d="M0 240 L0 180 Q40 120 60 160 Q80 100 100 140 Q120 80 132 120 Q144 60 150 100 Q156 40 160 80 Q164 30 170 70 Q180 50 190 80 Q200 60 210 100 Q220 80 230 120 Q240 100 250 140 Q260 120 265 160 L265 240 Z" fill="#5E142B" />
          <rect x="60" y="160" width="30" height="40" rx="3" fill="#5E142B" />
          <rect x="100" y="140" width="30" height="40" rx="3" fill="#5E142B" />
          <rect x="140" y="120" width="30" height="40" rx="3" fill="#5E142B" />
          <rect x="180" y="140" width="30" height="40" rx="3" fill="#5E142B" />
        </svg>
      </div>
    </aside>
  )
}
