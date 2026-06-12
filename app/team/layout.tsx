import type { ReactNode } from "react"

export default function TeamLayout({ children }: { children: ReactNode }) {
  const W = 1620
  const H = 925

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: -80,
          left: 0,
          width: W,
          height: H,
          backgroundImage: "url('/images/backgrounds/team.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "top left",
          backgroundRepeat: "no-repeat",
          transformOrigin: "top left",
          transform: `scale(calc(100vw / ${W}))`,
        }}
      >
        {children}
      </div>
    </div>
  )
}