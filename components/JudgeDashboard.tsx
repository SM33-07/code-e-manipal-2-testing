"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, FileText } from "lucide-react";

import { SubmissionList } from "./SubmissionList";
import { JudgingInterface } from "./JudgingInterface";
import { Leaderboard } from "./Leaderboard";

import { MOCK_SUBMISSIONS, MOCK_EXISTING_SCORES } from "@/data/mockData";
import { Score } from "@/types/judging";

interface Props {
  judgeName: string;
  onLogout: () => void;
}

export function JudgeDashboard({ judgeName, onLogout }: Props) {

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [scores, setScores] = useState<Score[]>(MOCK_EXISTING_SCORES);

  const selectedSubmission = useMemo(
    () => MOCK_SUBMISSIONS.find((s) => s.id === selectedSubmissionId),
    [selectedSubmissionId]
  );

  const currentJudgeScores = useMemo(
    () => scores.filter((s) => s.judgeName === judgeName),
    [scores, judgeName]
  );

  const handleSaveScore = (score: Score) => {

    const filteredScores = scores.filter(
      (s) =>
        !(
          s.submissionId === score.submissionId &&
          s.judgeName === judgeName
        )
    );

    setScores([...filteredScores, score]);
    setSelectedSubmissionId(null);
  };

  if (selectedSubmission) {

    const existingScore = currentJudgeScores.find(
      (s) => s.submissionId === selectedSubmission.id
    );

    return (
      <JudgingInterface
        submission={selectedSubmission}
        judgeName={judgeName}
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
              Submissions
            </TabsTrigger>

            <TabsTrigger value="leaderboard">
              <Award className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>

          </TabsList>

          <TabsContent value="submissions">

            <SubmissionList
              submissions={MOCK_SUBMISSIONS}
              judgedSubmissionIds={currentJudgeScores.map((s) => s.submissionId)}
              onSelectSubmission={setSelectedSubmissionId}
            />

          </TabsContent>

          <TabsContent value="leaderboard">

            <Leaderboard submissions={MOCK_SUBMISSIONS} scores={scores} />

          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
