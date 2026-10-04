"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Github,
  Video,
  Globe,
  Award,
  Sparkles,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { calculateWeightedScore } from "@/utils/scoring";

interface RubricCriterion {
  key: "innovation" | "technical" | "presentation" | "impact";
  title: string;
  weight: string;
  description: string;
  color: string;
}

const RUBRIC: RubricCriterion[] = [
  {
    key: "innovation",
    title: "Innovation & Creativity",
    weight: "30%",
    description: "Novelty of concept, uniqueness of approach, and creative problem-solving.",
    color: "text-primary",
  },
  {
    key: "technical",
    title: "Technical Execution",
    weight: "30%",
    description: "Code architecture, complexity, functionality, scalability, and engineering rigor.",
    color: "text-secondary",
  },
  {
    key: "presentation",
    title: "UI/UX & Presentation",
    weight: "20%",
    description: "Design aesthetics, user experience, documentation clarity, and demo quality.",
    color: "text-jaipur-pink",
  },
  {
    key: "impact",
    title: "Impact & Viability",
    weight: "20%",
    description: "Real-world utility, commercial/social viability, and practical problem resolution.",
    color: "text-jaipur-terracotta",
  },
];

export default function JudgeEvaluatePage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.teamId;

  const router = useRouter();
  const { user, role, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Rubric Scores (1 - 10)
  const [scores, setScores] = useState<{
    innovation: number;
    technical: number;
    presentation: number;
    impact: number;
  }>({
    innovation: 7,
    technical: 7,
    presentation: 7,
    impact: 7,
  });

  const [feedback, setFeedback] = useState("");
  const [isCompletedBefore, setIsCompletedBefore] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (role !== "judge" && role !== "admin") {
      router.push("/dashboard");
      return;
    }

    loadSubmissionData();
  }, [teamId, isAuthenticated, role]);

  const loadSubmissionData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch judge assignments to find the matching submission
      const assignRes = await fetch("/api/judging/assignments");
      let matchedSubId = teamId;
      let assignmentData: any = null;

      if (assignRes.ok) {
        const assignJson = await assignRes.json();
        const assignments: any[] = Array.isArray(assignJson.data) ? assignJson.data : [];

        // Match by submission_id OR team_id
        assignmentData = assignments.find(
          (a) =>
            a.submission_id === teamId ||
            a.submissions?.id === teamId ||
            a.submissions?.team_id === teamId
        );

        if (assignmentData) {
          matchedSubId = assignmentData.submission_id || assignmentData.submissions?.id;
        }
      }

      setSubmissionId(matchedSubId);

      // 2. Fetch submission details
      const subRes = await fetch(`/api/submissions/${matchedSubId}`);
      if (subRes.ok) {
        const subJson = await subRes.json();
        setSubmission(subJson.data || assignmentData?.submissions || null);
      } else if (assignmentData?.submissions) {
        setSubmission(assignmentData.submissions);
      } else {
        // Fallback placeholder structure if mock
        setSubmission({
          id: matchedSubId,
          title: `Assigned Project (${teamId.slice(0, 8)})`,
          description: "Technical prototype submission for Code-e-Manipal 2.0 evaluation.",
          track: "AI & Intelligent Systems",
          github_url: "https://github.com",
          demo_url: "https://demo.app",
        });
      }

      // 3. Fetch existing review if already graded
      const reviewsRes = await fetch("/api/judging/reviews");
      if (reviewsRes.ok) {
        const reviewsJson = await reviewsRes.json();
        const reviews = Array.isArray(reviewsJson.data) ? reviewsJson.data : [];
        const existing = reviews.find(
          (r: any) =>
            r.submissionId === matchedSubId ||
            r.submission_id === matchedSubId ||
            r.id === matchedSubId
        );

        if (existing) {
          setIsCompletedBefore(existing.isComplete || existing.is_complete || false);
          setScores({
            innovation: existing.criteria?.innovation ?? existing.score_innovation ?? 7,
            technical: existing.criteria?.technical ?? existing.score_technical ?? 7,
            presentation: existing.criteria?.presentation ?? existing.score_presentation ?? 7,
            impact: existing.criteria?.impact ?? existing.score_impact ?? 7,
          });
          setFeedback(existing.feedback || "");
        }
      }
    } catch (err: any) {
      console.error("Failed to load evaluation data:", err);
      setError("Unable to load submission details. Please verify assignment queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (key: keyof typeof scores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  // Authoritative weighted score (0-100)
  const weightedScore = calculateWeightedScore(scores);

  const handleSubmitEvaluation = async (isDraft = false) => {
    if (!submissionId) {
      toast.error("Invalid submission reference.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        submission_id: submissionId,
        score_innovation: scores.innovation,
        score_technical: scores.technical,
        score_presentation: scores.presentation,
        score_impact: scores.impact,
        feedback: feedback.trim(),
        is_complete: !isDraft,
      };

      const res = await fetch("/api/judging/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Evaluation submission failed (${res.status})`);
      }

      toast.success(
        isDraft
          ? "Evaluation draft saved successfully."
          : "Evaluation submitted! Returning to assignments queue."
      );

      // Return to dedicated /judge assignment queue as required
      router.push("/judge");
    } catch (err: any) {
      console.error("Evaluation submission error:", err);
      toast.error(err.message || "Could not save review. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin text-primary size-8 mb-4 border-2 border-primary border-t-transparent rounded-full" />
        <h2 className="text-base font-bold text-foreground">Loading Evaluation Workspace...</h2>
        <p className="text-xs text-muted-foreground mt-1">Retrieving submission assets and rubric data.</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-foreground">Evaluation Assignment Unavailable</h2>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {error || "This submission could not be found or you are not currently assigned to evaluate it."}
        </p>
        <Link
          href="/judge"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Judge Queue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-28 pt-2">
      {/* Back & Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/judge"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Assignment Queue</span>
        </Link>

        {isCompletedBefore && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-[11px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={13} />
            <span>Graded & Recorded</span>
          </span>
        )}
      </div>

      {/* 1. Project Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
              Project Evaluation Target
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {submission.title || `Team Submission #${teamId.slice(0, 6)}`}
            </h1>
          </div>

          {submission.track && (
            <span className="self-start px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              {submission.track}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-4">
          {submission.description ||
            submission.summary ||
            "Technical hackathon prototype submitted for jury scoring."}
        </p>

        {/* Submission Material Links (Large touch targets for phones) */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          {submission.github_url && (
            <a
              href={submission.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground border border-border text-xs font-semibold hover:border-secondary transition-colors"
            >
              <Github size={15} />
              <span>Source Repository</span>
              <ExternalLink size={12} className="opacity-70" />
            </a>
          )}

          {submission.demo_url && (
            <a
              href={submission.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground border border-border text-xs font-semibold hover:border-secondary transition-colors"
            >
              <Globe size={15} />
              <span>Live Application</span>
              <ExternalLink size={12} className="opacity-70" />
            </a>
          )}

          {submission.video_url && (
            <a
              href={submission.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground border border-border text-xs font-semibold hover:border-secondary transition-colors"
            >
              <Video size={15} />
              <span>Demo Video</span>
              <ExternalLink size={12} className="opacity-70" />
            </a>
          )}
        </div>
      </div>

      {/* 2. Official Evaluation Rubric (Mobile-Optimized Touch Controls) */}
      <div className="space-y-5 mb-8">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-bold text-foreground">Scoring Rubric</h2>
            <p className="text-xs text-muted-foreground">
              Rate each criterion from 1 (poor) to 10 (exceptional). Tap directly to select.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border text-xs font-mono font-bold text-primary">
            <span>Score:</span>
            <span className="text-sm">{weightedScore.toFixed(1)}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>

        {RUBRIC.map((item, idx) => {
          const currentScore = scores[item.key];
          return (
            <div
              key={item.key}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all focus-within:border-primary/50"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-7 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold uppercase tracking-wider border border-secondary/30">
                    {item.weight}
                  </span>
                  <div className="text-lg font-black text-foreground mt-1">
                    {currentScore} <span className="text-xs font-normal text-muted-foreground">/10</span>
                  </div>
                </div>
              </div>

              {/* Touch-Friendly 1-10 Score Selector Grid */}
              <div className="mt-4 pt-3 border-t border-border/60">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                    const isSelected = currentScore === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleScoreChange(item.key, val)}
                        className={`h-11 sm:h-10 rounded-xl font-mono text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md scale-102 ring-2 ring-primary/30"
                            : "bg-accent/50 text-foreground hover:bg-accent border border-border"
                        }`}
                        aria-label={`Score ${val} for ${item.title}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Written Feedback / Notes */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-secondary" />
          <h3 className="text-sm font-bold text-foreground">Jury Feedback & Technical Notes</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Optional constructive observations, code critique, or recommendations for the team.
        </p>
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Solid full-stack architecture. Smart utilization of vector embeddings. Frontend UI could benefit from clearer error states on mobile..."
          className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-y"
        />
      </div>

      {/* 4. Sticky Bottom Action Bar (Specially Designed for Mobile 360px - 430px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-3 sm:p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Total Calculated Score Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-base shrink-0">
              <Award size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                Weighted Total
              </div>
              <div className="text-lg sm:text-xl font-black text-foreground leading-tight font-mono">
                {weightedScore.toFixed(1)}
                <span className="text-xs font-normal text-muted-foreground ml-1">/100</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitEvaluation(true)}
              className="px-3 sm:px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="hidden sm:inline">Save </span>Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitEvaluation(false)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <Send size={15} />
              <span>{submitting ? "Submitting..." : "Submit Evaluation"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
