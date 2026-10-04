"use client";

import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  badge?: string;
  className?: string;
}

export function BrandLogo({
  href = "/",
  size = "md",
  subtitle,
  badge,
  className = "",
}: BrandLogoProps) {
  const iconDimensions = {
    sm: { box: "w-8 h-8", img: 26 },
    md: { box: "w-9 h-9", img: 30 },
    lg: { box: "w-11 h-11", img: 38 },
  }[size];

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Brand Emblem Container (crisp contrast across light & dark themes) */}
      <div
        className={`${iconDimensions.box} rounded-lg bg-[#FFFDF9] dark:bg-[#FAF7F2] border border-border shadow-xs p-1 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        <Image
          src="/logo.png"
          alt="Code-e-Manipal 2.0"
          width={iconDimensions.img}
          height={iconDimensions.img}
          className="object-contain w-full h-full"
          priority
        />
      </div>

      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-foreground font-sans ${titleSizes}`}>
            Code-e-Manipal
          </span>
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            2.0
          </span>
          {badge && (
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] text-muted-foreground tracking-wide truncate max-w-[220px]">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="group inline-flex items-center no-underline focus:outline-none">
      {content}
    </Link>
  );
}
