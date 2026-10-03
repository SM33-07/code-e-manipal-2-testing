'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileCode2,
  Trophy,
  Menu,
  X,
  LogOut,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = user?.user_metadata?.name || 'Participant';
  const userIdentifier = user?.user_metadata?.identifier || 'PARTICIPANT';

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Team', href: '/team', icon: Users },
    { label: 'Submission Studio', href: '/SubmissionForm', icon: FileCode2 },
    { label: 'Project Gallery', href: '/gallery', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Participant Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-sm group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground leading-none">
                  Code-e-Manipal <span className="text-primary font-mono text-xs">2.0</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                  Participant Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Action Dock */}
          <div className="flex items-center gap-3">
            {/* Dual-Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Pill */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/50">
                <div className="size-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
                    {userName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono leading-none">
                    {userIdentifier}
                  </span>
                </div>
              </div>
            )}

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => logout()}
              className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/60 bg-card/95 backdrop-blur-xl px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Code-e-Manipal 2.0 &bull; Manipal University Jaipur
          </span>
          <div className="flex items-center gap-4">
            <a href="#rules" className="hover:text-foreground transition-colors">
              Rules & Invariants
            </a>
            <a href="#support" className="hover:text-foreground transition-colors">
              Support Desk
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
