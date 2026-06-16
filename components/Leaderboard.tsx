"use client";

import { useMemo, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Trophy, Medal, Award } from "lucide-react";
import { Score } from "@/types/judging";
import { calculateWeightedScore } from "@/utils/scoring";
import { JudgeSubmission } from "./SubmissionList";

interface LeaderboardProps {
  submissions: JudgeSubmission[];
  scores: Score[];
}

export function Leaderboard({ submissions, scores }: LeaderboardProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rankings = useMemo(() => {
    const withScores = scores
      .filter((s) => s.isComplete)
      .map((s) => {
        const sub = submissions.find((sub) => sub.id === s.submissionId);
        return {
          submissionId: s.submissionId,
          title: sub?.title ?? "Unknown",
          weightedScore: calculateWeightedScore(s.criteria),
          criteria: s.criteria,
        };
      });

    return withScores.sort((a, b) => b.weightedScore - a.weightedScore);
  }, [scores, submissions]);

  if (!mounted) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse w-full max-w-2xl h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-neutral-400 dark:text-neutral-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600 dark:text-amber-500" />;
      default:
        return null;
    }
  };

  // Color classes mapping
  const cardBg = isDark ? "bg-[#1E1208] border-[#C9A227]/20" : "bg-[#FCF6EF] border-[#EBCFB5]";
  const textHeading = isDark ? "text-[#F5EFE0]" : "text-[#6A4635]";
  const textSub = isDark ? "text-[#A08070]" : "text-[#7A5A4A]";
  const borderClass = isDark ? "border-[#C9A227]/10" : "border-[#EBCFB5]/50";
  const hoverClass = isDark ? "hover:bg-[#C9A227]/5" : "hover:bg-[#8F102A]/5";

  return (
    <div className="space-y-6">
      <Card className={`border shadow-sm rounded-2xl ${cardBg}`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-2xl font-serif font-bold flex items-center gap-2.5 ${textHeading}`}>
            <Trophy className="w-6 h-6 text-[#8F102A] dark:text-[#F0C060]" />
            Your Rankings
          </CardTitle>
          <CardDescription className={textSub}>
            Your scored submissions ranked by weighted score (out of 10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-center py-12 text-sm font-medium text-[#A08070] dark:text-[#A08070]/60">
              No submissions scored yet. Start grading to see rankings.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow className={`${borderClass} hover:bg-transparent`}>
                    <TableHead className="w-[80px] font-bold text-xs uppercase tracking-wider text-[#B89A85] dark:text-[#A08070]">Rank</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-[#B89A85] dark:text-[#A08070]">Submission</TableHead>
                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider text-[#B89A85] dark:text-[#A08070]">Innovation</TableHead>
                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider text-[#B89A85] dark:text-[#A08070]">Technical</TableHead>
                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider text-[#B89A85] dark:text-[#A08070]">Presentation</TableHead>
                    <TableHead className="text-center font-bold text-xs uppercase tracking-wider text-[#B89A85] dark:text-[#A08070]">Impact</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-[#B89A85] dark:text-[#A08070]">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((r, i) => (
                    <TableRow
                      key={r.submissionId}
                      className={`
                        ${borderClass} ${hoverClass}
                        transition-all duration-200
                      `}
                    >
                      <TableCell className="font-semibold py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(i + 1)}
                          <span className={`text-base font-serif ${textHeading}`}>{i + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`font-semibold text-sm ${textHeading}`}>{r.title}</span>
                      </TableCell>
                      <TableCell className={`text-center py-4 font-medium text-sm ${textSub}`}>{r.criteria.innovation}</TableCell>
                      <TableCell className={`text-center py-4 font-medium text-sm ${textSub}`}>{r.criteria.technical}</TableCell>
                      <TableCell className={`text-center py-4 font-medium text-sm ${textSub}`}>{r.criteria.presentation}</TableCell>
                      <TableCell className={`text-center py-4 font-medium text-sm ${textSub}`}>{r.criteria.impact}</TableCell>
                      <TableCell className="text-right py-4">
                        <span className="text-[#8F102A] dark:text-[#F0C060] font-black text-base font-serif">
                          {r.weightedScore.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`border shadow-sm rounded-2xl ${cardBg}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-lg font-serif font-bold ${textHeading}`}>Scoring Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3.5 text-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 bg-[#8F102A] dark:bg-[#D4732A] rounded-full mt-1.5 flex-shrink-0" />
            <p className={textSub}>
              <span className={`font-semibold ${textHeading}`}>Weighted Criteria:</span> Innovation (30%),
              Technical (30%), Presentation (20%), Impact (20%)
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 bg-[#8F102A] dark:bg-[#D4732A] rounded-full mt-1.5 flex-shrink-0" />
            <p className={textSub}>
              <span className={`font-semibold ${textHeading}`}>Scale:</span> Each criterion is scored on a raw 1–10 scale.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
