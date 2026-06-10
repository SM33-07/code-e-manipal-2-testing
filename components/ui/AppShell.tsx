"use client"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
