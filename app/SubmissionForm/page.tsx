"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Submission,
  SubmissionForm,
} from "@/components/SubmissionForm";
import { SubmissionCard } from "@/components/SubmissionCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GradientOrbs } from "@/components/GradientOrbs";
import { TypewriterText } from "@/components/Typewriter";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import Image from "next/image";
import { toast } from "sonner";
import {
  Code2,
  Trophy,
  Zap,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Github,
  Globe,
} from "lucide-react";
import { projectId, publicAnonKey } from "@/lib/supabase/info";

const SERVER_URL = "https://ihnclawnbtkwvbfqwxfe.supabase.co/functions/v1/make-server-f5beda68";
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

const CATEGORY_FILTERS = [
  "All",
  "AI/ML",
  "Web Dev",
  "Mobile",
  "Blockchain",
  "IoT",
  "Cybersecurity",
  "Other",
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  suffix = "",
  delay = 0,
}: {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        textAlign: "center",
        padding: "20px 28px",
        borderRadius: "14px",
        background: "rgba(10,15,40,0.6)",
        border: "1px solid rgba(59,130,246,0.15)",
        backdropFilter: "blur(10px)",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0)"
          : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          background:
            "linear-gradient(135deg, #60a5fa, #93c5fd)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        <AnimatedCounter target={value} suffix={suffix} />
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "rgba(148,163,184,0.7)",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 22px",
        borderRadius: "10px",
        border: active
          ? "1px solid rgba(59,130,246,0.5)"
          : hovered
            ? "1px solid rgba(59,130,246,0.2)"
            : "1px solid transparent",
        background: active
          ? "linear-gradient(135deg, rgba(29,78,216,0.3), rgba(37,99,235,0.2))"
          : hovered
            ? "rgba(59,130,246,0.08)"
            : "transparent",
        color: active
          ? "#93c5fd"
          : hovered
            ? "#60a5fa"
            : "rgba(148,163,184,0.7)",
        fontSize: "0.9rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.25s ease",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        boxShadow: active
          ? "0 2px 12px rgba(29,78,216,0.2)"
          : "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
      {count !== undefined && (
        <span
          style={{
            fontSize: "0.72rem",
            padding: "1px 6px",
            borderRadius: "999px",
            background: active
              ? "rgba(59,130,246,0.3)"
              : "rgba(255,255,255,0.08)",
            color: active ? "#bfdbfe" : "rgba(148,163,184,0.6)",
            transition: "all 0.25s ease",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Pulse Ring ───────────────────────────────────────────────────────────────
function PulseRing() {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: "10px",
        height: "10px",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#3b82f6",
          animation: "pulse-ring-outer 2s ease-out infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: "2px",
          borderRadius: "50%",
          background: "#60a5fa",
        }}
      />
      <style>{`
        @keyframes pulse-ring-outer {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </span>
  );
}

// ─── User Menu Component ────────────────────────────────────────────────────────
function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "6px",
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          color: "#93c5fd",
          fontSize: "0.75rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(59,130,246,0.15)";
          e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(59,130,246,0.1)";
          e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)";
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            color: "white",
            fontWeight: 700,
          }}
        >
          {(user?.name || user?.email || "User").charAt(0).toUpperCase()}
        </div>
        <span>{user?.name}</span>
      </button>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            background: "rgba(30,41,59,0.95)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "8px",
            padding: "8px 0",
            minWidth: "160px",
            zIndex: 1000,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid rgba(59,130,246,0.1)",
              fontSize: "0.7rem",
              color: "rgba(148,163,184,0.7)",
            }}
          >
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "none",
              border: "none",
              color: "#f87171",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "submit" | "browse"
  >("submit");
  const [submissions, setSubmissions] = useState<Submission[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Entrance animations on mount
  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 100);
    setTimeout(() => setHeroVisible(true), 300);
  }, []);

  // Fetch submissions from server
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/submissions");

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ NOT JSON:", text);
        throw new Error("Invalid JSON");
      }

      if (!res.ok) {
        console.error("🔥 API ERROR:", data);
        throw new Error(data?.error || "Failed");
      }

      const mapped = (data.data || []).map((item: any) => ({
        id: item.id,
        projectName: item.title,
        solutionSummary: item.summary,
        category: item.category,
        teamName: "Team",
        techStack: item.technologies || [],
        githubUrl: item.github_url,
        demoUrl: item.demo_url,
        docsUrl: item.docs_url,
      }));

      setSubmissions(mapped);

    } catch (err) {
      console.error("CLIENT ERROR:", err);
    } finally {
      setLoading(false); // ✅ ALWAYS RUNS
    }
  };

  const router = useRouter(); // ✅ ADD THIS at top of component

  const handleSubmission = async (newSubmission: any) => {
    try {
      const payload = {
        team_id: newSubmission.teamId, // ⚠️ IMPORTANT
        title: newSubmission.projectName,
        summary: newSubmission.solutionSummary,
        description: newSubmission.solutionSummary,
        category: newSubmission.category,
        technologies: newSubmission.techStack || [],
        github_url: newSubmission.githubUrl,
        demo_url: newSubmission.demoUrl,
        docs_url: newSubmission.docsUrl,
        demo_video_url: newSubmission.videoUrl,
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("RAW:", text);
        throw new Error("Invalid JSON");
      }

      if (!res.ok) {
        toast.error(data.error || "Submission failed");
        return;
      }

      setSubmissions((prev) => [data.data, ...prev]);

      toast.success("Project submitted successfully!");

      router.push(`/submission-result/${data.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.projectName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      s.teamName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (s.solutionSummary || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (s.tagline || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(submissions.map((s) => s.category).filter(Boolean)),
  );

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #020817 0%, #050d24 30%, #04091d 60%, #020817 100%)",
          color: "#e2e8f0",
          position: "relative",
          fontFamily: "'Inter', system-ui, sans-serif",
          overflowX: "hidden",
        }}
      >
        <AnimatedBackground />
        <GradientOrbs />

        {/* ── Header ── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(2,8,23,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible
              ? "translateY(0)"
              : "translateY(-20px)",
            transition:
              "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(59,130,246,0.4)",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/logo.png"
                  alt="LearnIT Logo"
                  width={26}
                  height={26}
                  style={{
                    objectFit: "contain",
                    width: "auto",
                    height: "auto",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #ffffff, #93c5fd)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Code-e-Manipal 2.0
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(148,163,184,0.55)",
                    letterSpacing: "0.04em",
                  }}
                >
                  POWERED BY LEARNIT MUJ
                </div>
              </div>
            </div>

            {/* Nav tabs */}
            <div style={{ display: "flex", gap: "6px" }}>
              <TabButton
                active={activeTab === "submit"}
                onClick={() => setActiveTab("submit")}
              >
                <Zap style={{ width: "14px", height: "14px" }} />
                Submit
              </TabButton>
              <TabButton
                active={activeTab === "browse"}
                onClick={() => setActiveTab("browse")}
                count={submissions.length}
              >
                <Trophy
                  style={{ width: "14px", height: "14px" }}
                />
                Browse
              </TabButton>
            </div>

            {/* Live badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <PulseRing />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#34d399",
                    fontWeight: 500,
                  }}
                >
                  Live
                </span>
              </div>

              {/* User menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "72px 24px 56px",
            maxWidth: "900px",
            margin: "0 auto",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible
              ? "translateY(0)"
              : "translateY(30px)",
            transition:
              "opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "5px 14px",
              borderRadius: "999px",
              background: "rgba(29,78,216,0.12)",
              border: "1px solid rgba(59,130,246,0.25)",
              marginBottom: "24px",
              fontSize: "0.78rem",
              color: "#93c5fd",
              fontWeight: 500,
              letterSpacing: "0.03em",
            }}
          >
            <Sparkles style={{ width: "12px", height: "12px" }} />
            Hackathon Submission Portal
            <Sparkles style={{ width: "12px", height: "12px" }} />
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #e0eaff 50%, #93c5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "block",
              }}
            >
              Build the Future,
            </span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "block",
                animation: "header-glow 3s ease-in-out infinite",
              }}
            >
              <TypewriterText
                texts={[
                  "Submit Your Vision",
                  "Share Your Innovation",
                  "Show Your Talent",
                  "Launch Your Idea",
                ]}
              />
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(148,163,184,0.75)",
              maxWidth: "560px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Join hundreds of developers building the next
            generation of technology. Submit your project, get
            discovered, and compete for glory.
          </p>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            <StatCard
              value={submissions.length}
              label="Submissions"
              delay={500}
            />
            <StatCard
              value={categories.length || 6}
              label="Categories"
              delay={650}
            />
            <StatCard
              value={48}
              label="Hours Left"
              suffix="h"
              delay={800}
            />
          </div>
        </section>

        {/* ── Main Content ── */}
        <main
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px 80px",
          }}
        >
          {/* ── Submit Tab ── */}
          {activeTab === "submit" && (
            <div
              style={{
                animation:
                  "float-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
                maxWidth: "720px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  borderRadius: "20px",
                  background: "rgba(8,14,38,0.7)",
                  border: "1px solid rgba(59,130,246,0.18)",
                  backdropFilter: "blur(16px)",
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.06)",
                }}
              >
                {/* Form header */}
                <div
                  style={{
                    padding: "28px 32px 0",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "20px",
                    background:
                      "linear-gradient(180deg, rgba(29,78,216,0.06) 0%, transparent 100%)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(29,78,216,0.2)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Zap
                        style={{
                          width: "14px",
                          height: "14px",
                          color: "#60a5fa",
                        }}
                      />
                    </div>
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#f0f4ff",
                        margin: 0,
                      }}
                    >
                      Submit Your Project
                    </h2>
                  </div>
                  <p
                    style={{
                      fontSize: "0.83rem",
                      color: "rgba(148,163,184,0.6)",
                      margin: 0,
                    }}
                  >
                    Share your creation with the hackathon
                    community. Fields marked with{" "}
                    <span style={{ color: "#f87171" }}>*</span>{" "}
                    are required.
                  </p>
                </div>

                <div style={{ padding: "28px 32px 32px" }}>
                  <SubmissionForm onSubmit={handleSubmission} />
                </div>
              </div>

              {/* Quick links */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  marginTop: "20px",
                }}
              >
                {[
                  {
                    icon: (
                      <Github
                        style={{ width: "13px", height: "13px" }}
                      />
                    ),
                    label: "GitHub Docs",
                  },
                  {
                    icon: (
                      <Globe
                        style={{ width: "13px", height: "13px" }}
                      />
                    ),
                    label: "learnitmuj.org",
                  },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.78rem",
                      color: "rgba(148,163,184,0.45)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      padding: 0,
                    }}
                    onMouseEnter={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.color = "#60a5fa")
                    }
                    onMouseLeave={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.color = "rgba(148,163,184,0.45)")
                    }
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Browse Tab ── */}
          {activeTab === "browse" && (
            <div
              style={{
                animation:
                  "float-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
              }}
            >
              {/* Browse header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "28px",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    <Trophy
                      style={{
                        width: "20px",
                        height: "20px",
                        color: "#fbbf24",
                      }}
                    />
                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#f0f4ff",
                        margin: 0,
                      }}
                    >
                      All Submissions
                    </h2>
                  </div>
                  <p
                    style={{
                      fontSize: "0.83rem",
                      color: "rgba(148,163,184,0.55)",
                      margin: 0,
                    }}
                  >
                    {filteredSubmissions.length} project
                    {filteredSubmissions.length !== 1
                      ? "s"
                      : ""}{" "}
                    found
                    {activeCategory !== "All"
                      ? ` in ${activeCategory}`
                      : ""}
                  </p>
                </div>

                {/* Search */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Search
                      style={{
                        position: "absolute",
                        left: "11px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "14px",
                        height: "14px",
                        color: "rgba(148,163,184,0.4)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      style={{
                        padding: "9px 14px 9px 34px",
                        borderRadius: "10px",
                        background: "rgba(10,15,35,0.7)",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        color: "#e2e8f0",
                        fontSize: "0.85rem",
                        outline: "none",
                        width: "220px",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) =>
                      ((
                        e.target as HTMLInputElement
                      ).style.borderColor =
                        "rgba(59,130,246,0.5)")
                      }
                      onBlur={(e) =>
                      ((
                        e.target as HTMLInputElement
                      ).style.borderColor =
                        "rgba(255,255,255,0.08)")
                      }
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "10px",
                      background: showFilters
                        ? "rgba(29,78,216,0.2)"
                        : "rgba(10,15,35,0.7)",
                      border: showFilters
                        ? "1px solid rgba(59,130,246,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: showFilters
                        ? "#93c5fd"
                        : "rgba(148,163,184,0.6)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.85rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <SlidersHorizontal
                      style={{ width: "13px", height: "13px" }}
                    />
                    Filter
                    <ChevronDown
                      style={{
                        width: "12px",
                        height: "12px",
                        transform: showFilters
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Category filter pills */}
              {showFilters && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "24px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(8,14,38,0.6)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    animation:
                      "float-up 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
                  }}
                >
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: "999px",
                        fontSize: "0.8rem",
                        fontWeight:
                          activeCategory === cat ? 600 : 400,
                        background:
                          activeCategory === cat
                            ? "rgba(29,78,216,0.3)"
                            : "rgba(255,255,255,0.04)",
                        border:
                          activeCategory === cat
                            ? "1px solid rgba(59,130,246,0.5)"
                            : "1px solid rgba(255,255,255,0.06)",
                        color:
                          activeCategory === cat
                            ? "#93c5fd"
                            : "rgba(148,163,184,0.6)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Cards grid */}
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px 0",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: "2px solid rgba(59,130,246,0.1)",
                      borderTopColor: "#3b82f6",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p
                    style={{
                      color: "rgba(148,163,184,0.5)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Loading submissions...
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 0",
                    animation: "float-up 0.5s ease forwards",
                  }}
                >
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "20px",
                      background: "rgba(29,78,216,0.1)",
                      border: "1px solid rgba(59,130,246,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                    }}
                  >
                    <Code2
                      style={{
                        width: "30px",
                        height: "30px",
                        color: "rgba(59,130,246,0.5)",
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      color: "#e2e8f0",
                      fontSize: "1.1rem",
                      marginBottom: "8px",
                    }}
                  >
                    {searchQuery
                      ? "No results found"
                      : "No submissions yet"}
                  </h3>
                  <p
                    style={{
                      color: "rgba(148,163,184,0.45)",
                      fontSize: "0.88rem",
                    }}
                  >
                    {searchQuery
                      ? "Try a different search term or category"
                      : "Be the first to submit your project!"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveTab("submit")}
                      style={{
                        marginTop: "20px",
                        padding: "10px 22px",
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #1d4ed8, #2563eb)",
                        border: "none",
                        color: "white",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        boxShadow:
                          "0 4px 16px rgba(29,78,216,0.3)",
                      }}
                    >
                      Submit First Project →
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {filteredSubmissions.map((submission, i) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      index={i}
                      
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            position: "relative",
            zIndex: 10,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(2,8,23,0.6)",
            backdropFilter: "blur(10px)",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                background:
                  "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Code2
                style={{
                  width: "11px",
                  height: "11px",
                  color: "white",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(148,163,184,0.6)",
              }}
            >
              Code-e-Manipal 2.0
            </span>
          </div>
          <p
            style={{
              fontSize: "0.72rem",
              color: "rgba(148,163,184,0.3)",
              margin: 0,
            }}
          >
            Powered by LearnIT · Build the Future
          </p>
        </footer>

        {/* Global keyframe styles */}
        <style>{`
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes header-glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(59,130,246,0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(96,165,250,0.7)); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(2,8,23,0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.5); }
        input::placeholder { color: rgba(148,163,184,0.35) !important; }
      `}</style>
      </div>
    </ProtectedRoute>);
}
