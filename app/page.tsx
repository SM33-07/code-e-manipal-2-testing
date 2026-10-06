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
  Award,
  Medal,
  type LucideIcon
} from "lucide-react";

import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { ClickSpark } from "@/components/ui/ClickSpark";
import { OptionWheel } from "@/components/ui/OptionWheel";
import { TextReveal } from "@/components/ui/TextReveal";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { FinalCta } from "@/components/ui/FinalCta";
import { SponsorPartners } from "@/components/ui/SponsorPartners";
import { DETAILED_TRACKS, PRIZE_STRUCTURE } from "@/lib/event/eventConstants";

export default function HomePage() {
  const { role, isAuthenticated, loading } = useAuth();

  const getWorkspaceHref = () => {
    if (role === "admin") return "/admin";
    if (role === "judge") return "/judge";
    return "/dashboard";
  };

  const tracks = DETAILED_TRACKS;

  const highlights = [
    { label: "Engineering Sprint", value: "36 Hours", sub: "Continuous Hacking" },
    { label: "Grand Prize Pool", value: PRIZE_STRUCTURE.advertisedTotal, sub: "Audited Grants & Cash" },
    { label: "National Shortlist", value: "200+ Teams", sub: "Vetted Builders" },
    { label: "Adjudication", value: "Jury Audited", sub: "Multi-Criteria Matrix" }
  ];
  const prizeCards: { index: string; title: string; detail: string; icon: LucideIcon }[] = [
    { index: "01", title: "Winner", detail: PRIZE_STRUCTURE.winner, icon: Trophy },
    { index: "02", title: "1st Runner Up", detail: PRIZE_STRUCTURE.firstRunnerUp, icon: Medal },
    { index: "03", title: "2nd Runner Up", detail: PRIZE_STRUCTURE.secondRunnerUp, icon: Medal },
    { index: "TOP 10", title: "Top 10 Recognition", detail: PRIZE_STRUCTURE.top10, icon: Award },
  ];


  return (
    <div className="mx-auto max-w-7xl space-y-16 sm:space-y-24 py-8 sm:py-14 px-4 sm:px-6">
      {/* ── HERO BANNER ── */}
      <section className="relative min-h-[540px] overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl sm:p-12 lg:p-16 animate-entrance">
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[36%] border-l border-border lg:block" />
        <div className="pointer-events-none absolute right-[10%] top-[18%] hidden font-mono text-[clamp(5rem,12vw,12rem)] font-black leading-none text-primary/[0.06] lg:block">2.0</div>
        <div className="relative z-10 flex min-h-[420px] max-w-4xl flex-col justify-center space-y-6 text-center sm:text-left">
          {/* Technical Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/35 bg-secondary/15 px-3.5 py-1 text-xs font-bold text-secondary">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="tracking-wider uppercase">MANIPAL UNIVERSITY JAIPUR &bull; 2ND EDITION</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <TextReveal as="h1" className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.08]">
              CODE-E-MANIPAL <span className="text-primary font-mono">2.0</span>
            </TextReveal>
            <p className="max-w-2xl text-lg font-medium text-foreground/90 sm:text-2xl">
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
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm lg:grid-cols-4 animate-entrance-stagger-1">
        {highlights.map((item, idx) => (
          <SpotlightCard
            key={idx}
            className="rounded-none border-0 p-5 sm:p-7 flex flex-col justify-between shadow-none"
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
      <section className="space-y-8 animate-entrance-stagger-2">
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

      {/* ── PRIZE ARCHITECTURE ── */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.6fr] lg:items-stretch">
        <div className="rounded-3xl border border-border bg-surface-elevated p-7 shadow-sm sm:p-9">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary"><Award size={15} />Competition Recognition</div>
          <TextReveal as="h2" className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Built to reward serious work.</TextReveal>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">A layered recognition structure for the projects that demonstrate technical depth, credible execution, and real-world impact.</p>
          <Link href="/timeline" className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80">View ceremony schedule <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {prizeCards.map(({ index, title, detail, icon: PrizeIcon }) => {
            return <article key={title} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-md"><div className="flex items-start justify-between"><span className="font-mono text-[11px] font-bold text-secondary">{index}</span><PrizeIcon size={18} className="text-primary" /></div><h3 className="mt-7 text-lg font-bold text-foreground">{title}</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p></article>;
          })}
        </div>
      </section>

      {/* ── CONSOLE CAPABILITIES / SYSTEM ARCHITECTURE ── */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-8 animate-entrance-stagger-3">
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
          <FeatureCard index="01" icon={Terminal} title="Immutable Finalization" description="Submission states transition through strict verification locks with tamper-proof timestamps and audit logs." />
          <FeatureCard index="02" icon={Shield} title="Blind Adjudication" description="Dual-blind jury review matrices prevent bias. Scores remain sealed until official ceremony release." />
          <FeatureCard index="03" icon={Trophy} title="Live Telemetry" description="Real-time phase transitions, synchronized countdown clocks, and live broadcast announcements for all squads." />
        </div>
      </section>

      {/* OFFICIAL_PARTNERS default list used — logos served from /public/images/partners/ */}
      <SponsorPartners />

      {/* ── FOOTER CALLOUT ── */}
      <FinalCta title="Ready to Begin the Engineering Sprint?" description="Sign in with your provisioned team credentials or review the event timeline before the challenge release." href="/login" action="Enter Console" />
    </div>
  );
}
