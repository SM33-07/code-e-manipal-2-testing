"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ShieldCheck,
  Users,
  Send,
  Gavel,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "account" | "team" | "submission" | "judging" | "schedule" | "problem";
  question: string;
  answer: string;
  linkText?: string;
  linkHref?: string;
}

const FAQS: FAQItem[] = [
  {
    id: "acc-1",
    category: "account",
    question: "How do I receive my Code-e-Manipal 2.0 portal credentials?",
    answer:
      "All participating team accounts, judge credentials, and administrator accesses are provisioned directly by the LearnIT & E-Cell organizing committee. Public registration/signup is not open. Team Leaders receive their unique identifier and password via the official registration email.",
  },
  {
    id: "acc-2",
    category: "account",
    question: "Can multiple team members use the same login account?",
    answer:
      "The portal is designed primarily for the Team Leader. The Team Leader manages the roster, edits submission details, and executes final project submission. Other members may review project details through the leader's account or collaborate directly on the shared code repository.",
  },
  {
    id: "acc-3",
    category: "account",
    question: "I forgot my password or cannot log in. How do I reset it?",
    answer:
      "Because accounts are strictly provisioned and access-controlled, automated self-service password reset is disabled. Please contact the Help Desk at the venue (Manipal University Jaipur) or reach out to the LearnIT technical coordinators for an audited password reset.",
  },
  {
    id: "team-1",
    category: "team",
    question: "What is the allowed team size for Code-e-Manipal 2.0?",
    answer:
      "Teams must comprise between 2 and 4 members. Every team has exactly one designated Team Leader. Changes to team composition after the registration freeze must be authorized by the Admin Operations Desk.",
    linkText: "View Team Workspace",
    linkHref: "/team",
  },
  {
    id: "team-2",
    category: "team",
    question: "How do I invite or add team members to my portal roster?",
    answer:
      "Navigate to your Team Workspace (/team). Your team code is displayed at the top. Share this code with your teammates so they can be registered on your roster before the team freeze deadline.",
    linkText: "Go to Team Workspace",
    linkHref: "/team",
  },
  {
    id: "prob-1",
    category: "problem",
    question: "When will the official Problem Statements be released?",
    answer:
      "The official challenge briefs are unlocked simultaneously for all teams at the start of the Hacking Phase (Day 1, 10:30 AM). You will be able to review challenge requirements, evaluation expectations, and technical guidelines on the Problem Statements page.",
    linkText: "Check Challenge Drop Status",
    linkHref: "/problem-statements",
  },
  {
    id: "prob-2",
    category: "problem",
    question: "Can our team work on an Open Innovation idea?",
    answer:
      "Yes! In addition to specific curated industry tracks (such as AI & Intelligent Systems, Web3, and FinTech/Healthcare), Code-e-Manipal 2.0 includes an Open Innovation track allowing original problem definitions. Select 'Open Innovation' during project submission.",
  },
  {
    id: "sub-1",
    category: "submission",
    question: "What materials are required for final submission?",
    answer:
      "A complete submission requires: (1) Project Title, (2) Category/Track selection, (3) Public GitHub / Git repository URL, (4) Hosted live demonstration link or video pitch URL, and (5) Project summary detailing architecture, tech stack, and impact.",
    linkText: "Review Submission Form",
    linkHref: "/submit",
  },
  {
    id: "sub-2",
    category: "submission",
    question: "What is the difference between 'Draft' and 'Finalized' submission?",
    answer:
      "You can save your work as a 'Draft' at any time while iterating. Once you click 'Finalize Submission', your project is locked for evaluation and assigned to the jury. Once locked, submissions cannot be edited without an administrative override.",
  },
  {
    id: "sub-3",
    category: "submission",
    question: "We made an accidental typo after finalizing. Can we reopen our submission?",
    answer:
      "If the submission window is still active, you may request the Admin Operations team to reopen your submission. An administrator must provide an audited justification to unlock a finalized submission.",
  },
  {
    id: "judge-1",
    category: "judging",
    question: "How are projects evaluated by the jury?",
    answer:
      "Judges evaluate submissions across four authoritative criteria on a 1-to-10 scale: Innovation & Originality (30%), Technical Execution & Architecture (30%), Presentation & Demo (20%), and Practical Impact & Feasibility (20%). The final score is normalized to a 100-point composite.",
    linkText: "Read Technical Guidelines",
    linkHref: "/guidelines",
  },
  {
    id: "judge-2",
    category: "judging",
    question: "Will judges evaluate private GitHub repositories?",
    answer:
      "No. Ensure your GitHub repository is public or includes public read access before finalizing. Repositories that cannot be cloned or inspected during jury rounds will receive zero for Technical Execution.",
  },
  {
    id: "sched-1",
    category: "schedule",
    question: "Where is Code-e-Manipal 2.0 taking place?",
    answer:
      "The on-campus 36-hour hackathon takes place at Manipal University Jaipur (MUJ), Dehmi Kalan, Jaipur, Rajasthan. Details on specific lab and hall allocations are posted in the Event Timeline.",
    linkText: "View 36-Hour Timeline",
    linkHref: "/timeline",
  },
  {
    id: "sched-2",
    category: "schedule",
    question: "What are the key milestones during the 36 hours?",
    answer:
      "The hackathon includes: (1) Opening Ceremony & Keynote, (2) Problem Statement release & hacking commencement, (3) Mentorship Round 1 (Architecture check), (4) Mentorship Round 2 (Polish & Pitch check), (5) Hard Code Freeze & Portal Submission, and (6) Final Jury Demos & Valedictory Ceremony.",
    linkText: "See Detailed Schedule",
    linkHref: "/timeline",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "account", label: "Account & Login", icon: ShieldCheck },
  { id: "team", label: "Team & Roster", icon: Users },
  { id: "problem", label: "Problem Statements", icon: Sparkles },
  { id: "submission", label: "Submissions", icon: Send },
  { id: "judging", label: "Judging & Rubric", icon: Gavel },
  { id: "schedule", label: "Schedule & Venue", icon: Calendar },
] as const;

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["acc-1", "prob-1"]));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4 sm:py-8 px-4 sm:px-6">
      {/* Header */}
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
            <HelpCircle size={14} />
            <span>PARTICIPANT SUPPORT & GUIDANCE</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to know about Code-e-Manipal 2.0: account provisioning, team
            workspace management, challenge releases, submission requirements, and jury evaluation.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword (e.g. deadline, team, github, rubric)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const isActive = selectedCategory === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedCategory(id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <HelpCircle size={32} className="mx-auto text-muted-foreground opacity-50 mb-3" />
            <h3 className="text-base font-bold text-foreground">No matching questions found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              We couldn&apos;t find an answer matching &ldquo;{searchQuery}&rdquo;. Try another search term
              or reach out to the LearnIT Help Desk at the event.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold hover:bg-secondary/25 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-border bg-card shadow-sm transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-foreground leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`shrink-0 p-1 rounded-lg border border-border transition-transform duration-200 ${
                      isExpanded
                        ? "rotate-180 bg-primary/10 text-primary border-primary/20"
                        : "text-muted-foreground bg-background"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border/50 bg-muted/40 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <p>{faq.answer}</p>
                    {faq.linkHref && faq.linkText && (
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <Link
                          href={faq.linkHref}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          <span>{faq.linkText}</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-foreground">Still have questions?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            For operational emergencies during the 36-hour hackathon, visit the Help Desk in Lab
            Block 3 or consult the official technical documentation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/guidelines"
            className="px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Guidelines
          </Link>
          <Link
            href="/timeline"
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Event Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
