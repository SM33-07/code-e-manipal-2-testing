"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
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
  projectName: string;
  tagline: string;
  problemSolved: string;
  solutionSummary: string;
  techStack: string[];
  architectureOverview: string;
  technicalChallenges: string;
  githubUrl: string;
  videoUrl: string;
  docsUrl: string;
  whatWorkedWell: string;
  challengesFaced: string;
  lessonsLearned: string;
  futureRoadmap: string;
  teamName: string;
  teamMembers: string[];
  category: string;
}

interface SubmissionFormProps {
  onSubmit: (submission: Omit<Submission, "id" | "submittedAt">) => Promise<void>;
  disabled?: boolean;
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        marginBottom: "12px",
        paddingBottom: "18px",
        borderBottom: isDark ? "1px solid rgba(201,162,39,0.15)" : "1px solid rgba(173,114,55,0.15)",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: completed
            ? "linear-gradient(135deg,#059669,#10b981)"
            : isDark
            ? "linear-gradient(135deg,#D4732A,#C9A227)"
            : "linear-gradient(135deg,#8F102A,#A61B36)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: completed
            ? "0 0 14px rgba(16,185,129,0.25)"
            : isDark
            ? "0 0 14px rgba(212,115,42,0.25)"
            : "0 0 14px rgba(143,16,42,0.25)",
          transition: "all 0.4s ease",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: isDark && !completed ? "#0F0A05" : "white",
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
              : isDark
              ? "1px solid rgba(212,115,42,0.25)"
              : "1px solid rgba(143,16,42,0.2)",
            animation: "section-ring 3s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: isDark ? "rgba(201,162,39,0.6)" : "rgba(143,16,42,0.6)", display: "flex" }}>{icon}</span>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: isDark ? "#F5EFE0" : "#6A4635",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
        </div>
        <p style={{ fontSize: "0.76rem", color: isDark ? "rgba(191,168,152,0.7)" : "rgba(122,90,74,0.65)", margin: "3px 0 0", lineHeight: 1.4 }}>
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
  const { resolvedTheme } = useTheme();
  const [focused, setFocused] = useState(false);
  const words = maxWords ? wordCount(value) : 0;
  const overLimit = maxWords ? words > maxWords : false;
  const isDark = resolvedTheme === "dark";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: icon ? "10px 14px 10px 38px" : "10px 14px",
    borderRadius: "10px",
    background: isDark
      ? (focused ? "#0F0A05" : "#1E1208")
      : (focused ? "rgba(255,244,232,0.97)" : "rgba(255,252,247,0.82)"),
    border: overLimit
      ? "1px solid rgba(239,68,68,0.5)"
      : focused
      ? (isDark ? "1px solid #D4732A" : "1px solid rgba(143,16,42,0.5)")
      : (isDark ? "1px solid rgba(201,162,39,0.2)" : "1px solid rgba(173,114,55,0.2)"),
    color: isDark ? "#F5EFE0" : "#6A4635",
    fontSize: "0.875rem",
    outline: "none",
    transition: "all 0.25s ease",
    boxShadow: focused
      ? (isDark ? "0 0 0 3px rgba(212,115,42,0.15), 0 0 20px rgba(212,115,42,0.05)" : "0 0 0 3px rgba(143,16,42,0.08), 0 0 20px rgba(143,16,42,0.05)")
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
            color: focused
              ? (isDark ? "#F0C060" : "#8F102A")
              : (isDark ? "#A08070" : "#8A6A5A"),
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
              color: overLimit
                ? "#EF4444"
                : words > maxWords * 0.85
                ? "#F59E0B"
                : (isDark ? "rgba(160,128,112,0.6)" : "rgba(138,106,90,0.5)"),
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
              color: focused
                ? (isDark ? "#F0C060" : "#8F102A")
                : (isDark ? "rgba(201,162,39,0.4)" : "rgba(173,114,55,0.45)"),
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
        <p style={{ fontSize: "0.71rem", color: isDark ? "rgba(160,128,112,0.7)" : "rgba(138,106,90,0.6)", margin: 0, lineHeight: 1.4 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ children, visible, delay = 0 }: { children: React.ReactNode; visible: boolean; delay?: number }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      style={{
        padding: "26px 28px",
        borderRadius: "16px",
        background: isDark ? "rgba(30,18,8,0.82)" : "rgba(255,248,239,0.82)",
        border: isDark ? "1px solid rgba(201,162,39,0.25)" : "1px solid rgba(173,114,55,0.15)",
        backdropFilter: "blur(10px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)"
          : "0 4px 24px rgba(143,114,55,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export function SubmissionForm({ onSubmit, disabled = false }: SubmissionFormProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!formData.tagline) { toast.error("Tagline is required"); return; }
    if (!formData.problemSolved) { toast.error("Problem Solved is required"); return; }
    if (!formData.solutionSummary) { toast.error("Solution Summary is required"); return; }
    if (wordCount(formData.solutionSummary) > 500) { toast.error("Solution Summary exceeds 500 words"); return; }
    if (!formData.category) { toast.error("Please select a Category"); return; }
    if (formData.techStack.length === 0) { toast.error("Please select at least one tech stack item"); return; }
    if (!formData.architectureOverview) { toast.error("Architecture Overview is required"); return; }
    if (wordCount(formData.architectureOverview) > 300) { toast.error("Architecture Overview exceeds 300 words"); return; }
    if (!formData.technicalChallenges) { toast.error("Unique Technical Challenges is required"); return; }
    if (!formData.githubUrl) { toast.error("GitHub/Code Repository link is required"); return; }
    if (!formData.videoUrl) { toast.error("Presentation/Demo Video link is required"); return; }
    if (!formData.docsUrl) { toast.error("Documentation/Slides link is required"); return; }
    if (!formData.whatWorkedWell) { toast.error("'What Worked Well' is required"); return; }
    if (!formData.challengesFaced) { toast.error("'What Failed / Challenges Encountered' is required"); return; }
    if (!formData.lessonsLearned) { toast.error("Lessons Learned is required"); return; }
    if (!formData.futureRoadmap) { toast.error("Future Roadmap / Next Steps is required"); return; }
    if (!formData.teamName) { toast.error("Team Name is required"); return; }
    if (formData.teamMembers.length === 0) { toast.error("Please add at least one team member"); return; }

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

  if (!mounted) return null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <fieldset disabled={disabled} style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>

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
              label="Tagline" required
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
            <label style={{ fontSize: "0.8rem", fontWeight: 500, color: isDark ? "#A08070" : "#8A6A5A", display: "flex", alignItems: "center", gap: "5px" }}>
              Category
              <span style={{ color: "#f87171", fontSize: "0.68rem" }}>*</span>
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
                      background: active
                        ? (isDark ? "rgba(212,115,42,0.15)" : "rgba(143,16,42,0.12)")
                        : (isDark ? "rgba(30,18,8,0.6)" : "rgba(255,248,239,0.6)"),
                      border: active
                        ? (isDark ? "1px solid rgba(212,115,42,0.5)" : "1px solid rgba(143,16,42,0.4)")
                        : (isDark ? "1px solid rgba(201,162,39,0.2)" : "1px solid rgba(173,114,55,0.2)"),
                      color: active
                        ? (isDark ? "#F0C060" : "#8F102A")
                        : (isDark ? "#A08070" : "#8A6A5A"),
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: active ? (isDark ? "0 0 10px rgba(212,115,42,0.15)" : "0 0 10px rgba(143,16,42,0.12)") : "none",
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
            <label style={{ fontSize: "0.8rem", fontWeight: 500, color: isDark ? "#A08070" : "#8A6A5A", display: "flex", alignItems: "center", gap: "5px" }}>
              <GitBranch style={{ width: "12px", height: "12px" }} />
              Tech Stack Used
              <span style={{ color: "#f87171", fontSize: "0.68rem" }}>*</span>
              <span style={{ fontSize: "0.7rem", color: isDark ? "rgba(160,128,112,0.6)" : "rgba(138,106,90,0.5)", fontWeight: 400 }}>
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
                      background: selected
                        ? (isDark ? "rgba(212,115,42,0.15)" : "rgba(143,16,42,0.12)")
                        : (isDark ? "rgba(30,18,8,0.55)" : "rgba(255,248,239,0.55)"),
                      border: selected
                        ? (isDark ? "1px solid rgba(212,115,42,0.5)" : "1px solid rgba(143,16,42,0.38)")
                        : (isDark ? "1px solid rgba(201,162,39,0.2)" : "1px solid rgba(173,114,55,0.18)"),
                      color: selected
                        ? (isDark ? "#F0C060" : "#8F102A")
                        : (isDark ? "#A08070" : "#8A6A5A"),
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      transform: selected ? "scale(1.02)" : "scale(1)",
                      boxShadow: selected ? (isDark ? "0 0 8px rgba(212,115,42,0.1)" : "0 0 8px rgba(143,16,42,0.1)") : "none",
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
            label="Unique Technical Challenges Solved" required
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
            label="Documentation / Slides" required
            icon={<BookOpen style={{ width: "13px", height: "13px" }} />}
            id="docsUrl" name="docsUrl" type="url"
            value={formData.docsUrl} onChange={handleChange}
            placeholder="https://docs.google.com/... or similar"
            hint="Required — technical documentation, slides, or Notion page"
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
              label="What Worked Well?" required
              icon={<Lightbulb style={{ width: "13px", height: "13px" }} />}
              id="whatWorkedWell" name="whatWorkedWell"
              value={formData.whatWorkedWell} onChange={handleChange}
              placeholder="Highlight your team's biggest wins and successes..."
              multiline rows={4}
            />
            <Field
              label="What Failed / Challenges Encountered?" required
              icon={<AlertTriangle style={{ width: "13px", height: "13px" }} />}
              id="challengesFaced" name="challengesFaced"
              value={formData.challengesFaced} onChange={handleChange}
              placeholder="Be honest about what didn't go as planned..."
              multiline rows={4}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field
              label="Lessons Learned" required
              icon={<GraduationCap style={{ width: "13px", height: "13px" }} />}
              id="lessonsLearned" name="lessonsLearned"
              value={formData.lessonsLearned} onChange={handleChange}
              placeholder="Key takeaways your team gained from this experience..."
              multiline rows={4}
            />
            <Field
              label="Future Roadmap / Next Steps" required
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
              fontSize: "0.8rem", fontWeight: 500, color: isDark ? "#A08070" : "#8A6A5A",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <Users style={{ width: "12px", height: "12px" }} />
              Team Members
              <span style={{ color: "#f87171", fontSize: "0.68rem" }}>*</span>
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
                    background: isDark ? "#0F0A05" : "rgba(255,252,247,0.85)",
                    border: isDark ? "1px solid rgba(201,162,39,0.25)" : "1px solid rgba(173,114,55,0.2)",
                    color: isDark ? "#F5EFE0" : "#3A2820", fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  type="button" onClick={addMember}
                  style={{
                    padding: "9px 14px", borderRadius: "10px",
                    background: isDark ? "rgba(212,115,42,0.15)" : "rgba(143,16,42,0.1)",
                    border: isDark ? "1px solid rgba(212,115,42,0.3)" : "1px solid rgba(143,16,42,0.3)",
                    color: isDark ? "#F0C060" : "#8F102A", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
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
                  background: lockedMembers
                    ? "rgba(245,158,11,0.06)"
                    : (isDark ? "rgba(30,18,8,0.6)" : "rgba(255,248,239,0.6)"),
                  border: lockedMembers
                    ? "1px solid rgba(245,158,11,0.2)"
                    : (isDark ? "1px solid rgba(201,162,39,0.2)" : "1px solid rgba(173,114,55,0.18)"),
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
                        background: lockedMembers
                          ? "rgba(245,158,11,0.1)"
                          : (isDark ? "rgba(212,115,42,0.15)" : "rgba(143,16,42,0.08)"),
                        border: lockedMembers
                          ? "1px solid rgba(245,158,11,0.25)"
                          : (isDark ? "1px solid rgba(212,115,42,0.25)" : "1px solid rgba(143,16,42,0.22)"),
                        fontSize: "0.8rem",
                        color: lockedMembers
                          ? "#C9A227"
                          : (isDark ? "#F0C060" : "#8F102A"),
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
                  <p style={{ fontSize: "0.71rem", color: "rgba(180,120,20,0.7)", margin: 0 }}>
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
          disabled={isSubmitting || disabled}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            width: "100%", padding: "16px 32px", borderRadius: "16px", height: "52px", border: "none",
            background: disabled
              ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)")
              : submitted
              ? "linear-gradient(135deg,#059669,#10b981)"
              : isSubmitting
              ? (isDark ? "linear-gradient(135deg,#A5521A,#D4732A)" : "linear-gradient(135deg,#6B0D1F,#8F102A)")
              : btnHovered
              ? (isDark ? "linear-gradient(135deg,#D4732A,#E28945,#F0C060)" : "linear-gradient(135deg,#8F102A,#A61B36,#C0243F)")
              : (isDark ? "linear-gradient(135deg,#D4732A,#C9A227)" : "linear-gradient(135deg,#8F102A,#A61B36)"),
            color: disabled
              ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.35)")
              : isDark ? "#0F0A05" : "#FFF6EE",
            fontSize: "1rem", fontWeight: 700,
            cursor: (isSubmitting || disabled) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
            transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
            transform: btnHovered && !isSubmitting && !disabled ? "translateY(-3px)" : "translateY(0)",
            boxShadow: disabled
              ? "none"
              : submitted
              ? "0 6px 24px rgba(16,185,129,0.4)"
              : btnHovered
              ? (isDark ? "0 12px 40px rgba(212,115,42,0.4), 0 0 0 1px rgba(201,162,39,0.25)" : "0 12px 40px rgba(143,16,42,0.5), 0 0 0 1px rgba(213,155,61,0.2)")
              : (isDark ? "0 6px 24px rgba(212,115,42,0.3)" : "0 6px 24px rgba(143,16,42,0.35)"),
            letterSpacing: "0.02em",
            position: "relative", overflow: "hidden",
          }}
        >
          {btnHovered && !isSubmitting && !disabled && (
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

        <p style={{ textAlign: "center", fontSize: "0.73rem", color: isDark ? "rgba(191,168,152,0.7)" : "rgba(138,106,90,0.55)", marginTop: "10px" }}>
          All 5 sections will be saved · Submissions are visible to all participants
        </p>
      </div>
    </fieldset>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer-btn { from { left: -60%; } to { left: 150%; } }
        @keyframes section-ring { 0%,100%{ opacity:0.4; transform:scale(1); } 50%{ opacity:0.8; transform:scale(1.05); } }
        @keyframes fade-in-badge { from{ opacity:0; transform:scale(0.85); } to{ opacity:1; transform:scale(1); } }
        input::placeholder, textarea::placeholder { color: ${isDark ? "rgba(160,128,112,0.45)" : "rgba(138,106,90,0.35)"} !important; }
        select option { background: ${isDark ? "#1E1208" : "#FFF6EE"}; color: ${isDark ? "#F5EFE0" : "#3A2820"}; }
        textarea { font-family: inherit !important; }
      `}</style>
    </form>
  );
}
