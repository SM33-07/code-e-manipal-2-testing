"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Send, Loader2, Code2, Users, FileText, Link, Video,
  BookOpen, Lightbulb, AlertTriangle, GraduationCap,
  Map, Lock, Plus, X, ChevronDown, ChevronUp, Cpu,
  GitBranch, Layers, Zap,
} from "lucide-react";

// ─── Submission Interface ─────────────────────────────────────────────────────
export interface Submission {
  id: string;
  submittedAt: string;
  // 1. Project Overview
  projectName: string;
  tagline: string;
  problemSolved: string;
  solutionSummary: string;
  // 2. Technical Details
  techStack: string[];
  architectureOverview: string;
  technicalChallenges: string;
  // 3. External Links
  githubUrl: string;
  videoUrl: string;
  docsUrl: string;
  // 4. Reflection
  whatWorkedWell: string;
  challengesFaced: string;
  lessonsLearned: string;
  futureRoadmap: string;
  // 5. Team Info
  teamName: string;
  teamMembers: string[];
  category: string;
}

interface SubmissionFormProps {
  onSubmit: (submission: Omit<Submission, "id" | "submittedAt">) => Promise<void>;
}

// ─── Tech Stack Options ───────────────────────────────────────────────────────
const TECH_STACK_OPTIONS = [
  "React", "Vue", "Angular", "Next.js", "TypeScript", "Node.js",
  "Python", "Django", "FastAPI", "Flask", "PostgreSQL", "MySQL",
  "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "TensorFlow", "PyTorch", "Solidity", "Swift", "Kotlin", "Flutter",
  "GraphQL", "Rust", "Go", "Java", "C++",
];

const CATEGORIES = ["AI/ML", "Web Dev", "Mobile", "Blockchain", "IoT", "Cybersecurity", "Other"];

// ─── Word Counter ─────────────────────────────────────────────────────────────
function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  number, title, subtitle, icon, completed,
}: {
  number: number; title: string; subtitle: string; icon: React.ReactNode; completed?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        marginBottom: "22px",
        paddingBottom: "18px",
        borderBottom: "1px solid rgba(59,130,246,0.1)",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: completed
            ? "linear-gradient(135deg,#059669,#10b981)"
            : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: completed
            ? "0 0 14px rgba(16,185,129,0.35)"
            : "0 0 14px rgba(59,130,246,0.35)",
          transition: "all 0.4s ease",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "white",
          position: "relative",
        }}
      >
        {completed ? "✓" : number}
        <span
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "14px",
            border: completed
              ? "1px solid rgba(16,185,129,0.3)"
              : "1px solid rgba(59,130,246,0.2)",
            animation: "section-ring 3s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "rgba(148,163,184,0.4)", display: "flex" }}>{icon}</span>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#f0f4ff",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
        </div>
        <p style={{ fontSize: "0.76rem", color: "rgba(148,163,184,0.5)", margin: "3px 0 0", lineHeight: 1.4 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── Animated Text Field ──────────────────────────────────────────────────────
function Field({
  label, icon, id, name, type = "text", value, onChange, placeholder,
  required, multiline, rows, maxWords, hint,
}: {
  label: string; icon?: React.ReactNode; id: string; name: string; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string; required?: boolean; multiline?: boolean; rows?: number;
  maxWords?: number; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const words = maxWords ? wordCount(value) : 0;
  const overLimit = maxWords ? words > maxWords : false;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: icon ? "10px 14px 10px 38px" : "10px 14px",
    borderRadius: "10px",
    background: focused ? "rgba(15,23,42,0.85)" : "rgba(8,14,38,0.7)",
    border: overLimit
      ? "1px solid rgba(239,68,68,0.5)"
      : focused
      ? "1px solid rgba(59,130,246,0.6)"
      : "1px solid rgba(255,255,255,0.07)",
    color: "#e2e8f0",
    fontSize: "0.875rem",
    outline: "none",
    transition: "all 0.25s ease",
    boxShadow: focused
      ? "0 0 0 3px rgba(59,130,246,0.1), 0 0 20px rgba(59,130,246,0.06)"
      : "none",
    resize: multiline ? "vertical" : undefined,
    lineHeight: 1.6,
    fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          htmlFor={id}
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: focused ? "#93c5fd" : "rgba(148,163,184,0.75)",
            transition: "color 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {label}
          {required && <span style={{ color: "#f87171", fontSize: "0.68rem" }}>*</span>}
        </label>
        {maxWords && (
          <span
            style={{
              fontSize: "0.7rem",
              color: overLimit ? "#f87171" : words > maxWords * 0.85 ? "#fbbf24" : "rgba(148,163,184,0.4)",
              transition: "color 0.2s",
            }}
          >
            {words}/{maxWords} words
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "11px",
              top: multiline ? "12px" : "50%",
              transform: multiline ? "none" : "translateY(-50%)",
              color: focused ? "#60a5fa" : "rgba(148,163,184,0.35)",
              transition: "color 0.2s ease",
              pointerEvents: "none",
              display: "flex",
            }}
          >
            {icon}
          </span>
        )}
        {multiline ? (
          <textarea
            id={id} name={name} value={value} onChange={onChange}
            placeholder={placeholder} rows={rows || 4} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle}
          />
        ) : (
          <input
            id={id} name={name} type={type} value={value} onChange={onChange}
            placeholder={placeholder} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle}
          />
        )}
      </div>
      {hint && (
        <p style={{ fontSize: "0.71rem", color: "rgba(148,163,184,0.38)", margin: 0, lineHeight: 1.4 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ children, visible, delay = 0 }: { children: React.ReactNode; visible: boolean; delay?: number }) {
  return (
    <div
      style={{
        padding: "26px 28px",
        borderRadius: "16px",
        background: "rgba(8,14,38,0.65)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    tagline: "",
    problemSolved: "",
    solutionSummary: "",
    techStack: [] as string[],
    architectureOverview: "",
    technicalChallenges: "",
    githubUrl: "",
    videoUrl: "",
    docsUrl: "",
    whatWorkedWell: "",
    challengesFaced: "",
    lessonsLearned: "",
    futureRoadmap: "",
    teamName: "",
    teamMembers: [] as string[],
    category: "",
  });
  const [memberInput, setMemberInput] = useState("");
  const [lockedMembers, setLockedMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Mount animation
  useState(() => { setTimeout(() => setMounted(true), 50); });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const addMember = () => {
    const name = memberInput.trim();
    if (!name || formData.teamMembers.includes(name) || lockedMembers) return;
    setFormData((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, name] }));
    setMemberInput("");
  };

  const removeMember = (name: string) => {
    if (lockedMembers) return;
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m !== name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.projectName) { toast.error("Project Name is required"); return; }
    if (!formData.problemSolved) { toast.error("Problem Solved is required"); return; }
    if (!formData.solutionSummary) { toast.error("Solution Summary is required"); return; }
    if (wordCount(formData.solutionSummary) > 500) { toast.error("Solution Summary exceeds 500 words"); return; }
    if (formData.techStack.length === 0) { toast.error("Please select at least one tech stack item"); return; }
    if (!formData.architectureOverview) { toast.error("Architecture Overview is required"); return; }
    if (wordCount(formData.architectureOverview) > 300) { toast.error("Architecture Overview exceeds 300 words"); return; }
    if (!formData.githubUrl) { toast.error("GitHub/Code Repository link is required"); return; }
    if (!formData.videoUrl) { toast.error("Presentation/Demo Video link is required"); return; }
    if (!formData.teamName) { toast.error("Team Name is required"); return; }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        projectName: "", tagline: "", problemSolved: "", solutionSummary: "",
        techStack: [], architectureOverview: "", technicalChallenges: "",
        githubUrl: "", videoUrl: "", docsUrl: "",
        whatWorkedWell: "", challengesFaced: "", lessonsLearned: "", futureRoadmap: "",
        teamName: "", teamMembers: [], category: "",
      });
      setLockedMembers(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Section 1: Project Overview ── */}
      <Section visible={true} delay={0}>
        <SectionHeader
          number={1}
          title="Project Overview"
          subtitle="Project Name, Tagline, Problem Solved, and Solution Summary (Max 500 words)"
          icon={<Layers style={{ width: "14px", height: "14px" }} />}
          completed={!!(formData.projectName && formData.solutionSummary)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field
              label="Project Name" required
              icon={<Code2 style={{ width: "13px", height: "13px" }} />}
              id="projectName" name="projectName"
              value={formData.projectName} onChange={handleChange}
              placeholder="My Awesome Project"
            />
            <Field
              label="Tagline"
              icon={<Zap style={{ width: "13px", height: "13px" }} />}
              id="tagline" name="tagline"
              value={formData.tagline} onChange={handleChange}
              placeholder="One-line pitch of your project"
            />
          </div>
          <Field
            label="Problem Solved" required
            icon={<AlertTriangle style={{ width: "13px", height: "13px" }} />}
            id="problemSolved" name="problemSolved"
            value={formData.problemSolved} onChange={handleChange}
            placeholder="What specific problem does your project address?"
            multiline rows={3}
          />
          <Field
            label="Solution Summary" required
            icon={<FileText style={{ width: "13px", height: "13px" }} />}
            id="solutionSummary" name="solutionSummary"
            value={formData.solutionSummary} onChange={handleChange}
            placeholder="Describe your solution — how it works, what makes it unique, and the impact it creates..."
            multiline rows={5}
            maxWords={500}
          />
          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "rgba(148,163,184,0.75)" }}>
              Category
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {CATEGORIES.map((cat) => {
                const active = formData.category === cat;
                return (
                  <button
                    key={cat} type="button"
                    onClick={() => setFormData((p) => ({ ...p, category: active ? "" : cat }))}
                    style={{
                      padding: "5px 13px", borderRadius: "999px", fontSize: "0.78rem",
                      fontWeight: active ? 600 : 400,
                      background: active ? "rgba(29,78,216,0.28)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      color: active ? "#93c5fd" : "rgba(148,163,184,0.55)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: active ? "0 0 10px rgba(59,130,246,0.2)" : "none",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Technical Details ── */}
      <Section visible={true} delay={60}>
        <SectionHeader
          number={2}
          title="Technical Details"
          subtitle="Tech Stack Used (selection list), Architecture Overview (Max 300 words), Unique Technical Challenges Solved"
          icon={<Cpu style={{ width: "14px", height: "14px" }} />}
          completed={formData.techStack.length > 0 && !!formData.architectureOverview}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Tech Stack multi-select */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "rgba(148,163,184,0.75)", display: "flex", alignItems: "center", gap: "5px" }}>
              <GitBranch style={{ width: "12px", height: "12px" }} />
              Tech Stack Used
              <span style={{ color: "#f87171", fontSize: "0.68rem" }}>*</span>
              <span style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.35)", fontWeight: 400 }}>
                — {formData.techStack.length} selected
              </span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {TECH_STACK_OPTIONS.map((tech) => {
                const selected = formData.techStack.includes(tech);
                return (
                  <button
                    key={tech} type="button" onClick={() => toggleTech(tech)}
                    style={{
                      padding: "4px 11px", borderRadius: "7px", fontSize: "0.76rem",
                      fontWeight: selected ? 600 : 400,
                      background: selected ? "rgba(29,78,216,0.25)" : "rgba(255,255,255,0.03)",
                      border: selected ? "1px solid rgba(59,130,246,0.45)" : "1px solid rgba(255,255,255,0.06)",
                      color: selected ? "#93c5fd" : "rgba(148,163,184,0.5)",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      transform: selected ? "scale(1.02)" : "scale(1)",
                      boxShadow: selected ? "0 0 8px rgba(59,130,246,0.15)" : "none",
                    }}
                  >
                    {selected && <span style={{ marginRight: "4px" }}>✓</span>}
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>
          <Field
            label="Architecture Overview" required
            icon={<Layers style={{ width: "13px", height: "13px" }} />}
            id="architectureOverview" name="architectureOverview"
            value={formData.architectureOverview} onChange={handleChange}
            placeholder="Describe your system architecture — components, data flow, key design decisions..."
            multiline rows={4}
            maxWords={300}
          />
          <Field
            label="Unique Technical Challenges Solved"
            icon={<Lightbulb style={{ width: "13px", height: "13px" }} />}
            id="technicalChallenges" name="technicalChallenges"
            value={formData.technicalChallenges} onChange={handleChange}
            placeholder="What were the hardest technical problems you overcame?"
            multiline rows={3}
          />
        </div>
      </Section>

      {/* ── Section 3: External Links ── */}
      <Section visible={true} delay={120}>
        <SectionHeader
          number={3}
          title="External Links"
          subtitle="Public GitHub/Code Repository (required), Presentation/Demo Video (required), Documentation/Slides (optional)"
          icon={<Link style={{ width: "14px", height: "14px" }} />}
          completed={!!(formData.githubUrl && formData.videoUrl)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field
            label="Public GitHub / Code Repository" required
            icon={<GitBranch style={{ width: "13px", height: "13px" }} />}
            id="githubUrl" name="githubUrl" type="url"
            value={formData.githubUrl} onChange={handleChange}
            placeholder="https://github.com/username/repo"
            hint="Required for validation — must be a public repository"
          />
          <Field
            label="Presentation / Demo Video" required
            icon={<Video style={{ width: "13px", height: "13px" }} />}
            id="videoUrl" name="videoUrl" type="url"
            value={formData.videoUrl} onChange={handleChange}
            placeholder="https://youtube.com/watch?v=... or similar"
            hint="Required — link to your demo video or presentation recording"
          />
          <Field
            label="Documentation / Slides"
            icon={<BookOpen style={{ width: "13px", height: "13px" }} />}
            id="docsUrl" name="docsUrl" type="url"
            value={formData.docsUrl} onChange={handleChange}
            placeholder="https://docs.google.com/... or similar"
            hint="Optional — technical documentation, slides, or Notion page"
          />
        </div>
      </Section>

      {/* ── Section 4: Reflection ── */}
      <Section visible={true} delay={180}>
        <SectionHeader
          number={4}
          title="Reflection"
          subtitle="What Worked Well, What Failed/Challenges Encountered, Lessons Learned, Future Roadmap/Next Steps"
          icon={<GraduationCap style={{ width: "14px", height: "14px" }} />}
          completed={!!(formData.whatWorkedWell && formData.lessonsLearned)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field
              label="What Worked Well?"
              icon={<Lightbulb style={{ width: "13px", height: "13px" }} />}
              id="whatWorkedWell" name="whatWorkedWell"
              value={formData.whatWorkedWell} onChange={handleChange}
              placeholder="Highlight your team's biggest wins and successes..."
              multiline rows={4}
            />
            <Field
              label="What Failed / Challenges Encountered?"
              icon={<AlertTriangle style={{ width: "13px", height: "13px" }} />}
              id="challengesFaced" name="challengesFaced"
              value={formData.challengesFaced} onChange={handleChange}
              placeholder="Be honest about what didn't go as planned..."
              multiline rows={4}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field
              label="Lessons Learned"
              icon={<GraduationCap style={{ width: "13px", height: "13px" }} />}
              id="lessonsLearned" name="lessonsLearned"
              value={formData.lessonsLearned} onChange={handleChange}
              placeholder="Key takeaways your team gained from this experience..."
              multiline rows={4}
            />
            <Field
              label="Future Roadmap / Next Steps"
              icon={<Map style={{ width: "13px", height: "13px" }} />}
              id="futureRoadmap" name="futureRoadmap"
              value={formData.futureRoadmap} onChange={handleChange}
              placeholder="Where would you take this project next?"
              multiline rows={4}
            />
          </div>
        </div>
      </Section>

      {/* ── Section 5: Team Info ── */}
      <Section visible={true} delay={240}>
        <SectionHeader
          number={5}
          title="Team Info"
          subtitle="Display of locked team members (read-only after locking)"
          icon={<Users style={{ width: "14px", height: "14px" }} />}
          completed={!!formData.teamName && formData.teamMembers.length > 0 && lockedMembers}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field
            label="Team Name" required
            icon={<Users style={{ width: "13px", height: "13px" }} />}
            id="teamName" name="teamName"
            value={formData.teamName} onChange={handleChange}
            placeholder="Team Innovators"
          />
          {/* Team members input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "0.8rem", fontWeight: 500, color: "rgba(148,163,184,0.75)",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <Users style={{ width: "12px", height: "12px" }} />
              Team Members
              {lockedMembers && (
                <span style={{
                  display: "flex", alignItems: "center", gap: "3px",
                  fontSize: "0.68rem", color: "#fbbf24",
                  padding: "1px 7px", borderRadius: "999px",
                  background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                }}>
                  <Lock style={{ width: "9px", height: "9px" }} />
                  Locked
                </span>
              )}
            </label>

            {/* Add member input */}
            {!lockedMembers && (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMember(); } }}
                  placeholder="Enter team member name, press Enter"
                  style={{
                    flex: 1, padding: "9px 14px", borderRadius: "10px",
                    background: "rgba(8,14,38,0.7)", border: "1px solid rgba(255,255,255,0.07)",
                    color: "#e2e8f0", fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  type="button" onClick={addMember}
                  style={{
                    padding: "9px 14px", borderRadius: "10px",
                    background: "rgba(29,78,216,0.25)", border: "1px solid rgba(59,130,246,0.35)",
                    color: "#93c5fd", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                    fontSize: "0.8rem", fontWeight: 500, transition: "all 0.2s ease",
                  }}
                >
                  <Plus style={{ width: "13px", height: "13px" }} />
                  Add
                </button>
              </div>
            )}

            {/* Members display */}
            {formData.teamMembers.length > 0 && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: lockedMembers ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)",
                  border: lockedMembers ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: lockedMembers ? "12px" : "0" }}>
                  {formData.teamMembers.map((member, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "5px 12px", borderRadius: "999px",
                        background: lockedMembers ? "rgba(245,158,11,0.1)" : "rgba(29,78,216,0.15)",
                        border: lockedMembers ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(59,130,246,0.25)",
                        fontSize: "0.8rem",
                        color: lockedMembers ? "#fcd34d" : "#93c5fd",
                        fontWeight: 500,
                        animation: "fade-in-badge 0.3s ease forwards",
                      }}
                    >
                      {lockedMembers && <Lock style={{ width: "10px", height: "10px", opacity: 0.7 }} />}
                      <span>👤</span>
                      {member}
                      {!lockedMembers && (
                        <button
                          type="button" onClick={() => removeMember(member)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(148,163,184,0.5)", padding: "0", display: "flex",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#f87171")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.5)")}
                        >
                          <X style={{ width: "11px", height: "11px" }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {lockedMembers && (
                  <p style={{ fontSize: "0.71rem", color: "rgba(245,158,11,0.5)", margin: 0 }}>
                    Team roster is locked and will be submitted as read-only.
                  </p>
                )}
              </div>
            )}

            {/* Lock / Unlock button */}
            {formData.teamMembers.length > 0 && (
              <button
                type="button"
                onClick={() => setLockedMembers((v) => !v)}
                style={{
                  alignSelf: "flex-start",
                  padding: "6px 14px", borderRadius: "8px", fontSize: "0.78rem",
                  fontWeight: 500,
                  background: lockedMembers ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                  border: lockedMembers ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(245,158,11,0.25)",
                  color: lockedMembers ? "#fca5a5" : "#fcd34d",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "5px",
                  transition: "all 0.2s ease",
                }}
              >
                <Lock style={{ width: "11px", height: "11px" }} />
                {lockedMembers ? "Unlock Team Roster" : "Lock Team Roster"}
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* ── Submit Button ── */}
      <div
        style={{
          opacity: 1,
          transform: "translateY(0)",
          transition: "opacity 0.5s ease 300ms, transform 0.5s ease 300ms",
        }}
      >
        <button
          type="submit"
          disabled={isSubmitting}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            width: "100%", padding: "16px 24px", borderRadius: "14px", border: "none",
            background: submitted
              ? "linear-gradient(135deg,#059669,#10b981)"
              : isSubmitting
              ? "linear-gradient(135deg,#1e3a8a,#1d4ed8)"
              : btnHovered
              ? "linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa)"
              : "linear-gradient(135deg,#1d4ed8,#2563eb)",
            color: "#ffffff",
            fontSize: "1rem", fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
            transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
            transform: btnHovered && !isSubmitting ? "translateY(-3px)" : "translateY(0)",
            boxShadow: submitted
              ? "0 6px 24px rgba(16,185,129,0.45)"
              : btnHovered
              ? "0 12px 40px rgba(37,99,235,0.55), 0 0 0 1px rgba(96,165,250,0.2)"
              : "0 6px 24px rgba(37,99,235,0.35)",
            letterSpacing: "0.02em",
            position: "relative", overflow: "hidden",
          }}
        >
          {btnHovered && !isSubmitting && (
            <span style={{
              position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
              animation: "shimmer-btn 0.75s ease forwards", pointerEvents: "none",
            }} />
          )}
          {isSubmitting ? (
            <><Loader2 style={{ width: "17px", height: "17px", animation: "spin 1s linear infinite" }} />Submitting all 5 sections...</>
          ) : submitted ? (
            <>✓ Successfully Submitted!</>
          ) : (
            <><Send style={{ width: "16px", height: "16px" }} />Submit Write-Up</>
          )}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.73rem", color: "rgba(148,163,184,0.35)", marginTop: "10px" }}>
          All 5 sections will be saved · Submissions are visible to all participants
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer-btn { from { left: -60%; } to { left: 150%; } }
        @keyframes section-ring { 0%,100%{ opacity:0.4; transform:scale(1); } 50%{ opacity:0.8; transform:scale(1.05); } }
        @keyframes fade-in-badge { from{ opacity:0; transform:scale(0.85); } to{ opacity:1; transform:scale(1); } }
        input::placeholder, textarea::placeholder { color: rgba(148,163,184,0.3) !important; }
        select option { background: #0f172a; color: #e2e8f0; }
        textarea { font-family: inherit !important; }
      `}</style>
    </form>
  );
}
