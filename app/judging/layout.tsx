"use client";

export default function JudgingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      position: "relative",
    }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/images/backgrounds/judging.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(rgba(255,248,238,0.2), rgba(255,244,232,0.))",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
