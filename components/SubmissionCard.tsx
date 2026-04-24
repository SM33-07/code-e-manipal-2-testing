"use client";

import { useEffect, useRef, useState } from "react";
import { Submission } from "./SubmissionForm";
import {
  Github, Video, BookOpen, Tag, Users, Calendar,
  ChevronDown, ChevronUp, Lock, Cpu, Lightbulb,
  AlertTriangle, GraduationCap, Map, ExternalLink,
} from "lucide-react";

interface SubmissionCardProps {
  submission: Submission;
  index?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  "AI/ML":          { bg: "rgba(139,92,246,0.15)",  text: "#c4b5fd", glow: "rgba(139,92,246,0.4)" },
  "Mobile":         { bg: "rgba(16,185,129,0.15)",  text: "#6ee7b7", glow: "rgba(16,185,129,0.4)" },
  "Blockchain":     { bg: "rgba(245,158,11,0.15)",  text: "#fcd34d", glow: "rgba(245,158,11,0.4)" },
  "Web Dev":        { bg: "rgba(59,130,246,0.15)",  text: "#93c5fd", glow: "rgba(59,130,246,0.4)" },
  "Cybersecurity":  { bg: "rgba(239,68,68,0.15)",   text: "#fca5a5", glow: "rgba(239,68,68,0.4)"  },
  "IoT":            { bg: "rgba(20,184,166,0.15)",  text: "#5eead4", glow: "rgba(20,184,166,0.4)" },
  "Other":          { bg: "rgba(100,116,139,0.15)", text: "#cbd5e1", glow: "rgba(100,116,139,0.4)"},
  "default":        { bg: "rgba(59,130,246,0.15)",  text: "#93c5fd", glow: "rgba(59,130,246,0.4)" },
};

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
      <span style={{ color: "rgba(96,165,250,0.5)", marginTop: "1px", flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(148,163,184,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
          {label}
        </div>
        <p style={{ fontSize: "0.8rem", color: "rgba(203,213,225,0.7)", lineHeight: 1.6, margin: 0 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function SubmissionCard({ submission, index = 0 }: SubmissionCardProps) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const catStyle = CATEGORY_COLORS[submission.category] || CATEGORY_COLORS["default"];

  // Staggered entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 75);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    const el = cardRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const formattedDate = new Date(submission.submittedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  // Determine which external links exist
  const hasGithub = !!submission.githubUrl;
  const hasVideo  = !!submission.videoUrl;
  const hasDocs   = !!submission.docsUrl;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.96)",
        transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
        position: "relative",
        borderRadius: "16px",
        background: hovered
          ? "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(17,24,57,0.97) 100%)"
          : "linear-gradient(135deg, rgba(10,15,35,0.92) 0%, rgba(12,18,45,0.92) 100%)",
        border: hovered
          ? "1px solid rgba(59,130,246,0.4)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: hovered
          ? "0 10px 44px rgba(29,78,216,0.22), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)",
        backdropFilter: "blur(14px)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Spotlight */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59,130,246,0.07), transparent 65%)`,
        }} />
      )}

      {/* Top edge shimmer */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: hovered
          ? "linear-gradient(90deg, transparent, rgba(59,130,246,0.7), rgba(96,165,250,0.5), transparent)"
          : "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
        transition: "all 0.35s ease",
      }} />

      {/* Left accent bar */}
      <div style={{
        position: "absolute", top: "15%", left: 0, width: "3px",
        height: hovered ? "70%" : "0%",
        background: `linear-gradient(180deg, transparent, ${catStyle.glow.replace("0.4","0.9")}, transparent)`,
        borderRadius: "0 2px 2px 0",
        transition: "height 0.45s cubic-bezier(0.22,1,0.36,1)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── Card Header ── */}
        <div style={{ padding: "20px 20px 16px" }}>
          {/* Project name + team */}
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{
              fontSize: "1.05rem", fontWeight: 700,
              color: hovered ? "#ffffff" : "#f0f4ff",
              marginBottom: "2px", lineHeight: 1.3,
              transition: "color 0.2s",
            }}>
              {submission.projectName}
            </h3>
            {submission.tagline && (
              <p style={{ fontSize: "0.78rem", color: "rgba(96,165,250,0.7)", margin: "0 0 4px", fontStyle: "italic" }}>
                "{submission.tagline}"
              </p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Users style={{ width: "11px", height: "11px", color: "#60a5fa" }} />
              <span style={{ fontSize: "0.76rem", color: "rgba(148,163,184,0.7)" }}>
                {submission.teamName}
              </span>
              {submission.teamMembers?.length > 0 && (
                <>
                  <span style={{ color: "rgba(148,163,184,0.25)", fontSize: "0.7rem" }}>·</span>
                  <Lock style={{ width: "9px", height: "9px", color: "rgba(245,158,11,0.5)" }} />
                  <span style={{ fontSize: "0.7rem", color: "rgba(245,158,11,0.5)" }}>
                    {submission.teamMembers.length} member{submission.teamMembers.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Category + Tech stack badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {submission.category && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "3px 9px", borderRadius: "999px", fontSize: "0.69rem", fontWeight: 600,
                background: catStyle.bg,
                border: `1px solid ${catStyle.glow.replace("0.4","0.25")}`,
                color: catStyle.text,
                transition: "box-shadow 0.3s",
                ...(hovered ? { boxShadow: `0 0 10px ${catStyle.glow}` } : {}),
              }}>
                <Tag style={{ width: "9px", height: "9px" }} />
                {submission.category}
              </span>
            )}
            {/* Show first 3 tech stack items */}
            {(submission.techStack || []).slice(0, 3).map((tech) => (
              <span key={tech} style={{
                padding: "2px 8px", borderRadius: "6px", fontSize: "0.67rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(148,163,184,0.6)",
              }}>
                {tech}
              </span>
            ))}
            {(submission.techStack || []).length > 3 && (
              <span style={{
                padding: "2px 8px", borderRadius: "6px", fontSize: "0.67rem",
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
                color: "rgba(96,165,250,0.6)",
              }}>
                +{submission.techStack.length - 3}
              </span>
            )}
          </div>

          {/* Solution summary (truncated) */}
          <p style={{
            fontSize: "0.825rem", color: "rgba(203,213,225,0.68)", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {submission.solutionSummary || submission.problemSolved}
          </p>
        </div>

        {/* ── External Links Row ── */}
        {(hasGithub || hasVideo || hasDocs) && (
          <div style={{
            padding: "10px 20px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex", gap: "8px", flexWrap: "wrap",
          }}>
            {hasGithub && (
              <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem",
                  color: "#60a5fa", textDecoration: "none",
                  padding: "4px 10px", borderRadius: "7px",
                  background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.18)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.08)"; }}
              >
                <Github style={{ width: "11px", height: "11px" }} /> GitHub
              </a>
            )}
            {hasVideo && (
              <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem",
                  color: "#f87171", textDecoration: "none",
                  padding: "4px 10px", borderRadius: "7px",
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
              >
                <Video style={{ width: "11px", height: "11px" }} /> Demo
              </a>
            )}
            {hasDocs && (
              <a href={submission.docsUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem",
                  color: "#a78bfa", textDecoration: "none",
                  padding: "4px 10px", borderRadius: "7px",
                  background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.18)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              >
                <BookOpen style={{ width: "11px", height: "11px" }} /> Docs
              </a>
            )}
          </div>
        )}

        {/* ── Expand / Collapse ── */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: "100%", padding: "10px 20px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: expanded ? "rgba(29,78,216,0.06)" : "transparent",
            border: "none", borderRadius: "0 0 0 0",
            color: expanded ? "#60a5fa" : "rgba(148,163,184,0.45)",
            fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#60a5fa"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = expanded ? "#60a5fa" : "rgba(148,163,184,0.45)"; }}
        >
          {expanded ? (
            <><ChevronUp style={{ width: "12px", height: "12px" }} /> Hide Details</>
          ) : (
            <><ChevronDown style={{ width: "12px", height: "12px" }} /> View Full Write-Up</>
          )}
        </button>

        {/* ── Expanded Details ── */}
        {expanded && (
          <div style={{
            padding: "18px 20px 20px",
            borderTop: "1px solid rgba(59,130,246,0.1)",
            display: "flex", flexDirection: "column", gap: "16px",
            animation: "expand-in 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
          }}>
            {/* Section 2: Technical */}
            {(submission.architectureOverview || submission.technicalChallenges) && (
              <div>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700, color: "rgba(96,165,250,0.5)",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px",
                }}>
                  <Cpu style={{ width: "10px", height: "10px" }} /> Technical Details
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <DetailRow
                    icon={<ExternalLink style={{ width: "12px", height: "12px" }} />}
                    label="Architecture Overview"
                    value={submission.architectureOverview}
                  />
                  <DetailRow
                    icon={<Lightbulb style={{ width: "12px", height: "12px" }} />}
                    label="Technical Challenges"
                    value={submission.technicalChallenges}
                  />
                </div>
                {/* Full tech stack */}
                {(submission.techStack || []).length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(148,163,184,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Full Stack
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {submission.techStack.map((tech) => (
                        <span key={tech} style={{
                          padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem",
                          background: "rgba(29,78,216,0.15)", border: "1px solid rgba(59,130,246,0.2)",
                          color: "#93c5fd",
                        }}>{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Reflection */}
            {(submission.whatWorkedWell || submission.challengesFaced || submission.lessonsLearned || submission.futureRoadmap) && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px" }}>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700, color: "rgba(96,165,250,0.5)",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px",
                }}>
                  <GraduationCap style={{ width: "10px", height: "10px" }} /> Reflection
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <DetailRow icon={<Lightbulb style={{ width: "12px", height: "12px" }} />} label="What Worked Well" value={submission.whatWorkedWell} />
                  <DetailRow icon={<AlertTriangle style={{ width: "12px", height: "12px" }} />} label="Challenges Faced" value={submission.challengesFaced} />
                  <DetailRow icon={<GraduationCap style={{ width: "12px", height: "12px" }} />} label="Lessons Learned" value={submission.lessonsLearned} />
                  <DetailRow icon={<Map style={{ width: "12px", height: "12px" }} />} label="Future Roadmap" value={submission.futureRoadmap} />
                </div>
              </div>
            )}

            {/* Section 5: Team Members */}
            {(submission.teamMembers || []).length > 0 && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px" }}>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700, color: "rgba(96,165,250,0.5)",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px",
                }}>
                  <Lock style={{ width: "10px", height: "10px" }} /> Team Roster (Locked)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {submission.teamMembers.map((m, i) => (
                    <span key={i} style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem",
                      background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                      color: "#fcd34d",
                    }}>
                      <Lock style={{ width: "9px", height: "9px", opacity: 0.6 }} />
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: "10px 20px",
          borderTop: "1px solid rgba(255,255,255,0.03)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar style={{ width: "10px", height: "10px", color: "rgba(148,163,184,0.35)" }} />
            <span style={{ fontSize: "0.68rem", color: "rgba(148,163,184,0.35)" }}>{formattedDate}</span>
          </div>
          {/* Completion dots */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {[
              !!(submission.projectName && submission.solutionSummary),
              !!(submission.techStack?.length && submission.architectureOverview),
              !!(submission.githubUrl && submission.videoUrl),
              !!(submission.whatWorkedWell || submission.lessonsLearned),
              !!(submission.teamName),
            ].map((done, i) => (
              <div
                key={i}
                title={`Section ${i + 1}`}
                style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: done ? "#3b82f6" : "rgba(255,255,255,0.1)",
                  boxShadow: done ? "0 0 4px rgba(59,130,246,0.5)" : "none",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes expand-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
