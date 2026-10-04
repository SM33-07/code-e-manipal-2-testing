"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  Clock3,
  Flag,
  ArrowRight,
  Sparkles,
  Coffee,
  Code2,
  Users2,
  Trophy,
  Flame,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  phase: "online" | "day1" | "day2";
  type: "ceremony" | "hack" | "checkpoint" | "hospitality" | "eval" | "awards";
  status: "completed" | "current" | "upcoming";
}

const SCHEDULE: ScheduleItem[] = [
  // Online Phase
  {
    id: "onl-1",
    time: "Prior to Event",
    title: "Registration & Account Provisioning",
    location: "Online Portal",
    description:
      "Team Leaders receive provisioned credentials, verify their team roster, and access the Code-e-Manipal 2.0 workspace.",
    phase: "online",
    type: "checkpoint",
    status: "completed",
  },
  {
    id: "onl-2",
    time: "Oct 14, 06:00 PM",
    title: "Pre-Hack Briefing & System Verification",
    location: "Online / Discord",
    description:
      "Final briefing on hackathon rules, submission requirements, and technical guidelines for participating teams.",
    phase: "online",
    type: "checkpoint",
    status: "completed",
  },

  // Day 1: 15 October 2026
  {
    id: "d1-1",
    time: "08:30 AM – 09:30 AM",
    title: "Participant Reporting & Physical Verification",
    location: "Ground Floor Lobby, Academic Block, MUJ",
    description:
      "Physical check-in, ID badge collection, Wi-Fi onboarding, and table workstation allocation for verified teams.",
    phase: "day1",
    type: "hospitality",
    status: "completed",
  },
  {
    id: "d1-2",
    time: "09:30 AM – 10:30 AM",
    title: "Grand Opening Ceremony & Welcome Address",
    location: "Main Auditorium, MUJ",
    description:
      "Inaugural addresses by university dignitaries, keynote speaker sessions, and introduction to the jury and mentors.",
    phase: "day1",
    type: "ceremony",
    status: "completed",
  },
  {
    id: "d1-3",
    time: "10:30 AM",
    title: "Problem Statements Revealed & 36-Hour Hack Begins",
    location: "Central Hack Area & Online Portal",
    description:
      "Official challenge briefs unlocked. The 36-hour hackathon timer commences. Teams begin architecture and coding.",
    phase: "day1",
    type: "hack",
    status: "current",
  },
  {
    id: "d1-4",
    time: "01:00 PM – 02:30 PM",
    title: "Lunch & Networking Break",
    location: "Food Court / Mess Area",
    description:
      "Buffet lunch provided for all participants, mentors, and organizing staff.",
    phase: "day1",
    type: "hospitality",
    status: "upcoming",
  },
  {
    id: "d1-5",
    time: "04:30 PM – 07:00 PM",
    title: "Mentorship Round 1 — Feasibility & Architecture Check",
    location: "Team Workstations",
    description:
      "Assigned domain mentors visit team stations to review initial architecture, stack feasibility, and challenge alignment.",
    phase: "day1",
    type: "checkpoint",
    status: "upcoming",
  },
  {
    id: "d1-6",
    time: "08:30 PM – 10:00 PM",
    title: "Dinner & Refreshments",
    location: "Food Court / Mess Area",
    description:
      "Dinner service and caffeine stations open throughout the night.",
    phase: "day1",
    type: "hospitality",
    status: "upcoming",
  },
  {
    id: "d1-7",
    time: "11:30 PM – Midnight",
    title: "Midnight Progress Check-in & Snack Surge",
    location: "Central Hack Area",
    description:
      "Quick status ping from organizing committee. Snacks, red bull, and coffee distributed to all active teams.",
    phase: "day1",
    type: "hospitality",
    status: "upcoming",
  },

  // Day 2: 16 October 2026
  {
    id: "d2-1",
    time: "03:00 AM – 05:00 AM",
    title: "Late Night Coding & Quiet Sprint",
    location: "Central Hack Area",
    description:
      "Dedicated quiet sprint hours. Chill out rooms and resting bays available.",
    phase: "day2",
    type: "hack",
    status: "upcoming",
  },
  {
    id: "d2-2",
    time: "07:30 AM – 09:00 AM",
    title: "Breakfast & Morning Energizer",
    location: "Food Court / Mess Area",
    description: "Hearty breakfast provided before the final stretch.",
    phase: "day2",
    type: "hospitality",
    status: "upcoming",
  },
  {
    id: "d2-3",
    time: "09:30 AM – 11:30 AM",
    title: "Mentorship Round 2 — Prototype Polish & Demo Preparation",
    location: "Team Workstations",
    description:
      "Mentors conduct dry runs of team pitches, live demos, and review final UI/UX polish.",
    phase: "day2",
    type: "checkpoint",
    status: "upcoming",
  },
  {
    id: "d2-4",
    time: "12:30 PM SHARP",
    title: "Hard Code Freeze & Submission Window Closes",
    location: "Code-e-Manipal Portal",
    description:
      "Absolute deadline. All GitHub commits, demo links, and project descriptions must be finalized in the portal.",
    phase: "day2",
    type: "checkpoint",
    status: "upcoming",
  },
  {
    id: "d2-5",
    time: "01:30 PM – 04:30 PM",
    title: "Final Jury Evaluation & Live Demonstrations",
    location: "Evaluation Labs & Auditoriums",
    description:
      "Judges grade teams on the 4 weighted criteria (Innovation, Technical Execution, Demo, Impact) via the judge workspace.",
    phase: "day2",
    type: "eval",
    status: "upcoming",
  },
  {
    id: "d2-6",
    time: "05:00 PM – 06:30 PM",
    title: "Valedictory Ceremony & Award Presentation",
    location: "Main Auditorium, MUJ",
    description:
      "Announcement of track winners, grand champions, special category prizes, and distribution of certificates.",
    phase: "day2",
    type: "awards",
    status: "upcoming",
  },
];

const PHASES = [
  { id: "all", label: "All Phases", badge: "36 Hours" },
  { id: "online", label: "Online Phase", badge: "Onboarding" },
  { id: "day1", label: "Day 1 (15 Oct)", badge: "Hacking Starts" },
  { id: "day2", label: "Day 2 (16 Oct)", badge: "Freeze & Jury" },
] as const;

export default function TimelinePage() {
  const [activePhase, setActivePhase] = useState<string>("all");

  const filteredSchedule = SCHEDULE.filter((item) => {
    if (activePhase === "all") return true;
    return item.phase === activePhase;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4 sm:py-8 px-4 sm:px-6">
      {/* Header */}
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
            <CalendarDays size={14} />
            <span>OFFICIAL 36-HOUR EVENT SCHEDULE</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Hackathon Timeline
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Follow the complete chronological lifecycle of Code-e-Manipal 2.0. From reporting and
            challenge release to mentorship rounds, code freeze, and jury evaluation.
          </p>

          {/* Quick Stats */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-secondary" />
              <span>Duration: <strong className="text-foreground">36 Hours Continuous</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-secondary" />
              <span>Dates: <strong className="text-foreground">15 & 16 October 2026</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-secondary" />
              <span>Venue: <strong className="text-foreground">Manipal University Jaipur</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Phase Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PHASES.map(({ id, label, badge }) => {
          const isActive = activePhase === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActivePhase(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-background text-muted-foreground border border-border"
                }`}
              >
                {badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Process Timeline Rail (Responsive Single-Column Left-Rail) */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
        {filteredSchedule.map((item, index) => {
          const isCompleted = item.status === "completed";
          const isCurrent = item.status === "current";

          return (
            <div key={item.id} className="relative group">
              {/* Rail Node Indicator */}
              <div
                className={`absolute -left-6 sm:-left-8 top-4 flex size-5 sm:size-7 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                    : isCompleted
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={12} className="sm:size-3.5" />
                ) : isCurrent ? (
                  <Radio size={12} className="sm:size-3.5 animate-spin" />
                ) : (
                  <div className="size-1.5 sm:size-2 rounded-full bg-muted-foreground" />
                )}
              </div>

              {/* Event Content Card */}
              <div
                className={`rounded-2xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:border-primary/40 ${
                  isCurrent
                    ? "border-primary/60 ring-1 ring-primary/20 bg-card"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-secondary bg-secondary/15 px-2.5 py-1 rounded-md border border-secondary/25">
                      {item.time}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/25">
                        <Flame size={12} />
                        <span>ACTIVE NOW</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={13} className="text-secondary shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav Helper */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">Ready for the challenge drop?</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review challenge tracks or prepare your team workspace while the countdown ticks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/problem-statements"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Problem Statements</span>
            <ArrowRight size={13} />
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            My Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
