"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  Lock,
  Unlock,
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
  ShieldAlert,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ProblemStatement {
  id: string;
  trackId: string;
  trackName: string;
  tag: string;
  title: string;
  icon: any;
  summary: string;
  problemBrief: string;
  deliverables: string[];
  evaluationFocus: string;
}

const PUBLISHED_PROBLEMS: ProblemStatement[] = [
  {
    id: "ps-ai-01",
    trackId: "ai",
    trackName: "AI & Intelligent Systems",
    tag: "Track 01",
    icon: Cpu,
    title: "Autonomous Multi-Modal Copilot for Rural Healthcare Diagnostics",
    summary:
      "Design an offline-first or low-bandwidth AI diagnostic copilot capable of triaging medical symptoms, localizing vernacular speech, and generating structured clinical summaries.",
    problemBrief:
      "Rural health centers face critical shortages of specialized medical personnel. Develop an edge-computed or lightweight multi-modal assistant that takes patient vitals, audio descriptions in local dialects (e.g., Hindi/Rajasthani), and visual lesion/skin photos to generate preliminary triage flags, emergency alerts, and verifiable health records.",
    deliverables: [
      "Working multi-modal inference pipeline with fallback for low-connectivity environments",
      "Vernacular speech-to-text / symptom triage interface with high precision",
      "Public GitHub repository with documentation and reproducible setup",
      "Live interactive demonstration with sample patient triage cases",
    ],
    evaluationFocus: "Technical Execution (30%) & Practical Impact (20%) in rural clinics",
  },
  {
    id: "ps-w3-02",
    trackId: "web3",
    trackName: "Web3 & Decentralized Tech",
    tag: "Track 02",
    icon: Coins,
    title: "Verifiable Zero-Knowledge Supply Chain Provenance for Artisanal Crafts",
    summary:
      "Build a decentralized provenance verification system utilizing zero-knowledge proofs and decentralized identity (DID) to authenticate genuine handcrafted GI-tagged goods.",
    problemBrief:
      "Counterfeiting severely damages indigenous artisans and GI-tagged heritage industries (such as Jaipur Blue Pottery and Sanganeri Block Prints). Build an end-to-end provenance registry where artisans create tamper-proof cryptographic origin claims without leaking proprietary workshop methods or trade secrets.",
    deliverables: [
      "Smart contract suite for decentralized product identity and provenance tracking",
      "Zero-knowledge proof verification circuit or gas-optimized verification flow",
      "Mobile-friendly consumer verification interface (QR scanner / NFC check)",
      "Comprehensive test coverage and public GitHub repository",
    ],
    evaluationFocus: "Cryptographic Architecture (30%) & Innovation / Originality (30%)",
  },
  {
    id: "ps-fin-03",
    trackId: "fintech-health",
    trackName: "FinTech & Healthcare Innovation",
    tag: "Track 03",
    icon: HeartPulse,
    title: "Real-Time Fraud & Anomaly Triage for Micro-Merchant UPI Payments",
    summary:
      "Develop an edge-computed anomaly detection pipeline that intercepts rogue QR injection, duplicate webhook replays, and fraudulent chargeback schemes for micro-merchants.",
    problemBrief:
      "Small street merchants and rural retailers are increasingly targeted by fraudulent payment spoofing apps and rogue QR overlays. Build a real-time validation gateway that cross-references payment gateway webhook signatures, acoustic confirmation tones, and merchant hardware IDs with sub-200ms latency.",
    deliverables: [
      "Real-time transaction anomaly detection service with low-latency scoring",
      "Merchant alert dashboard or soundbox integration prototype",
      "Simulation harness with synthesized fraud scenarios and synthetic transaction load",
      "Public code repository with architectural block diagram",
    ],
    evaluationFocus: "Architecture & Latency Performance (30%) & Real-World Utility (20%)",
  },
  {
    id: "ps-open-04",
    trackId: "open",
    trackName: "Open Innovation & Sustainability",
    tag: "Track 04",
    icon: Lightbulb,
    title: "Clean Energy Optimization & Peak Load Shifting for University Microgrids",
    summary:
      "Create an algorithmic smart-meter dispatch dashboard that balances intermittent solar array feeds, diesel backup generators, and campus peak loads using predictive demand forecasting.",
    problemBrief:
      "Large academic campuses consume gigawatt-hours annually while transitioning to rooftop solar arrays with unpredictable solar irradiance. Formulate an intelligent dispatch algorithm that schedules heavy loads (HVAC chillers, water pumps, computational clusters) during peak solar generation and minimizes diesel generator combustion.",
    deliverables: [
      "Predictive load optimization algorithm using simulated weather and campus telemetry",
      "Interactive energy management console with real-time dispatch visualization",
      "Carbon abatement / diesel displacement metric calculator",
      "Clean open-source repository with clear setup instructions",
    ],
    evaluationFocus: "Algorithmic Elegance (30%) & Sustainability Impact (20%)",
  },
];

const TRACK_PREVIEWS = [
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
    href: "/dashboard",
    action: "View Workspace",
  },
  {
    step: "02",
    title: "Review Evaluation Rubric",
    detail: "Understand the 4 weighted criteria (Innovation 30%, Technical 30%, Demo 20%, Impact 20%).",
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
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [loading, setLoading] = useState(true);
  const [eventPhase, setEventPhase] = useState<string>("NOT_STARTED");
  const [publishing, setPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/event-config");
      if (res.ok) {
        const json = await res.json();
        const phase = json.data?.event_phase || "NOT_STARTED";
        setEventPhase(phase);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Content is locked if phase is NOT_STARTED
  const isPublished = eventPhase !== "NOT_STARTED";

  // Admin action: deliberate, auditable publish action
  const handlePublishProblems = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/event-config/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_phase: "HACKING" }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to publish problem statements");
      }

      toast.success("Problem statements published successfully! The challenge vault is now live to all participants.");
      setShowConfirmModal(false);
      await fetchConfig();
    } catch (err: any) {
      toast.error(err.message || "Error publishing problem statements");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4 sm:py-8 px-4 sm:px-6">
      {/* ── Admin Management Bar ── */}
      {isAdmin && (
        <div className="rounded-2xl border border-secondary/40 bg-card p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/30">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Admin Problem Statement Operations
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    isPublished
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {isPublished ? "Live to Participants" : "Vault Sealed (Pre-Release)"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current Event Phase: <strong className="text-foreground font-mono">{eventPhase}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isPublished ? (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Unlock size={14} />
                <span>Publish Problem Statements</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/25">
                <Check size={14} />
                <span>Problem Statements Live</span>
              </div>
            )}
            <Link
              href="/admin/event-control"
              className="px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Event Control
            </Link>
          </div>
        </div>
      )}

      {/* ── Main Header ── */}
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm relative overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
              {isPublished ? <Unlock size={13} /> : <Lock size={13} />}
              <span>{isPublished ? "PROBLEM STATEMENTS VAULT UNLOCKED" : "PROBLEM STATEMENTS VAULT SEALED"}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Problem Statements
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {isPublished
                ? "The official Code-e-Manipal 2.0 problem statements are live. Review project requirements, deliverables, and evaluation focus."
                : "The problem statements vault is still sealed. The missions unlock when the 36-hour hackathon begins."}
            </p>
          </div>

          {/* Status Box */}
          <div className="shrink-0 rounded-2xl border border-border bg-card p-5 text-center min-w-[220px] shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              <Clock size={14} />
              <span>{isPublished ? "Vault State" : "Release Window"}</span>
            </div>
            <div className="text-2xl font-black text-foreground">
              {isPublished ? "Active Hacking" : "Day 1 • 10:30 AM"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">15 &amp; 16 October 2026</div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary">
              <Calendar size={13} />
              <span>Manipal University Jaipur</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── IF PUBLISHED: Display Complete Problem Statements ── */}
      {isPublished ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Official Problem Statements
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Select one problem statement aligning with your registered track.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              4 Problem Statements Active
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {PUBLISHED_PROBLEMS.map((prob) => {
              const Icon = prob.icon;
              return (
                <div
                  key={prob.id}
                  className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                        <Icon size={22} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                          {prob.tag} &bull; {prob.trackName}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                          {prob.title}
                        </h3>
                      </div>
                    </div>

                    <Link
                      href="/submit"
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                    >
                      <span>Submit Solution</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {/* Problem Brief */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Problem Context &amp; Objectives
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-accent/20 p-4 rounded-2xl border border-border">
                      {prob.problemBrief}
                    </p>
                  </div>

                  {/* Required Deliverables */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Expected Deliverables
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {prob.deliverables.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-card p-2.5 rounded-xl border border-border/70">
                          <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evaluation Focus Badge */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-xs">
                      Primary Rubric Weight: <strong className="text-foreground">{prob.evaluationFocus}</strong>
                    </span>
                    <Link href="/guidelines" className="text-primary font-semibold hover:underline">
                      View Scoring Rubrics →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* ── IF SEALED: Engaging Coming Soon Experience ── */
        <>
          {/* Track Previews */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Official Tracks</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Briefs will be revealed simultaneously across these four tracks at the start of Day 1.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-accent text-muted-foreground border border-border">
                4 Tracks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRACK_PREVIEWS.map(({ id, title, icon: Icon, tag, description, status }) => (
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
                      Vault Sealed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pre-Hack Checklist */}
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
                Ensure your team roster and workspace prerequisites are verified before the opening ceremony.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PREPARATION_STEPS.map(({ step, title, detail, href, action }) => (
                <div
                  key={step}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between"
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
        </>
      )}

      {/* Return Links */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <span>← Return to My Workspace</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/faq"
            className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Participant FAQ
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

      {/* ── Admin Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Unlock size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Publish Problem Statements?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Audited Operational Action
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-accent/30 border border-border p-4 text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>
                This action will advance the event state machine to <strong className="text-foreground">HACKING</strong> and immediately unlock the official problem statements for all participants.
              </p>
              <p className="text-primary font-semibold">
                This action is audited and cannot be silently undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublishProblems}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {publishing && <Loader2 size={13} className="animate-spin" />}
                <span>Confirm &amp; Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
