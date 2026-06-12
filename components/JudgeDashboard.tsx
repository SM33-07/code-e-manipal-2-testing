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

      // Mark submission as judged locally
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
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-white/50 text-sm">Loading your assignments...</p>
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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 ml-24 mt-4">
            <Image src="/logo.png" alt="logo" width={60} height={60} />
            <div>
             <h1
  className="text-[52px] leading-[0.95] font-bold tracking-[-1.5px] text-[#7A002C]"
  style={{
    fontFamily: "Cormorant Garamond, serif",
    textShadow: "0 2px 4px rgba(255,255,255,0.3)",
  }}
>
                Judge Panel
              </h1>
             <p className="text-[20px] font-medium text-[#8A6A50] mt-2">
                Welcome, {judgeName}
              </p>
            </div>
          </div>
          <Button
  variant="outline"
  onClick={onLogout}
  className="
    mr-24 mt-4
    w-[120px]
    h-[60px]
    rounded-[18px]
    border-2
    border-[#D6A654]
    bg-gradient-to-b
    from-[#9C0038]
    to-[#7C002B]
    text-[#FFF7ED]
    text-[18px]
    font-bold
    shadow-[0_8px_18px_rgba(122,0,44,0.22)]
    hover:translate-y-[-1px]
    hover:from-[#AD0040]
    hover:to-[#850030]
    transition-all
  "
>
            <LogOut className="w-5 h-5 mr-2 text-[#E2B45D]" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="submissions" className="space-y-10 ml-24">
          <TabsList className="bg-transparent gap-5 h-auto p-0">
           <TabsTrigger
  value="submissions"
  className="
    w-[230px]
    h-[52px]
    rounded-[18px]
    border
    border-[#D4A14B]
    bg-gradient-to-b
    from-[#A0003A]
    to-[#87002F]
    text-[#FFF6EC]
    text-[18px]
    font-bold
    shadow-[0_8px_20px_rgba(122,0,44,0.22)]
    data-[state=active]:bg-gradient-to-b
    data-[state=active]:from-[#A0003A]
    data-[state=active]:to-[#87002F]
    hover:translate-y-[-1px]
    transition-all
  "
>
              <Award className="w-5 h-5 mr-3 text-[#B57D2F]" />
              My Submissions
            </TabsTrigger>
           <TabsTrigger
  value="leaderboard"
  className="
    w-[230px]
    h-[52px]
    rounded-[18px]
    border-2
    border-[#D9AE63]
    bg-[rgba(255,250,244,0.88)]
    text-[#A26A22]
    text-[18px]
    font-semibold
    hover:bg-[#FFF4E6]
    transition-all
  "
>
              <FileText className="w-5 h-5 mr-3 text-[#E2B45D]" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <SubmissionList
              submissions={submissions}
              onSelectSubmission={setSelectedSubmissionId}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard submissions={submissions} scores={allScores} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
