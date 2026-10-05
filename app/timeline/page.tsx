"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  Flame,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { Timeline, TimelineEntry } from "@/components/ui/timeline";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  phase: "online" | "day1" | "day2";
  type: "ceremony" | "hack" | "checkpoint" | "hospitality" | "eval" | "awards";
  status: "completed" | "current" | "upcoming" | "locked";
}

const RAW_SCHEDULE: ScheduleItem[] = [
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
      "Briefing on hackathon rules, submission guidelines, evaluation rubrics, and workspace readiness.",
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
      "Physical check-in, ID badge distribution, Wi-Fi configuration, and table allocation for verified teams.",
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
      "Keynote addresses by university leadership and industry partners, followed by introduction of the jury and mentors.",
    phase: "day1",
    type: "ceremony",
    status: "completed",
  },
  {
    id: "d1-3",
    time: "10:30 AM",
    title: "Problem Statements Released & 36-Hour Hack Begins",
    location: "Central Hack Area & Online Portal",
    description:
      "Official challenge briefs unlocked. The 36-hour hackathon timer commences. Teams begin sprint development.",
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
      "Buffet lunch provided for all registered participants, mentors, and organizing staff.",
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
      "Assigned domain mentors visit team stations to review initial system architecture, tech stack feasibility, and challenge alignment.",
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
      "Dinner service. Midnight caffeine stations open throughout the night.",
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
      "Quick status ping by the organizing committee. Energy snacks, Red Bull, and tea/coffee distributed.",
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
      "Dedicated quiet sprint hours. Chill-out bays and resting zones open.",
    phase: "day2",
    type: "hack",
    status: "upcoming",
  },
  {
    id: "d2-2",
    time: "07:30 AM – 09:00 AM",
    title: "Breakfast & Morning Energizer",
    location: "Food Court / Mess Area",
    description: "Breakfast service for all active hackers.",
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
      "Mentors conduct dry runs of team pitches, live demos, and UI/UX polish reviews before final code freeze.",
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
      "Absolute deadline. All GitHub commits, live demo URLs, and project summaries must be finalized in the portal.",
    phase: "day2",
    type: "checkpoint",
    status: "locked",
  },
  {
    id: "d2-5",
    time: "01:30 PM – 04:30 PM",
    title: "Final Jury Evaluation & Live Demonstrations",
    location: "Evaluation Labs & Auditoriums",
    description:
      "Judges grade teams on the 4 weighted criteria (Innovation, Technical Execution, Demo, Impact) via the dedicated judge console.",
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
      "Announcement of track winners, overall champions, prize distribution, and concluding remarks.",
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
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const renderEventCards = (items: ScheduleItem[]) => {
    return (
      <div className="space-y-4">
        {items.map((item) => {
          const isCompleted = item.status === "completed";
          const isCurrent = item.status === "current";
          const isUpcoming = item.status === "upcoming";
          const isLocked = item.status === "locked";

          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-sm transition-all ${
                isCurrent
                  ? "border-primary ring-2 ring-primary/20 bg-card"
                  : isCompleted
                  ? "border-border/70 opacity-80"
                  : isLocked
                  ? "border-dashed border-border/80 opacity-75"
                  : "border-border hover:border-secondary/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-secondary bg-secondary/15 px-2.5 py-1 rounded-md border border-secondary/25">
                    {item.time}
                  </span>

                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-0.5 rounded-full border border-primary/30">
                      <Flame size={12} className="animate-pulse" />
                      <span>CURRENT</span>
                    </span>
                  )}

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                      <CheckCircle2 size={11} className="text-secondary" />
                      <span>Completed</span>
                    </span>
                  )}

                  {isUpcoming && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/25">
                      <Clock size={11} />
                      <span>Upcoming</span>
                    </span>
                  )}

                  {isLocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-accent/40 px-2 py-0.5 rounded-md border border-border">
                      <Lock size={11} />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={13} className="text-secondary shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-foreground">
                {item.title}
              </h4>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Group into Aceternity Timeline structure
  const onlineItems = RAW_SCHEDULE.filter((i) => i.phase === "online");
  const day1Items = RAW_SCHEDULE.filter((i) => i.phase === "day1");
  const day2Items = RAW_SCHEDULE.filter((i) => i.phase === "day2");

  const timelineData: TimelineEntry[] = [];

  if (activeFilter === "all" || activeFilter === "online") {
    timelineData.push({
      title: "Online Phase",
      subtitle: "Pre-Event Onboarding",
      badge: "Stage 01",
      content: renderEventCards(onlineItems),
    });
  }

  if (activeFilter === "all" || activeFilter === "day1") {
    timelineData.push({
      title: "15 October — Day 1",
      subtitle: "Reporting & Hacking Launch",
      badge: "Stage 02",
      content: renderEventCards(day1Items),
    });
  }

  if (activeFilter === "all" || activeFilter === "day2") {
    timelineData.push({
      title: "16 October — Day 2",
      subtitle: "Code Freeze & Jury Demos",
      badge: "Stage 03",
      content: renderEventCards(day2Items),
    });
  }

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
            Follow the complete chronological schedule of Code-e-Manipal 2.0. From registration and
            challenge reveal to mentorship rounds, code freeze, and jury evaluation.
          </p>

          {/* Quick Metrics */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-secondary" />
              <span>
                Duration: <strong className="text-foreground">36 Hours Continuous</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-secondary" />
              <span>
                Dates: <strong className="text-foreground">15 & 16 October 2026</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-secondary" />
              <span>
                Venue: <strong className="text-foreground">Manipal University Jaipur</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Phase Filter Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PHASES.map(({ id, label, badge }) => {
          const isActive = activeFilter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFilter(id)}
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

      {/* Aceternity-Inspired Continuous Timeline Component */}
      <Timeline data={timelineData} />

      {/* Bottom CTA Card */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">Next Hackathon Action</h3>
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
