import Image from "next/image";
import { ExternalLink } from "lucide-react";

// ─── Partner Data Model ───────────────────────────────────────────────────────
export interface Partner {
  /** Display name — also used as fallback alt text */
  name: string;
  /** Absolute path from /public or remote URL */
  logo: string;
  /** Optional external website URL */
  website?: string;
  /** Accessible link label */
  ariaLabel?: string;
  /** Short descriptor shown below the logo */
  descriptor?: string;
  /** True → render logo on a light neutral tile so white-bg logos read on dark mode */
  requiresLightTile?: boolean;
  /** True → this partner gets the featured hero treatment */
  featured?: boolean;
  /** Override tile background (CSS color or var) */
  tileBg?: string;
}

// ─── Official Partner List — single source of truth ─────────────────────────
export const OFFICIAL_PARTNERS: Partner[] = [
  {
    name: "The Hosteller",
    logo: "/images/partners/the-hosteller.png",
    website: "https://www.thehosteller.com/",
    ariaLabel: "Visit The Hosteller",
    descriptor: "Official Stay Partner",
    featured: true,
    tileBg: "#F7E731",
  },
  {
    name: "Unstop",
    logo: "/images/partners/unstop.png",
    website: "https://unstop.com/",
    ariaLabel: "Visit Unstop",
    descriptor: "Official Registration Platform",
    requiresLightTile: true,
  },
  {
    name: "E-Cell MUJ",
    logo: "/images/partners/ecell.png",
    descriptor: "Entrepreneurship Cell · MUJ",
    requiresLightTile: true,
  },
  {
    name: "VickyBytes",
    logo: "/images/partners/vickybytes.png",
    descriptor: "Official Tech Partner",
    requiresLightTile: true,
  },
  {
    name: "HackerRank",
    logo: "/images/partners/hackerrank.png",
    website: "https://www.hackerrank.com/",
    ariaLabel: "Visit HackerRank",
    descriptor: "Official Coding Partner",
    requiresLightTile: true,
  },
];

// ─── Logo Tile (supporting partners) ─────────────────────────────────────────
function LogoTile({ partner }: { partner: Partner }) {
  const tileClass = partner.requiresLightTile
    ? "flex items-center justify-center rounded-xl p-4 bg-[#F8F5F0] dark:bg-[#EFECE6]"
    : "flex items-center justify-center rounded-xl p-4";
  const tileStyle = partner.tileBg ? { backgroundColor: partner.tileBg } : undefined;

  return (
    <div className={tileClass} style={tileStyle}>
      <Image
        src={partner.logo}
        alt={partner.name}
        width={180}
        height={72}
        className="h-10 w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

// ─── Featured Tile (The Hosteller) ───────────────────────────────────────────
function FeaturedTile({ partner }: { partner: Partner }) {
  return (
    <div
      className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8"
      style={{ backgroundColor: partner.tileBg ?? "var(--card)" }}
    >
      <div className="flex items-center justify-center sm:justify-start">
        <Image
          src={partner.logo}
          alt={partner.name}
          width={360}
          height={120}
          className="h-16 sm:h-20 w-auto object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-1 text-center sm:items-end sm:text-right">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/55">
          Featured Partner
        </span>
        {partner.descriptor && (
          <span className="text-xs font-semibold text-black/80">{partner.descriptor}</span>
        )}
        {partner.website && (
          <span className="mt-1 inline-flex items-center justify-center sm:justify-end gap-1 text-[11px] font-bold text-black/55 group-hover:text-black/75 transition-colors">
            <ExternalLink size={11} aria-hidden="true" />
            thehosteller.com
          </span>
        )}
      </div>
    </div>
  );
}

// ─── SponsorPartners ─────────────────────────────────────────────────────────
export function SponsorPartners({
  partners = OFFICIAL_PARTNERS,
  className = "",
}: {
  partners?: Partner[];
  className?: string;
}) {
  const featured = partners.find((p) => p.featured);
  const supporting = partners.filter((p) => !p.featured);

  return (
    <section
      aria-labelledby="partners-heading"
      className={`rounded-3xl border border-border bg-surface-elevated p-6 shadow-sm sm:p-9 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            Partners &amp; Sponsors
          </p>
          <h2
            id="partners-heading"
            className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
          >
            Organized with purpose.
          </h2>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          Verified organizations and platforms backing Code‑e‑Manipal 2.0.
        </p>
      </div>

      {/* Featured partner */}
      {featured && (
        <div className="mt-7">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Featured Partner
          </p>
          {featured.website ? (
            <a
              href={featured.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={featured.ariaLabel ?? `Visit ${featured.name}`}
              className="group block overflow-hidden rounded-2xl border border-border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FeaturedTile partner={featured} />
            </a>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <FeaturedTile partner={featured} />
            </div>
          )}
        </div>
      )}

      {/* Supporting partners */}
      {supporting.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Supporting Partners
          </p>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {supporting.map((partner) => {
              const tileClass =
                "group block bg-card p-5 transition-[background-color] duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
              const content = (
                <div className="flex flex-col gap-3">
                  <LogoTile partner={partner} />
                  <div>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {partner.name}
                    </p>
                    {partner.descriptor && (
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {partner.descriptor}
                      </p>
                    )}
                  </div>
                  {partner.website && (
                    <ExternalLink
                      size={13}
                      className="text-muted-foreground/50 group-hover:text-secondary transition-colors"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );

              return partner.website ? (
                <a
                  key={partner.name}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={tileClass}
                  aria-label={partner.ariaLabel ?? `Visit ${partner.name}`}
                >
                  {content}
                </a>
              ) : (
                <div key={partner.name} className={tileClass}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
