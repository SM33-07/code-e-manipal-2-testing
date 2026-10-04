"use client";

import Link from "next/link";
import {
  Lock,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Coins,
  HeartPulse,
  Lightbulb,
  ExternalLink,
  Users,
  FileCode,
} from "lucide-react";

const TRACKS = [
  {
    id: "ai",
    title: "AI & Intelligent Systems",
    icon: Cpu,
    tag: "Track 01",
    description:
      "Autonomous agents, multi-modal LLM workflows, edge intelligence, computer vision, and real-time inference architectures.",
    status: "Drops on Day 1, 10:30 AM",
  },
  {
    id: "web3",
    title: "Web3 & Decentralized Tech",
    icon: Coins,
    tag: "Track 02",
    description:
      "Zero-knowledge primitives, verifiable state machines, account abstraction, on-chain governance, and decentralized data rails.",
    status: "Drops on Day 1, 10:30 AM",
  },
  {
    id: "fintech-health",
    title: "FinTech & Healthcare Innovation",
    icon: HeartPulse,
    tag: "Track 03",
    description:
      "Financial inclusion rails, fraud mitigation systems, predictive triage, interoperable health records, and clinical workflows.",
    status: "Drops on Day 1, 10:30 AM",
  },
  {
    id: "open",
    title: "Open Innovation & Sustainability",
    icon: Lightbulb,
    tag: "Track 04",
    description:
      "Novel software engineering breakthroughs, green compute, supply chain transparency, urban tech, and student-driven ideas.",
    status: "Drops on Day 1, 10:30 AM",
  },
];

const PREPARATION_STEPS = [
  {
    step: "01",
    title: "Confirm Team Roster",
    detail: "Verify all 2-4 members in your Team Workspace before the roster freeze.",
    href: "/team",
    action: "View Team",
  },
  {
    step: "02",
    title: "Review Evaluation Rubric",
    detail: "Understand the 4 weighted criteria (Innovation, Technical, Demo, Impact).",
    href: "/guidelines",
    action: "Read Rubric",
  },
  {
    step: "03",
    title: "Inspect 36-Hour Timeline",
    detail: "Mark mentorship checkpoints, code freeze window, and jury demo times.",
    href: "/timeline",
    action: "Open Schedule",
  },
  {
    step: "04",
    title: "Prepare Clean Repository",
    detail: "Create your GitHub repository and verify public read permissions.",
    href: "/faq",
    action: "View FAQ",
  },
];

export default function ProblemStatementsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4 sm:py-8 px-4 sm:px-6">
      {/* Hero: Intentional Coming Soon State */}
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm relative overflow-hidden text-center sm:text-left">
        {/* Subtle decorative atmosphere */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
              <Lock size={13} className="text-secondary" />
              <span>CHALLENGE REVEAL IMMINENT</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Problem Statements
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              The official challenge briefs drop simultaneously for all teams at the start of the{" "}
              <strong className="text-foreground">36-Hour Hacking Phase</strong>. Your next mission
              is almost here.
            </p>
          </div>

          {/* Status Box */}
          <div className="shrink-0 rounded-2xl border border-border bg-background/80 p-5 text-center min-w-[220px] shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              <Clock size={14} />
              <span>Release Window</span>
            </div>
            <div className="text-2xl font-black text-foreground">Day 1 • 10:30 AM</div>
            <div className="text-xs text-muted-foreground mt-1">15 October 2026</div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary">
              <Calendar size={13} />
              <span>Manipal University Jaipur</span>
            </div>
          </div>
        </div>
      </header>

      {/* Track Previews */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Official Tracks</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Briefs will be unveiled under these four core tracks when hacking begins.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-accent text-muted-foreground border border-border">
            4 Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRACKS.map(({ id, title, icon: Icon, tag, description, status }) => (
            <div
              key={id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold tracking-wider text-secondary uppercase">
                      {tag}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 bg-background px-2.5 py-1 rounded-full border border-border">
                    <Lock size={11} className="text-secondary" />
                    Locked
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{status}</span>
                <span className="font-bold text-secondary text-[11px] uppercase tracking-wider">
                  Brief Hidden
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Readiness Checklist */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <CheckCircle2 size={14} />
            <span>Pre-Hack Checklist</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            What You Can Prepare Right Now
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            While waiting for the challenge reveal, ensure your team workflow is fully operational.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREPARATION_STEPS.map(({ step, title, detail, href, action }) => (
            <div
              key={step}
              className="rounded-xl border border-border bg-background/60 p-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-secondary">{step}</span>
                <h3 className="text-sm font-bold text-foreground mt-1 mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50">
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  <span>{action}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Return */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <span>← Return to My Workspace</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/team"
            className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Team Workspace
          </Link>
          <Link
            href="/timeline"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>View Timeline</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
