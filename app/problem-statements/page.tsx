import { ClipboardList, Info } from "lucide-react";
import Link from "next/link";

export default function ProblemStatementsPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6 py-5">
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 text-primary">
          <ClipboardList className="size-5" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">Challenge library</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Problem statements</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Official challenge briefs appear here when they are released by the organisers.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <Info className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">No problem statements are published yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Check the event timeline and announcements for the release window. You can still prepare your team and review the portal workflow.
        </p>
        <Link href="/guidelines" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          View guidelines
        </Link>
      </div>
    </section>
  );
}
