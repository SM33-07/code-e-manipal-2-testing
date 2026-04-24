export function GradientOrbs() {
  return (
    <>
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -80px) scale(1.1); }
          66% { transform: translate(-40px, 40px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-70px, 60px) scale(0.9); }
          66% { transform: translate(50px, -50px) scale(1.05); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 70px) scale(1.08); }
        }
        @keyframes orb-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-50px, -30px) scale(1.12); }
          80% { transform: translate(40px, 20px) scale(0.92); }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes border-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.15), inset 0 0 20px rgba(59,130,246,0.05); }
          50% { box-shadow: 0 0 40px rgba(59,130,246,0.3), inset 0 0 40px rgba(59,130,246,0.1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-scale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          0%, 50% { border-color: transparent; }
          51%, 100% { border-color: #3b82f6; }
        }
        @keyframes count-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-enter {
          0% { opacity: 0; transform: translateY(24px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes header-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(59,130,246,0.4); }
          50% { text-shadow: 0 0 40px rgba(96,165,250,0.7), 0 0 60px rgba(59,130,246,0.3); }
        }
        @keyframes input-focus-glow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(59,130,246,0.5); }
          50% { box-shadow: 0 0 0 3px rgba(59,130,246,0.3), 0 0 20px rgba(59,130,246,0.2); }
        }
        @keyframes submit-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,99,235,0.4); }
          50% { box-shadow: 0 4px 40px rgba(37,99,235,0.7), 0 0 60px rgba(59,130,246,0.3); }
        }
      `}</style>

      {/* Main orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top-left large orb */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "55vw",
            height: "55vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(29,78,216,0.18) 0%, rgba(37,99,235,0.08) 40%, transparent 70%)",
            animation: "orb-float-1 18s ease-in-out infinite",
            filter: "blur(2px)",
          }}
        />

        {/* Top-right accent orb */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-15%",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(96,165,250,0.05) 50%, transparent 70%)",
            animation: "orb-float-2 22s ease-in-out infinite",
            filter: "blur(1px)",
          }}
        />

        {/* Bottom-center orb */}
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "30%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.14) 0%, rgba(29,78,216,0.06) 50%, transparent 70%)",
            animation: "orb-float-3 26s ease-in-out infinite",
            filter: "blur(3px)",
          }}
        />

        {/* Small accent orb */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "60%",
            width: "25vw",
            height: "25vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)",
            animation: "orb-float-4 14s ease-in-out infinite",
          }}
        />

        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "grid-pulse 6s ease-in-out infinite",
          }}
        />
        
      </div>
    </>
  );
}
