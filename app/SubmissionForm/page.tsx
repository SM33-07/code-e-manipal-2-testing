"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Submission } from "@/components/SubmissionForm";
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


// ─── Dynamic Imports (SSR disabled) ──────────────────────────────────────────
// SubmissionForm: Main form component with 5 sections (Project, Tech, Links, Reflection, Team)
// SubmissionCard: Card displayed in Browse tab for each submission
// TypewriterText: Animated rotating text in hero
// AnimatedCounter: Number animation for stat cards
const SubmissionForm = dynamic(
  () => import("@/components/SubmissionForm").then((m) => m.SubmissionForm),
  { ssr: false }
);
const SubmissionCard = dynamic(
  () => import("@/components/SubmissionCard").then((m) => m.SubmissionCard),
  { ssr: false }
);
const TypewriterText = dynamic(
  () => import("@/components/Typewriter").then((m) => m.TypewriterText),
  { ssr: false }
);
const AnimatedCounter = dynamic(
  () => import("@/components/AnimatedCounter").then((m) => m.AnimatedCounter),
  { ssr: false }
);



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

// ─── Stat Card Component ──────────────────────────────────────────────────────
// Renders animated stat boxes in hero (Submissions, Categories, Hours Left)
// Design: left accent border, left-aligned label + large value + subtitle, badge pill top-right
function StatCard({
  value,
  label,
  suffix = "",
  delay = 0,
  subtitle = "",
  badge = "",
  accentColor = "#8F102A",
}: {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
  subtitle?: string;
  badge?: string;
  accentColor?: string;
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
        position: "relative",
        padding: "24px 28px 22px",
        borderRadius: "16px",
        background: "var(--card)",
        border: "1px solid var(--jaipur-secondary-light)",
        borderLeft: `4px solid ${accentColor}`,
        backdropFilter: "blur(12px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        boxShadow: "0 4px 20px rgba(143,16,42,0.08)",
        minWidth: "210px",
        textAlign: "left",
      }}
    >
      {/* Badge pill — top right */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 10px",
            borderRadius: "999px",
            background: `${accentColor}18`,
            color: accentColor,
            fontSize: "0.72rem",
            fontWeight: 600,
          }}
        >
          ↗ {badge}
        </div>
      )}

      {/* Label */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--muted-foreground)",
          fontWeight: 500,
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--foreground)",
          lineHeight: 1.1,
          marginBottom: "6px",
        }}
      >
        <AnimatedCounter target={value} suffix={suffix} />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--muted-foreground)",
            opacity: 0.7,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ─── Tab Button Component ─────────────────────────────────────────────────────
// Header navigation tabs: "Submit" and "Browse"
// Controls: active/hover colors, border, background, badge count styling
// Active: maroon bg, cream text | Hover: light cream bg | Default: cream bg, brown text
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
          ? "none"
          : hovered
            ? "1px solid #E9C39B"
            : "1px solid #EBCFB5",
        background: active
          ? "#8F102A"
          : hovered
            ? "#FCEAD8"
            : "#FFF6ED",
        color: active
          ? "#FFF7F1"
          : hovered
            ? "#A15C2E"
            : "#A15C2E",
        fontSize: "0.9rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.25s ease",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        boxShadow: active
          ? "0 4px 16px rgba(143,16,42,0.3)"
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
              ? "rgba(255,247,241,0.3)"
              : "rgba(235,207,181,0.3)",
            color: active ? "#FFF7F1" : "#A15C2E",
            transition: "all 0.25s ease",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Pulse Ring Component ─────────────────────────────────────────────────────
// Animated pulsing dot for "Live" badge in header
// Controls: outer ring color (gold), inner dot color, animation timing
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
          background: "#D59B3D",
          animation: "pulse-ring-outer 2s ease-out infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: "2px",
          borderRadius: "50%",
          background: "#E8B55A",
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
// Header user avatar + dropdown with email and logout
// Controls: button style (secondary), avatar gradient (maroon), dropdown bg/border/shadow
// Logout button: maroon text, hover background
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
          background: "#FFF8F1",
          border: "1px solid #EBC9AA",
          color: "#9A5A2B",
          fontSize: "0.75rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#FCEAD8";
          e.currentTarget.style.borderColor = "#EBCFB5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#FFF8F1";
          e.currentTarget.style.borderColor = "#EBC9AA";
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8F102A, #A61B36)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            color: "#FFF6EE",
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
            right: 10,
            marginTop: "8px",
            background: "rgba(255,248,239,0.98)",
            border: "1px solid #EBCFB5",
            borderRadius: "8px",
            padding: "8px 0",
            minWidth: "160px",
            zIndex: 1000,
            boxShadow: "0 6px 24px rgba(173,114,55,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #EBCFB5",
              fontSize: "0.7rem",
              color: "#B89A85",
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
              color: "#8F102A",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(143,16,42,0.08)";
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

// ─── Main Page Component ────────────────────────────────────────────────────────
// State:
//   activeTab: "submit" | "browse" - switches between form and gallery
//   submissions: array of all submissions from API
//   loading: shows spinner while fetching
//   searchQuery: text filter for browse grid
//   activeCategory: category filter pill selection
//   headerVisible/heroVisible: entrance animation triggers
//   showFilters: toggles category filter pills visibility
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
  const [heroVisible, setHeroVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Entrance animations on mount
  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  // Fetch submissions from server on mount
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

  // ─── handleSubmission ────────────────────────────────────────────────────────
  // Called by SubmissionForm onSubmit
  // Maps form data to API payload, POSTs to /api/submissions
  // On success: prepends new submission to list, shows toast, redirects to result page
  const handleSubmission = async (newSubmission: any) => {
    try {
      const payload = {
        team_id: newSubmission.teamId, // ⚠️ IMPORTANT
        teamName: newSubmission.teamName,
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

  // ─── filteredSubmissions ─────────────────────────────────────────────────────
  // Derived state: filters submissions by searchQuery (name, team, summary, tagline)
  // and activeCategory. Used in Browse tab grid.
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
          color: "var(--foreground)",
          position: "relative",
          zIndex: 2,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >

        {/* ── Hero ── */}
        <section
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            paddingTop: "128px",
            paddingBottom: "40px",
            paddingLeft: "80px",
            paddingRight: "32px",
            maxWidth: "1280px",
            margin: "0 auto",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible
              ? "translateY(0)"
              : "translateY(30px)",
            transition:
              "opacity 0.8s ease 0.1s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "170px",
              padding: "15px 14px",
              borderRadius: "999px",
              background: "#8F102A",
              border: "1px solid #E9C39B",
              marginBottom: "24px",
              fontSize: "1.48rem",
              color: "#FFF6EE",
              fontWeight: 500,
              letterSpacing: "0.03em",
            }}
          >
            <Sparkles style={{ width: "27px", height: "22px", color: "#D59B3D" }} />
            Hackathon Submission Portal
            <Sparkles style={{ width: "27px", height: "22px", color: "#D59B3D" }} />
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--jaipur-primary)", display: "block" }}>
              Build the Future,
            </span>
            <span
              style={{
                color: "var(--jaipur-gold)",
                display: "block",
                animation: "header-glow 3s ease-in-out infinite",
              }}
            >
              <TypewriterText
                texts={[
                  "Submit Your Vision",
                  "Share Your Innovation",
                  "Launch Your Idea",
                  "Show Your Talent",
                ]}
              />
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--muted-foreground)",
              maxWidth: "560px",
              margin: "0 auto 36px",
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
              display: "flex",
              justifyContent: "flex-start",
              gap: "16px",
              flexWrap: "wrap",
              margin: "0 0 36px",
              marginLeft: "calc((100% - 560px) / 2 - 70px)",
            }}
          >
            <StatCard
              value={submissions.length}
              label="Total Submissions"
              subtitle="registered projects"
              badge="Live"
              accentColor="#8F102A"
              delay={400}
            />
            <StatCard
              value={categories.length || 6}
              label="Active Tracks"
              subtitle="tech categories"
              badge="Open"
              accentColor="#C9A227"
              delay={550}
            />
            <StatCard
              value={48}
              label="Time Remaining"
              suffix="h"
              subtitle="until deadline"
              badge="Ongoing"
              accentColor="#D4732A"
              delay={700}
            />
          </div>

          {/* ── Tab Buttons below hero ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: "12px",
              marginLeft: "calc((100% - 560px) / 2 + 20px)",
            }}
          >
            <TabButton
              active={activeTab === "submit"}
              onClick={() => setActiveTab("submit")}
            >
              <Zap style={{ width: "14px", height: "14px" }} />
              Submit Project
            </TabButton>
            <TabButton
              active={activeTab === "browse"}
              onClick={() => setActiveTab("browse")}
              count={submissions.length}
            >
              <Trophy style={{ width: "14px", height: "14px" }} />
              Browse Submissions
            </TabButton>
          </div>
        </section>

        {/* ── Main Container ── */}
        <main
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0px 32px 80px 0px",
          }}
        >
          {/* ── Submit Tab ── */}
          {activeTab === "submit" && (
            <div
              style={{
                animation:
                  "float-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
                display: "flex",
                justifyContent: "flex-start",
                width: "100%",
                marginLeft: "calc((100% - 560px) / 2 - 10px)",
              }}
            >
              <div style={{ maxWidth: "720px", width: "100%" }}>
              <div
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,248,239,0.68)",
                  border: "1px solid #EBCFB5",
                  backdropFilter: "blur(16px)",
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 60px rgba(173,114,55,0.1), 0 0 0 1px rgba(235,207,181,0.2)",
                }}
              >
                {/* Form header */}
                <div
                  style={{
                    padding: "28px 32px 0",
                    borderBottom: "1px solid #EBCFB5",
                    paddingBottom: "20px",
                    background:
                      "linear-gradient(180deg, rgba(213,155,61,0.08) 0%, transparent 100%)",
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
                        background: "rgba(143,16,42,0.12)",
                        border: "1px solid #EBCFB5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Zap
                        style={{
                          width: "14px",
                          height: "14px",
                          color: "#8F102A",
                        }}
                      />
                    </div>
                    <h2
                      style={{
                        fontSize: "1.55rem",
                        fontWeight: 700,
                        color: "#8F102A",
                        margin: 0,
                      }}
                    >
                      Submit Your Project
                    </h2>
                  </div>
                  <p
                    style={{
                      fontSize: "0.99rem",
                      color: "#7A5A4A",
                      margin: 0,
                    }}
                  >
                    Share your creation with the hackathon
                    community. Fields marked with{" "}
                    <span style={{ color: "#8F102A" }}>*</span>{" "}
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
                        style={{ width: "18px", height: "13px" }}
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
                      fontSize: "1.00rem",
                      color: "#B89A85",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      padding: 0,
                    }}
                    onMouseEnter={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.color = "#D59B3D")
                    }
                    onMouseLeave={(e) =>
                    ((
                      e.currentTarget as HTMLButtonElement
                    ).style.color = "#B89A85")
                    }
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
              </div>
            </div>
          )}

          {/* ── Browse Tab ── */}
          {activeTab === "browse" && (
            <div
              style={{
                animation:
                  "float-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
                marginLeft: "80px",
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
                        color: "#D59B3D",
                      }}
                    />
                    <h2
                      style={{
                        fontSize: "1.7rem",
                        fontWeight: 700,
                        color: "#8F102A",
                        margin: 0,
                      }}
                    >
                      All Submissions
                    </h2>
                  </div>
                  <p
                    style={{
                      fontSize: "1.00rem",
                      color: "#7A5A4A",
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
                        color: "#B89A85",
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
                        background: "rgba(255,255,255,0.72)",
                        border: "1px solid #E6C7A8",
                        color: "#6A4635",
                        fontSize: "1.00rem",
                        outline: "none",
                        width: "220px",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onFocus={(e) =>
                      ((
                        e.target as HTMLInputElement
                      ).style.borderColor = "#C9822B")
                      }
                      onBlur={(e) =>
                      ((
                        e.target as HTMLInputElement
                      ).style.borderColor = "#E6C7A8")
                      }
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "10px",
                      background: showFilters
                        ? "#8F102A"
                        : "#FFF8F1",
                      border: showFilters
                        ? "none"
                        : "1px solid #EBC9AA",
                      color: showFilters
                        ? "#FFF7F1"
                        : "#9A5A2B",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "1.0rem",
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
                    background: "rgba(255,248,239,0.88)",
                    border: "1px solid #EBCFB5",
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
                        fontSize: "1.00rem",
                        fontWeight:
                          activeCategory === cat ? 600 : 400,
                        background:
                          activeCategory === cat
                            ? "#8F102A"
                            : "#FFF6ED",
                        border:
                          activeCategory === cat
                            ? "none"
                            : "1px solid #E9C39B",
                        color:
                          activeCategory === cat
                            ? "#FFF7F1"
                            : "#A15C2E",
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
                      border: "2px solid #EBCFB5",
                      borderTopColor: "#D59B3D",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p
                    style={{
                      color: "#7A5A4A",
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
                      background: "rgba(143,16,42,0.1)",
                      border: "1px solid #EBCFB5",
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
                        color: "#8F102A",
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      color: "#8F102A",
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
                      color: "#B89A85",
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
                          "linear-gradient(90deg, #8F102A 0%, #A61B36 50%, #7A0E22 100%)",
                        border: "none",
                        color: "#FFF6EE",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        boxShadow:
                          "0 4px 16px rgba(143,16,42,0.3)",
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
            zIndex: 7,
            borderTop: "1px solid #EBCFB5",
            background: "rgba(255,248,239,0.6)",
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
                  "linear-gradient(135deg, #8F102A, #A61B36)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Code2
                style={{
                  width: "11px",
                  height: "11px",
                  color: "#FFF6EE",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "1.40rem",
                fontWeight: 600,
                color: "#8F102A",
              }}
            >
              Code-e-Manipal 2.0
            </span>
          </div>
          <p
            style={{
              fontSize: "1.00rem",
              color: "#B89A85",
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
          0%, 100% { filter: drop-shadow(0 0 8px rgba(143,16,42,0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(213,155,61,0.7)); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #FFF9F3; }
        ::-webkit-scrollbar-thumb { background: #EBCFB5; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #D59B3D; }
        input::placeholder { color: #B89A85 !important; }
      `}</style>
      </div>
    </ProtectedRoute>);
}
