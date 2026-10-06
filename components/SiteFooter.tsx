import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { EVENT_IDENTITY } from "@/lib/event/eventConstants";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-12 border-t border-border bg-surface-elevated">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <BrandLogo size="sm" />
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
            {EVENT_IDENTITY.name} is hosted by {EVENT_IDENTITY.hostInstitution}.
          </p>
        </div>
        <nav aria-label="Public site navigation">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">Explore</p>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/timeline" className="w-fit text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Timeline</Link>
            <Link href="/problem-statements" className="w-fit text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Problem statements</Link>
          </div>
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">Event details</p>
          <p className="mt-3 text-sm font-semibold text-foreground">{EVENT_IDENTITY.hostInstitution}</p>
          <p className="mt-1 text-xs text-muted-foreground">{EVENT_IDENTITY.finaleDates} · {EVENT_IDENTITY.durationHours} hours</p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-[11px] text-muted-foreground">
        © 2026 Code-e-Manipal
      </div>
    </footer>
  );
}
