"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  Terminal,
  Cpu,
  Shield,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Code2,
  Trophy,
  CheckCircle2
} from "lucide-react";

import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { BorderGlow } from "@/components/ui/BorderGlow";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { ClickSpark } from "@/components/ui/ClickSpark";
import { OptionWheel } from "@/components/ui/OptionWheel";

export default function HomePage() {
  const { role, isAuthenticated, loading } = useAuth();

  const getWorkspaceHref = () => {
    if (role === "admin") return "/admin";
    if (role === "judge") return "/judge";
    return "/dashboard";
  };

  const tracks = [
    {
      id: "ai-systems",
      title: "Autonomous AI & Intelligent Agents",
      desc: "Agentic workflows, fine-tuned domain models, multimodal intelligence, and edge-native neural inference.",
      tag: "TRACK 01"
    },
    {
      id: "fintech",
      title: "Decentralized Protocols & FinTech",
      desc: "Zero-knowledge verification, algorithmic settlement rails, sovereign identity, and high-throughput financial state machines.",
      tag: "TRACK 02"
    },
    {
      id: "resilient-infra",
      title: "Resilient Infrastructure & Cyber Defense",
      desc: "Distributed systems, fault-tolerant orchestration, cryptographic consensus, and autonomous vulnerability triage.",
      tag: "TRACK 03"
    },
    {
      id: "open-innovation",
      title: "Smart Cities & Architectural Systems",
      desc: "Sensory grid optimization, urban telemetry pipelines, civic resilience, and civic technology for smart governance.",
      tag: "TRACK 04"
    }
  ];

  const highlights = [
    { label: "Engineering Sprint", value: "36 Hours", sub: "Continuous Hacking" },
    { label: "Grand Prize Pool", value: "₹2,50,000+", sub: "Audited Grants & Cash" },
    { label: "National Shortlist", value: "100 Teams", sub: "Vetted Builders" },
    { label: "Adjudication", value: "Jury Audited", sub: "Multi-Criteria Matrix" }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-12 sm:space-y-16 py-8 sm:py-14 px-4 sm:px-6">
      {/* ── HERO BANNER ── */}
      <section className="relative rounded-3xl border border-border bg-card p-6 sm:p-12 lg:p-16 shadow-md overflow-hidden text-center sm:text-left animate-entrance">
        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Technical Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/35 bg-secondary/15 px-3.5 py-1 text-xs font-bold text-secondary">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="tracking-wider uppercase">MANIPAL UNIVERSITY JAIPUR &bull; 2ND EDITION</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.08]">
              CODE-E-MANIPAL <span className="text-primary font-mono">2.0</span>
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-foreground/90 max-w-2xl">
              Premier 36-Hour National Flagship Hackathon Console
            </p>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Where Jaipur’s architectural symmetry meets modern technical rigor. 500+ elite engineers, builders, and designers assembling to forge high-impact software, sovereign systems, and scalable intelligence.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            {loading ? (
              <div className="h-11 w-44 rounded-xl bg-accent animate-pulse" />
            ) : isAuthenticated ? (
              <ClickSpark>
                <Link href={getWorkspaceHref()}>
                  <SpecularButton variant="primary" size="md">
                    <span>Access {role === "admin" ? "Operations" : role === "judge" ? "Evaluation" : "Workspace"}</span>
                    <ArrowRight size={16} />
                  </SpecularButton>
                </Link>
              </ClickSpark>
            ) : (
              <ClickSpark>
                <Link href="/login">
                  <SpecularButton variant="primary" size="md">
                    <span>Enter Hackathon Console</span>
                    <ArrowRight size={16} />
                  </SpecularButton>
                </Link>
              </ClickSpark>
            )}

            <Link
              href="/timeline"
              className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-accent hover:border-secondary/40 transition-all flex items-center gap-2"
            >
              <Calendar size={15} className="text-secondary" />
              <span>Event Timeline</span>
            </Link>

            <Link
              href="/problem-statements"
              className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-accent hover:border-primary/40 transition-all flex items-center gap-2"
            >
              <Code2 size={15} className="text-primary" />
              <span>Problem Statements</span>
            </Link>
          </div>

          {/* Meta Details */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6 text-xs text-muted-foreground justify-center sm:justify-start font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              <span>15–16 October 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-secondary" />
              <span>Manipal University Jaipur Campus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              <span>36 Hours Non-Stop</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SYSTEM HIGHLIGHTS / METRICS ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-entrance-stagger-1">
        {highlights.map((item, idx) => (
          <SpotlightCard
            key={idx}
            className="p-5 sm:p-6 flex flex-col justify-between"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary font-mono">
              {item.label}
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
            </div>
            <div className="h-1 w-8 rounded-full bg-primary/50" />
          </SpotlightCard>
        ))}
      </section>

      {/* ── TECHNICAL TRACKS & OPTION WHEEL EXPLORER ── */}
      <section className="space-y-6 animate-entrance-stagger-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              <Layers size={14} />
              <span>Architectural Arenas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Core Technical Tracks
            </h2>
          </div>
          <Link
            href="/problem-statements"
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Review Full Track Specifications</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Interactive Track Dial (Option Wheel) */}
        <OptionWheel />

        {/* Full Track Accessible Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {tracks.map((t) => (
            <SpotlightCard
              key={t.id}
              className="p-6 sm:p-7 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-secondary">{t.tag}</span>
                  <span className="h-2 w-2 rounded-full bg-secondary/40 group-hover:bg-secondary transition-colors" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">36-Hour Sprint Target</span>
                <span className="font-semibold text-secondary flex items-center gap-1">
                  <span>Explore Briefs</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ── CONSOLE CAPABILITIES / SYSTEM ARCHITECTURE ── */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-6 animate-entrance-stagger-3">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Cpu size={14} />
            <span>Mission Infrastructure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            Built for Serious Hackathon Operations
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            The Code-e-Manipal 2.0 portal is engineered from the ground up to deliver low-latency telemetry, deterministic submission state machines, and cryptographically verified adjudication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <SpotlightCard className="p-5 space-y-2 bg-accent/20">
            <div className="p-2 rounded-xl bg-card border border-border w-fit text-primary">
              <Terminal size={18} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Immutable Finalization</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Submission states transition through strict verification locks with tamper-proof timestamps and audit logs.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5 space-y-2 bg-accent/20">
            <div className="p-2 rounded-xl bg-card border border-border w-fit text-secondary">
              <Shield size={18} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Blind Adjudication</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dual-blind jury review matrices prevent bias. Scores remain cryptographically sealed until official ceremony release.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5 space-y-2 bg-accent/20">
            <div className="p-2 rounded-xl bg-card border border-border w-fit text-foreground">
              <Trophy size={18} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Live Telemetry</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time phase transitions, synchronized countdown clocks, and live broadcast announcements for all squads.
            </p>
          </SpotlightCard>
        </div>
      </section>

      {/* ── ORGANIZING INSTITUTIONS & ENTITIES ── */}
      <section className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 text-center space-y-4">
        <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Flagship National Event Organized By
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pt-2">
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-black tracking-tight text-foreground font-mono">
              MANIPAL UNIVERSITY JAIPUR
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Host Campus &amp; Academic Leadership</span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-black tracking-tight text-primary font-mono">
              LearnIT &bull; SCA
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">School of Computer Applications</span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-black tracking-tight text-secondary font-mono">
              E-CELL MUJ
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Entrepreneurship Cell Partnership</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER CALLOUT ── */}
      <BorderGlow>
        <section className="p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Ready to Begin the Engineering Sprint?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sign in with your registered team credentials or explore the full hackathon timeline and problem statements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/gallery"
              className="px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Past Editions
            </Link>
            <ClickSpark>
              <Link href="/login">
                <SpecularButton size="sm" variant="primary">
                  <span>Enter Console</span>
                  <ArrowRight size={14} />
                </SpecularButton>
              </Link>
            </ClickSpark>
          </div>
        </section>
      </BorderGlow>
    </div>
  );
}
