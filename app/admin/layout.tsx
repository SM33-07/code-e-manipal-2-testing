"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  FileText,
  BarChart3,
  LogOut,
  ClipboardList,
  Radio,
  Users,
  ShieldAlert,
  X
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AdminHeader } from "@/components/admin/AdminHeader";

const sideNav = [
  { label: "Dashboard",     icon: LayoutDashboard, href: "/admin" },
  { label: "Registrations", icon: ClipboardList,   href: "/admin/registrations" },
  { label: "Event Control", icon: Radio,           href: "/admin/event-control" },
  { label: "Users",         icon: Users,           href: "/admin/users" },
  { label: "Results",       icon: Trophy,          href: "/admin/results" },
  { label: "Report",        icon: FileText,        href: "/admin/report" },
  { label: "Analytics",     icon: BarChart3,       href: "/admin/analytics" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Dedicated Admin Global Header */}
      <AdminHeader
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
      />

      {/* 2. Workspace Body: Sidebar + Main Content */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-5 flex-col shrink-0 z-20">
          <div className="mb-6 px-2">
            <h2 className="text-secondary font-bold tracking-widest text-[11px] uppercase opacity-90 flex items-center gap-1.5">
              Operations Navigation
            </h2>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {sideNav.map(({ label, icon: Icon, href }) => {
              const isActive =
                pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleNavClick(href)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-sm font-medium text-left cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon
                    size={17}
                    className={isActive ? "text-primary-foreground" : "text-secondary"}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-sidebar-border mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg border border-sidebar-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer Navigation */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 transition-opacity"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Content */}
            <div className="relative w-4/5 max-w-xs bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-full p-5 flex flex-col z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-sidebar-border mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className="text-primary" />
                  <span className="font-bold text-sm text-foreground">Admin Menu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-muted-foreground mb-4 px-2 truncate">
                Signed in as <strong className="text-foreground">{user?.email || "Admin"}</strong>
              </div>

              <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
                {sideNav.map(({ label, icon: Icon, href }) => {
                  const isActive =
                    pathname === href || (href !== "/admin" && pathname.startsWith(href));
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleNavClick(href)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors text-sm font-medium text-left cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-primary-foreground" : "text-secondary"}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-sidebar-border mt-auto">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Log Out of Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
