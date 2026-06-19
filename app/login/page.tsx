"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Users, Scale, ShieldCheck, Images, UserPlus } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/AuthProvider";

function OrnamentalDivider() {
  return (
    <svg viewBox="0 0 120 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 14, display: "block" }}>
      <line x1="0" y1="7" x2="50" y2="7" stroke="#B88A72" strokeWidth="1" />
      <polygon points="60,1 66,7 60,13 54,7" fill="#B88A72" />
      <line x1="70" y1="7" x2="120" y2="7" stroke="#B88A72" strokeWidth="1" />
    </svg>
  );
}

function WideDivider() {
  return (
    <svg viewBox="0 0 400 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 14, display: "block" }}>
      <line x1="0" y1="7" x2="185" y2="7" stroke="#DCC6B4" strokeWidth="1" />
      <polygon points="200,1 206,7 200,13 194,7" fill="#DCC6B4" />
      <line x1="215" y1="7" x2="400" y2="7" stroke="#DCC6B4" strokeWidth="1" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [role, setRole] = useState<"participant" | "judge" | "admin" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, [resolvedTheme]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { triggerError("Please select a role"); return; }
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      const actualRole = data?.user?.user_metadata?.role || "participant";
      if (actualRole !== role) {
        triggerError(`Incorrect role. This account is registered as ${actualRole}.`);
        setLoading(false);
        return;
      }
      if (actualRole === "admin") router.push("/admin");
      else if (actualRole === "judge") router.push("/judging");
      else router.push("/team");
    } catch {
      triggerError("Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  const roles: { value: "participant" | "judge" | "admin"; label: string; Icon: React.ElementType }[] = [
    { value: "participant", label: "Participant", Icon: Users },
    { value: "judge",       label: "Judge",       Icon: Scale },
    { value: "admin",       label: "Admin",       Icon: ShieldCheck },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 transition-all duration-300 login-background" />
      <div className={clsx("absolute inset-0 transition-colors duration-300", isDark ? "bg-black/60" : "bg-black/25")} />

      {/* Shift card right on desktop, center on smaller screens */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 lg:justify-end lg:px-20">

        <div
          className={clsx("relative overflow-hidden flex flex-col transition-colors duration-300", shake && "animate-shake")}
          style={{
            width: "min(480px, 92vw)",
            padding: "36px 40px 32px",
            background: isDark ? "rgba(15,10,5,0.85)" : "rgba(252,246,239,0.97)",
            border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid rgba(233,216,199,0.8)",
            borderRadius: 24,
            boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 16px 48px rgba(60,20,20,0.16)",
            backdropFilter: "blur(12px)",
          }}
        >

          {/* Mandala watermark */}
          <div className="pointer-events-none absolute top-0 right-0 opacity-[0.04]" style={{ width: 120, height: 120 }}>
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="60" cy="60" r="58" stroke="#8B1F44" strokeWidth="1.2"/>
              <circle cx="60" cy="60" r="44" stroke="#8B1F44" strokeWidth="1"/>
              <circle cx="60" cy="60" r="30" stroke="#8B1F44" strokeWidth="1"/>
              <circle cx="60" cy="60" r="16" stroke="#8B1F44" strokeWidth="1"/>
              {[0,45,90,135].map(a => (
                <line key={a}
                  x1={60 + 58 * Math.cos(a * Math.PI / 180)} y1={60 + 58 * Math.sin(a * Math.PI / 180)}
                  x2={60 - 58 * Math.cos(a * Math.PI / 180)} y2={60 - 58 * Math.sin(a * Math.PI / 180)}
                  stroke="#8B1F44" strokeWidth="0.5"
                />
              ))}
            </svg>
          </div>

          {/* Title */}
          <h1
            className="text-center leading-none transition-colors duration-300"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: isDark ? "#F5EFE0" : "#4B1F24" }}
          >
            Welcome Back
          </h1>

          {/* Ornamental divider */}
          <div className="flex justify-center mt-3">
            <OrnamentalDivider />
          </div>

          {/* Subtitle */}
          <p
            className="text-center mt-2.5 transition-colors duration-300"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: isDark ? "#A08070" : "#6E5A55" }}
          >
            Access the Code-e-Manipal portal
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col mt-7">

            {/* Email */}
            <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: isDark ? "#F5EFE0" : "#5C4944", marginBottom: 6 }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute transition-colors duration-300" style={{ left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: isDark ? "#A08070" : "#9A7B73" }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={clsx("w-full outline-none transition-colors duration-300", isDark ? "placeholder-[#A08070]/60" : "placeholder-[#9A7B73]/60")}
                style={{
                  height: 48,
                  background: isDark ? "rgba(15,10,5,0.6)" : "rgba(255,250,245,0.92)",
                  border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid #DFCDBD",
                  borderRadius: 11,
                  paddingLeft: 40,
                  paddingRight: 14,
                  fontSize: 14,
                  color: isDark ? "#F5EFE0" : "#5B4640",
                  fontFamily: "'Inter',sans-serif",
                }}
              />
            </div>

            {/* Password */}
            <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: isDark ? "#F5EFE0" : "#5C4944", marginTop: 16, marginBottom: 6 }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute transition-colors duration-300" style={{ left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: isDark ? "#A08070" : "#9A7B73" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={clsx("w-full outline-none transition-colors duration-300", isDark ? "placeholder-[#A08070]/60" : "placeholder-[#9A7B73]/60")}
                style={{
                  height: 48,
                  background: isDark ? "rgba(15,10,5,0.6)" : "rgba(255,250,245,0.92)",
                  border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid #DFCDBD",
                  borderRadius: 11,
                  paddingLeft: 40,
                  paddingRight: 40,
                  fontSize: 14,
                  color: isDark ? "#F5EFE0" : "#5B4640",
                  fontFamily: "'Inter',sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className={clsx("absolute transition-colors", isDark ? "text-[#A08070] hover:text-[#C9A227]" : "text-[#9A7B73] hover:text-[#4B1F24]")}
                style={{ right: 14, top: "50%", transform: "translateY(-50%)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Role buttons */}
            <div className="flex gap-2.5 mt-5">
              {roles.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className="flex-1 flex items-center justify-center gap-1.5 transition-all duration-200"
                  style={{
                    height: 42,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'Inter',sans-serif",
                    background: role === value 
                      ? (isDark ? "linear-gradient(135deg,#D4732A,#C1440E)" : "linear-gradient(135deg,#8B1F44,#6D1632)") 
                      : (isDark ? "rgba(15,10,5,0.4)" : "rgba(255,251,247,0.85)"),
                    border: role === value ? "none" : (isDark ? "1px solid rgba(201,162,39,0.2)" : "1px solid #E2D0C1"),
                    color: role === value ? "#FFFFFF" : (isDark ? "#A08070" : "#6D524A"),
                    boxShadow: role === value 
                      ? (isDark ? "0 4px 12px rgba(212,115,42,0.3)" : "0 4px 12px rgba(139,31,68,0.28)") 
                      : "none",
                  }}
                >
                  <Icon size={14} style={{ color: role === value ? (isDark ? "#F5EFE0" : "#F6D8B4") : (isDark ? "#A08070" : "#B48870") }} />
                  {label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-center mt-2" style={{ color: "#C0392B", fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
                {error}
              </p>
            )}

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="relative flex items-center justify-center transition-opacity disabled:opacity-70 mt-5"
              style={{
                height: 50,
                background: isDark ? "linear-gradient(135deg,#D4732A,#C1440E)" : "linear-gradient(135deg,#8B1F44,#6B142F)",
                borderRadius: 12,
                boxShadow: isDark ? "0 10px 24px rgba(212,115,42,0.3)" : "0 10px 24px rgba(107,20,47,0.28)",
                fontSize: 16,
                fontWeight: 600,
                color: "white",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight size={17} className="absolute right-5" />}
            </button>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: isDark ? "#D4732A" : "#8B1F44" }}
                />
                <span style={{ fontSize: 12, color: isDark ? "#A08070" : "#6A5650", fontFamily: "'Inter',sans-serif" }}>Remember me</span>
              </label>
              <button
                type="button"
                className={clsx("transition-colors", isDark ? "hover:text-[#F0C060]" : "hover:text-[#4B1F24]")}
                style={{ fontSize: 12, fontWeight: 500, color: isDark ? "#D4732A" : "#8A3150", fontFamily: "'Inter',sans-serif", background: "none", border: "none", cursor: "pointer" }}
              >
                Forgot password?
              </button>
            </div>

          </form>

          {/* Wide divider */}
          <div className="mt-6">
            <WideDivider />
          </div>

          {/* Register link */}
          <div className="mt-4">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 hover:opacity-75 transition-opacity"
            >
              <UserPlus size={16} style={{ color: isDark ? "#F0C060" : "#7B1E3A" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#F0C060" : "#7B1E3A", fontFamily: "'Inter',sans-serif" }}>
                Register for the Hackathon
              </span>
            </Link>
          </div>

          {/* Gallery link */}
          <div className="mt-3">
            <Link
              href="/gallery"
              className="flex items-center justify-center gap-2 hover:opacity-75 transition-opacity"
            >
              <Images size={16} style={{ color: isDark ? "#D4732A" : "#8A3150" }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: isDark ? "#A08070" : "#6E5A55", fontFamily: "'Inter',sans-serif" }}>
                View Public Gallery
              </span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
