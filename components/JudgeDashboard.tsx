"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, FileText } from "lucide-react";

import { SubmissionList, JudgeSubmission } from "./SubmissionList";
import { JudgingInterface } from "./JudgingInterface";
import { Leaderboard } from "./Leaderboard";

import { Score } from "@/types/judging";

interface Props {
  judgeId: string;
  judgeName: string;
  onLogout: () => void;
}

export function JudgeDashboard({ judgeId, judgeName, onLogout }: Props) {
  const [submissions, setSubmissions] = useState<JudgeSubmission[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/judging/assignments");
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : [];

      const mapped: JudgeSubmission[] = data.map((a: any) => {
        const sub = a.submissions ?? {};
        return {
          id: sub.id ?? a.submission_id,
          title: sub.title ?? "Untitled",
          description: sub.description ?? sub.summary ?? "",
          writeup: sub.description ?? "",
          reflection: sub.technical_challenges ?? "",
          demoUrl: sub.demo_video_url ?? sub.demo_url ?? "",
          teamSize: 1,
          judged: a.reviewed ?? false,
        };
      });

      setSubmissions(mapped);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubmission = submissions.find(
    (s) => s.id === selectedSubmissionId
  );

  const existingScore = selectedSubmissionId
    ? allScores.find((s) => s.submissionId === selectedSubmissionId)
    : undefined;

  const handleSaveScore = async (score: Score) => {
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
      setSelectedSubmissionId(null);
    } catch (err) {
      console.error("Save score error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] p-6 flex items-center justify-center">
        <p className="text-[#A08070] font-medium text-sm">Loading your assignments...</p>
      </div>
    );
  }

  if (selectedSubmission) {
    return (
      <JudgingInterface
        submission={selectedSubmission}
        judgeId={judgeId}
        existingScore={existingScore}
        onSave={handleSaveScore}
        onBack={() => setSelectedSubmissionId(null)}
      />
    );
  }

  return (
    <div className="w-full pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 mt-4">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="logo" width={60} height={60} className="w-12 h-12 sm:w-[60px] sm:h-[60px]" />
            <div>
              <h1
                className="text-3xl sm:text-[42px] md:text-[52px] leading-none font-bold tracking-tight text-[#F5EFE0]"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Judge Panel
              </h1>
              <p className="text-lg sm:text-[20px] font-medium text-[#A08070] mt-1 sm:mt-2">
                Welcome, {judgeName}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="
              w-full sm:w-auto
              h-12 sm:h-[50px]
              rounded-xl sm:rounded-[14px]
              border border-[#C9A227]/30
              bg-transparent
              text-[#D4732A] text-base sm:text-[16px] font-bold
              shadow-md hover:-translate-y-[1px]
              hover:bg-[#C9A227]/10
              transition-all px-6
            "
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#C9A227]" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="bg-transparent flex flex-col sm:flex-row gap-3 sm:gap-5 h-auto p-0 mb-8 overflow-x-auto">
            <TabsTrigger
              value="submissions"
              className="
                w-full sm:w-auto px-6
                h-12 sm:h-[52px]
                rounded-xl sm:rounded-[14px]
                border border-[#C9A227]/30
                bg-[#1A1F4B]
                text-[#F5EFE0] text-base sm:text-[18px] font-bold
                shadow-md data-[state=active]:bg-[#1A1F4B]
                data-[state=active]:border-[#F0C060] data-[state=active]:text-[#F0C060]
                hover:-translate-y-[1px] transition-all
                whitespace-nowrap flex-1 sm:flex-none
              "
            >
              <Award className="w-5 h-5 mr-2 sm:mr-3 text-[#F0C060]" />
              My Submissions
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="
                w-full sm:w-auto px-6
                h-12 sm:h-[52px]
                rounded-xl sm:rounded-[14px]
                border border-[#C9A227]/20
                bg-[#1E1208]
                text-[#A08070] text-base sm:text-[18px] font-semibold
                hover:bg-[#C9A227]/10 transition-all shadow-sm
                whitespace-nowrap flex-1 sm:flex-none
              "
            >
              <FileText className="w-5 h-5 mr-2 sm:mr-3 text-[#C9A227]" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="mt-0 outline-none">
            <SubmissionList
              submissions={submissions}
              onSelectSubmission={setSelectedSubmissionId}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0 outline-none">
            <Leaderboard submissions={submissions} scores={allScores} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
