"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Images, Sparkles } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cleanIdentifier = identifier.trim().toLowerCase();
      await login(cleanIdentifier, password);
      router.push("/dashboard");
    } catch (err: any) {
      triggerError(err?.message || "Login failed. Please verify your ID and password.");
    }
    setLoading(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Heritage Photographic Atmosphere with directional vignette veil */}
      <div className="absolute inset-0 login-background opacity-85 dark:opacity-45 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/35 via-background/65 to-background/95 dark:from-background/60 dark:via-background/85 dark:to-background/95 pointer-events-none" />

      {/* Top Bar with Brand & Theme Toggle */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4">
        <BrandLogo size="md" subtitle="Technical Hackathon Console" />
        <ThemeToggle />
      </div>

      {/* Main Login Viewport */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 lg:justify-end lg:px-20 pt-16">
        <div
          className={clsx(
            "w-full max-w-[440px] bg-card text-card-foreground border border-border rounded-2xl p-8 sm:p-10 shadow-2xl transition-all duration-200",
            shake && "animate-shake"
          )}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 border border-secondary/30 text-secondary mb-3">
              <Sparkles size={12} />
              <span>Technical Console Login</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 tracking-wide">
              Sign in with your participant, judge, or admin identifier
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Identifier input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-foreground">
                User ID / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="e.g. TEAM-001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.toLowerCase())}
                  required
                  className="w-full h-11 pl-10 pr-4 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-11 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <span className="text-muted-foreground hover:text-secondary transition-colors cursor-pointer font-medium">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : "Access Console"}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Public Portal
            </span>
          </div>

          {/* Public Gallery Link */}
          <Link
            href="/gallery"
            className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1"
          >
            <Images size={15} className="text-secondary" />
            <span>Explore Public Project Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
