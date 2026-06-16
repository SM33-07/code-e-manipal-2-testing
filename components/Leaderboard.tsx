import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trophy, Medal, Award } from 'lucide-react';
import { Score } from '@/types/judging';
import { calculateWeightedScore } from '@/utils/scoring';
import { JudgeSubmission } from './SubmissionList';

interface LeaderboardProps {
  submissions: JudgeSubmission[];
  scores: Score[];
}

export function Leaderboard({ submissions, scores }: LeaderboardProps) {
  const rankings = useMemo(() => {
    const withScores = scores
      .filter((s) => s.isComplete)
      .map((s) => {
        const sub = submissions.find((sub) => sub.id === s.submissionId);
        return {
          submissionId: s.submissionId,
          title: sub?.title ?? 'Unknown',
          weightedScore: calculateWeightedScore(s.criteria),
          criteria: s.criteria,
        };
      });

    return withScores.sort((a, b) => b.weightedScore - a.weightedScore);
  }, [scores, submissions]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1E1208] border-[#C9A227]/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#F5EFE0] text-2xl flex items-center gap-2 font-serif">
            <Trophy className="w-6 h-6 text-[#F0C060]" />
            Your Rankings
          </CardTitle>
          <CardDescription className="text-[#A08070]">
            Your scored submissions ranked by weighted score (out of 10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-[#A08070] text-sm text-center py-4">
              No submissions scored yet. Start judging to see rankings.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#C9A227]/20 hover:bg-transparent">
                    <TableHead className="text-[#A08070]">Rank</TableHead>
                    <TableHead className="text-[#A08070]">Submission</TableHead>
                    <TableHead className="text-[#A08070] text-center">Innovation</TableHead>
                    <TableHead className="text-[#A08070] text-center">Technical</TableHead>
                    <TableHead className="text-[#A08070] text-center">Presentation</TableHead>
                    <TableHead className="text-[#A08070] text-center">Impact</TableHead>
                    <TableHead className="text-[#A08070] text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((r, i) => (
                    <TableRow key={r.submissionId} className="border-[#C9A227]/20 hover:bg-[#C9A227]/10 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(i + 1)}
                          <span className="text-[#F5EFE0] text-lg">{i + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#F5EFE0] font-medium">{r.title}</span>
                      </TableCell>
                      <TableCell className="text-center text-[#A08070]">{r.criteria.innovation}</TableCell>
                      <TableCell className="text-center text-[#A08070]">{r.criteria.technical}</TableCell>
                      <TableCell className="text-center text-[#A08070]">{r.criteria.presentation}</TableCell>
                      <TableCell className="text-center text-[#A08070]">{r.criteria.impact}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-[#F0C060] font-bold text-lg">
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

      <Card className="bg-[#1E1208] border-[#C9A227]/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#F5EFE0] font-serif">Scoring Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-[#D4732A] rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-[#A08070]">
              <span className="font-semibold text-[#F5EFE0]">Weighted Criteria:</span> Innovation (30%),
              Technical (30%), Presentation (20%), Impact (20%)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-[#D4732A] rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-[#A08070]">
              <span className="font-semibold text-[#F5EFE0]">Scale:</span> Each criterion scored 1–10
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
