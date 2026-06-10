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
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="logo" width={48} height={48} />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Judge Panel
              </h1>
              <p className="text-gray-400">
                Welcome, {judgeName}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="bg-white/10 border-white/20 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="submissions">
              <FileText className="w-4 h-4 mr-2" />
              My Submissions
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Award className="w-4 h-4 mr-2" />
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
