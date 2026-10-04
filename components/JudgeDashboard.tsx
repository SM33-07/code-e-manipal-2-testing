"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, FileText, CheckSquare } from "lucide-react";

import { SubmissionList, JudgeSubmission } from "./SubmissionList";
import { JudgingInterface } from "./JudgingInterface";
import { Leaderboard } from "./Leaderboard";
import { Confetti } from "./ui/Confetti";
import { SuccessSummaryCard } from "./SuccessSummaryCard";
import { JudgeHeader } from "./judge/JudgeHeader";
import { Score } from "@/types/judging";
import { calculateWeightedScore } from "@/utils/scoring";

interface Props {
  judgeId: string;
  judgeName: string;
  onLogout: () => void;
}

export function JudgeDashboard({ judgeId, judgeName, onLogout }: Props) {
  const [mounted, setMounted] = useState(false);

  const [submissions, setSubmissions] = useState<JudgeSubmission[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "graded">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Dismiss Celebration overlay state
  const [dismissedCelebration, setDismissedCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("submissions");

  useEffect(() => {
    setMounted(true);
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/judging/assignments");
      if (!res.ok) {
        throw new Error(`Failed to fetch assignments: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : [];

      const mapped: JudgeSubmission[] = data.map((a: any, idx: number) => {
        const sub = a.submissions ?? {};
        const label = `Project ${String.fromCharCode(65 + idx)}`;
        return {
          id: sub.id ?? a.submission_id,
          title: label,
          description: sub.description ?? sub.summary ?? "",
          writeup: sub.description ?? "",
          reflection: sub.technical_challenges ?? "",
          demoUrl: sub.demo_video_url ?? sub.demo_url ?? "",
          teamSize: 1,
          judged: a.reviewed ?? false,
        };
      });

      setSubmissions(mapped);

      const reviewsRes = await fetch("/api/judging/reviews");
      if (!reviewsRes.ok) {
        throw new Error(`Failed to fetch reviews: ${reviewsRes.status} ${reviewsRes.statusText}`);
      }
      const reviewsJson = await reviewsRes.json();
      const reviewsData = Array.isArray(reviewsJson.data) ? reviewsJson.data : [];
      setAllScores(reviewsData);

    } catch (err) {
      console.error("Failed to load assignments or reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const allCount = submissions.length;
  const gradedCount = submissions.filter((s) => s.judged).length;
  const pendingCount = allCount - gradedCount;
  const progressPercent = allCount > 0 ? (gradedCount / allCount) * 100 : 0;
  const isAllGraded = allCount > 0 && gradedCount === allCount;

  // Auto-switch to leaderboard tab when all are graded
  useEffect(() => {
    if (isAllGraded) {
      setActiveTab("leaderboard");
    }
  }, [isAllGraded]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "graded" && s.judged) ||
        (statusFilter === "pending" && !s.judged);

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / itemsPerPage));
  const activePageSubmissions = useMemo(() => {
    const adjustedPage = Math.min(currentPage, totalPages);
    const startIndex = (adjustedPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubmissions, currentPage, totalPages]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredSubmissions, totalPages, currentPage]);

  const topThreeRanked = useMemo(() => {
    return allScores
      .filter((s) => s.isComplete)
      .map((s) => {
        const sub = submissions.find((subItem) => subItem.id === s.submissionId);
        return {
          id: s.submissionId,
          title: sub?.title ?? "Untitled Project",
          score: calculateWeightedScore(s.criteria),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [allScores, submissions]);

  const showCelebration = allCount > 0 && gradedCount === allCount && !dismissedCelebration;

  const selectedIndexInFiltered = useMemo(() => {
    if (!selectedSubmissionId) return -1;
    return filteredSubmissions.findIndex((s) => s.id === selectedSubmissionId);
  }, [selectedSubmissionId, filteredSubmissions]);

  const hasNext = selectedIndexInFiltered !== -1 && selectedIndexInFiltered < filteredSubmissions.length - 1;
  const hasPrev = selectedIndexInFiltered > 0;

  const handleNextSubmission = () => {
    if (hasNext) {
      setSelectedSubmissionId(filteredSubmissions[selectedIndexInFiltered + 1].id);
    }
  };

  const handlePrevSubmission = () => {
    if (hasPrev) {
      setSelectedSubmissionId(filteredSubmissions[selectedIndexInFiltered - 1].id);
    }
  };

  const selectedSubmission = submissions.find(
    (s) => s.id === selectedSubmissionId
  );

  const existingScore = selectedSubmissionId
    ? allScores.find((s) => s.submissionId === selectedSubmissionId)
    : undefined;

  const handleSaveScore = async (score: Score, navigateToNext = false) => {
    try {
      const res = await fetch("/api/judging/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: score.submissionId,
          score_innovation: score.criteria.innovation,
          score_technical: score.criteria.technical,
          score_presentation: score.criteria.presentation,
          score_impact: score.criteria.impact,
          feedback: score.feedback,
          is_complete: score.isComplete,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === score.submissionId ? { ...s, judged: true } : s
        )
      );
      setAllScores((prev) => [
        ...prev.filter((s) => s.submissionId !== score.submissionId),
        score,
      ]);

      if (navigateToNext && hasNext) {
        handleNextSubmission();
      } else {
        setSelectedSubmissionId(null);
      }
    } catch (err) {
      console.error("Save score error:", err);
    }
  };

  const router = useRouter();

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-[50vh] p-6 flex items-center justify-center">
        <p className="text-muted-foreground font-semibold text-sm animate-pulse">Loading assigned submissions...</p>
      </div>
    );
  }

  return (
    <div className="text-foreground flex flex-col pb-16">

      {/* Celebration overlay */}
      {showCelebration && (
        <>
          <Confetti />
          <SuccessSummaryCard
            topThree={topThreeRanked}
            onClose={() => setDismissedCelebration(true)}
            onGoToLeaderboard={() => {
              setDismissedCelebration(true);
              setActiveTab("leaderboard");
            }}
          />
        </>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Workspace tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card flex flex-row gap-1 h-auto p-1 mb-6 border border-border rounded-xl justify-start">
            <TabsTrigger
              value="submissions"
              disabled={isAllGraded}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground"
            >
              <Award className="w-4 h-4 mr-2" />
              Submissions {isAllGraded && "(Completed)"}
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground"
            >
              <FileText className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Submissions Tab Workspace */}
          <TabsContent value="submissions" className="mt-0 outline-none">
            
            {/* Quick overview stats banner */}
            <div className="p-6 border border-border rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-card shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground m-0">
                    Evaluation Progress
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-0">
                    Review and score each assigned project.
                  </p>
                </div>
              </div>

              {/* Progress bar info */}
              <div className="w-full md:max-w-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-foreground">{gradedCount} / {allCount} projects</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filters and search container */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 pl-4 pr-4 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              {/* Status pills selector */}
              <div className="flex flex-wrap items-center gap-2">
                {([
                  { key: "all", label: "All Projects", count: allCount },
                  { key: "pending", label: "Pending", count: pendingCount },
                  { key: "graded", label: "Graded", count: gradedCount },
                ] as const).map((filter) => {
                  const isActive = statusFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      onClick={() => {
                        setStatusFilter(filter.key);
                        setCurrentPage(1);
                      }}
                      className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {filter.label}
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submission Grid Cards */}
            <SubmissionList
              submissions={activePageSubmissions}
              onSelectSubmission={(id) => router.push(`/judge/evaluate/${id}`)}
            />

            {/* Grid Pagination Actions */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-4 rounded-xl font-bold text-xs border-border text-foreground hover:bg-muted disabled:opacity-35"
                >
                  Previous
                </Button>
                <span className="text-xs font-bold text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-4 rounded-xl font-bold text-xs border-border text-foreground hover:bg-muted disabled:opacity-35"
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-0 outline-none">
            <Leaderboard submissions={submissions} scores={allScores} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
