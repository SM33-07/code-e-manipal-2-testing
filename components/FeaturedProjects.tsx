"use client";

import { projects } from "@/data/projects";
import { Trophy, ArrowRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function FeaturedProjects() {
  const router = useRouter();

  const p1 = projects.find((p) => p.placement === "1st");
  const p2 = projects.find((p) => p.placement === "2nd");
  const p3 = projects.find((p) => p.placement === "3rd");

  const orderedWinners = [
    { p: p2, place: "2nd", medal: "🥈 2nd Place", badge: "Runner Up" },
    { p: p1, place: "1st", medal: "🥇 1st Place", badge: "Grand Winner", featured: true },
    { p: p3, place: "3rd", medal: "🥉 3rd Place", badge: "Finalist" },
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
            <Trophy className="w-3.5 h-3.5 text-secondary" />
            Hackathon Showcase
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight m-0">
            Featured Award Winners
          </h2>

          <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2 mb-0 leading-relaxed">
            The highest scoring technical innovations selected by our evaluation jury at Code-e-Manipal 2.0.
          </p>
        </div>

        {/* 3-Column Podium Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {orderedWinners.map(({ p, place, medal, badge, featured }) => {
            if (!p) return null;

            return (
              <div
                key={p.id}
                onClick={() => router.push(`/project/${p.id}`)}
                className={`cursor-pointer rounded-2xl border bg-card shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  featured
                    ? "border-primary/50 ring-1 ring-primary/20 md:-translate-y-2"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/10">
                    <Image
                      src={p.videoThumbnail}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 380px"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-background/90 text-foreground backdrop-blur-sm border border-border shadow-sm flex items-center gap-1.5">
                      {medal}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                      {badge}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                      {p.teamName}
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-snug mb-2 m-0 line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed m-0">
                      {p.shortIdea}
                    </p>

                    {/* Tech Stack pills */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Explore Project Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
