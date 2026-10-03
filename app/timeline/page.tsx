import { CalendarDays, CheckCircle2, Clock3, Flag } from "lucide-react";

const phases = [
  { name: "Registration & onboarding", detail: "Provisioned teams receive their portal credentials and event information." },
  { name: "Hacking", detail: "Build, collaborate with your team, and keep your project workspace current." },
  { name: "Submission window", detail: "Complete required fields, verify links and assets, then finalize your submission." },
  { name: "Judging", detail: "Assigned judges review finalized projects through the secure evaluation workflow." },
  { name: "Results", detail: "Published results are released through the official event workflow." },
];

export default function TimelinePage() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 py-5">
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 text-primary">
          <CalendarDays className="size-5" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">Event operations</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Hackathon timeline</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Follow the event lifecycle here. Exact dates and live state are published by the organising team through the portal.
        </p>
      </header>

      <ol className="space-y-3" aria-label="Hackathon phases">
        {phases.map((phase, index) => (
          <li key={phase.name} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-mono text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                {index < 2 ? <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> : index === 2 ? <Clock3 className="size-4 text-warning" aria-hidden="true" /> : <Flag className="size-4 text-muted-foreground" aria-hidden="true" />}
                {phase.name}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{phase.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
