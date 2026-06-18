"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import clsx from "clsx";
import {
  User, Users, Phone, Mail, ArrowRight, CheckCircle2,
  Clock, Loader2, AlertCircle,
} from "lucide-react";

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

export default function RegisterPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState<{ autoApproved: boolean; message: string } | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, [resolvedTheme]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { triggerError("Please enter your name"); return; }
    if (!teamName.trim()) { triggerError("Please enter your team name"); return; }
    if (!phone.trim()) { triggerError("Please enter your phone number"); return; }
    if (!/^\+?[\d\s\-()]{10,}$/.test(phone.trim())) { triggerError("Please enter a valid phone number (min 10 digits)"); return; }
    if (!email.trim()) { triggerError("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { triggerError("Please enter a valid email address"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          team_name: teamName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      setSuccess({
        autoApproved: data.data?.autoApproved ?? false,
        message: data.meta?.message || "Registration submitted!",
      });
    } catch {
      triggerError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = (isDark: boolean): React.CSSProperties => ({
    height: 48,
    background: isDark ? "rgba(15,10,5,0.6)" : "rgba(255,250,245,0.92)",
    border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid #DFCDBD",
    borderRadius: 11,
    paddingLeft: 40,
    paddingRight: 14,
    fontSize: 14,
    color: isDark ? "#F5EFE0" : "#5B4640",
    fontFamily: "'Inter',sans-serif",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  });

  // ── Success State ────────────────────────────────────────────
  if (success) {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <div className="absolute inset-0 transition-all duration-300 login-background" />
        <div className={clsx("absolute inset-0 transition-colors duration-300", isDark ? "bg-black/60" : "bg-black/25")} />

        <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
          <div
            className="relative overflow-hidden flex flex-col items-center transition-colors duration-300"
            style={{
              width: "min(480px, 92vw)",
              padding: "48px 40px 40px",
              background: isDark ? "rgba(15,10,5,0.85)" : "rgba(252,246,239,0.97)",
              border: isDark ? "1px solid rgba(201,162,39,0.3)" : "1px solid rgba(233,216,199,0.8)",
              borderRadius: 24,
              boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 16px 48px rgba(60,20,20,0.16)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Success icon */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: success.autoApproved
                  ? (isDark ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#059669,#10b981)")
                  : (isDark ? "linear-gradient(135deg,#D4732A,#C9A227)" : "linear-gradient(135deg,#8B1F44,#A61B36)"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: success.autoApproved
                  ? "0 0 32px rgba(16,185,129,0.3)"
                  : (isDark ? "0 0 32px rgba(212,115,42,0.3)" : "0 0 32px rgba(139,31,68,0.3)"),
                animation: "fade-in-badge 0.5s ease forwards",
              }}
            >
              {success.autoApproved
                ? <CheckCircle2 size={36} style={{ color: "white" }} />
                : <Clock size={36} style={{ color: "white" }} />}
            </div>

            <h1
              className="text-center mt-6 transition-colors duration-300"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 700,
                color: isDark ? "#F5EFE0" : "#4B1F24",
              }}
            >
              {success.autoApproved ? "Registration Successful!" : "Application Submitted!"}
            </h1>

            <div className="flex justify-center mt-3">
              <OrnamentalDivider />
            </div>

            <p
              className="text-center mt-4 transition-colors duration-300"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: isDark ? "#A08070" : "#6E5A55",
                lineHeight: 1.6,
                maxWidth: 360,
              }}
            >
              {success.autoApproved
                ? "Your account has been created! Check your email for a link to set your password, then log in to get started."
                : "Your application is under review. You'll be notified via email once an admin reviews your registration."}
            </p>

            {success.autoApproved && (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="relative flex items-center justify-center transition-opacity mt-6"
                style={{
                  height: 50,
                  width: "100%",
                  background: isDark ? "linear-gradient(135deg,#D4732A,#C1440E)" : "linear-gradient(135deg,#8B1F44,#6B142F)",
                  borderRadius: 12,
                  boxShadow: isDark ? "0 10px 24px rgba(212,115,42,0.3)" : "0 10px 24px rgba(107,20,47,0.28)",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "white",
                  fontFamily: "'Inter',sans-serif",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Go to Login <ArrowRight size={17} className="ml-2" />
              </button>
            )}

            {!success.autoApproved && (
              <Link
                href="/login"
                className="mt-6 transition-colors"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: isDark ? "#D4732A" : "#8A3150",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                ← Back to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ────────────────────────────────────────
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 transition-all duration-300 login-background" />
      <div className={clsx("absolute inset-0 transition-colors duration-300", isDark ? "bg-black/60" : "bg-black/25")} />

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
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: isDark ? "#F5EFE0" : "#4B1F24" }}
          >
            Register for Hackathon
          </h1>

          <div className="flex justify-center mt-3">
            <OrnamentalDivider />
          </div>

          <p
            className="text-center mt-2.5 transition-colors duration-300"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: isDark ? "#A08070" : "#6E5A55" }}
          >
            Team leader registration — one registration per team
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col mt-6">

            {/* Name */}
            <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: isDark ? "#F5EFE0" : "#5C4944", marginBottom: 6 }}>
              Team Leader Name
            </label>
            <div className="relative">
              <User className="absolute transition-colors duration-300" style={{ left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: isDark ? "#A08070" : "#9A7B73" }} />
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={clsx("w-full outline-none transition-colors duration-300", isDark ? "placeholder-[#A08070]/60" : "placeholder-[#9A7B73]/60")}
                style={inputStyle(isDark)}
              />
            </div>

            {/* Team Name */}
            <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: isDark ? "#F5EFE0" : "#5C4944", marginTop: 14, marginBottom: 6 }}>
              Team Name
            </label>
            <div className="relative">
              <Users className="absolute transition-colors duration-300" style={{ left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: isDark ? "#A08070" : "#9A7B73" }} />
              <input
                type="text"
                placeholder="Your team's name (must be unique)"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                className={clsx("w-full outline-none transition-colors duration-300", isDark ? "placeholder-[#A08070]/60" : "placeholder-[#9A7B73]/60")}
                style={inputStyle(isDark)}
              />
            </div>

            {/* Phone */}
            <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: isDark ? "#F5EFE0" : "#5C4944", marginTop: 14, marginBottom: 6 }}>
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute transition-colors duration-300" style={{ left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: isDark ? "#A08070" : "#9A7B73" }} />
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className={clsx("w-full outline-none transition-colors duration-300", isDark ? "placeholder-[#A08070]/60" : "placeholder-[#9A7B73]/60")}
                style={inputStyle(isDark)}
              />
            </div>

            {/* Email */}
            <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, color: isDark ? "#F5EFE0" : "#5C4944", marginTop: 14, marginBottom: 6 }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute transition-colors duration-300" style={{ left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: isDark ? "#A08070" : "#9A7B73" }} />
              <input
                type="email"
                placeholder="leader@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={clsx("w-full outline-none transition-colors duration-300", isDark ? "placeholder-[#A08070]/60" : "placeholder-[#9A7B73]/60")}
                style={inputStyle(isDark)}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 mt-3"
                style={{
                  padding: "8px 12px",
                  background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                }}
              >
                <AlertCircle size={14} style={{ color: "#EF4444", flexShrink: 0 }} />
                <p style={{ color: "#EF4444", fontSize: 12, fontFamily: "'Inter',sans-serif", margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
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
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin mr-2" /> Registering...</>
              ) : (
                <>Register <ArrowRight size={17} className="absolute right-5" /></>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="mt-6">
            <WideDivider />
          </div>

          {/* Login link */}
          <p className="text-center mt-4 transition-colors duration-300" style={{ fontSize: 13, color: isDark ? "#A08070" : "#7A655D", fontFamily: "'Inter',sans-serif" }}>
            Already registered?{" "}
            <Link
              href="/login"
              className={clsx("transition-colors font-semibold", isDark ? "hover:text-[#F0C060]" : "hover:text-[#4B1F24]")}
              style={{ color: isDark ? "#D4732A" : "#8A3150" }}
            >
              Sign In →
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
