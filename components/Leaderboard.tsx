import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trophy, Medal, Award, Zap } from 'lucide-react';
import { Submission, Score } from '../types/judging';
import { aggregateScores, rankSubmissions } from '../utils/scoring';

interface LeaderboardProps {
  submissions: Submission[];
  scores: Score[];
}

export function Leaderboard({ submissions, scores }: LeaderboardProps) {
  const rankings = useMemo(() => {
    const aggregated = aggregateScores(scores);
    const scoresArray = Array.from(aggregated.values());
    return rankSubmissions(scoresArray);
  }, [scores]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getSubmissionTitle = (id: string) => {
    return submissions.find((s) => s.id === id)?.title || 'Unknown';
  };

  // Check for ties in the top positions
  const hasTiebreaker = (rank: number) => {
    if (rank >= rankings.length) return false;
    const current = rankings[rank];
    const next = rankings[rank + 1];
    if (!next) return false;
    return Math.abs(current.averageScore - next.averageScore) < 0.01;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Final Rankings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Ranked by average weighted score. Ties broken by Innovation score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-gray-300">Rank</TableHead>
                  <TableHead className="text-gray-300">Submission</TableHead>
                  <TableHead className="text-gray-300 text-center">Judges</TableHead>
                  <TableHead className="text-gray-300 text-center">Innovation</TableHead>
                  <TableHead className="text-gray-300 text-center">Technical</TableHead>
                  <TableHead className="text-gray-300 text-center">Completeness</TableHead>
                  <TableHead className="text-gray-300 text-center">Presentation</TableHead>
                  <TableHead className="text-gray-300 text-center">Reflection</TableHead>
                  <TableHead className="text-gray-300 text-right">Final Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((ranking, index) => {
                  const rank = index + 1;
                  const showTiebreaker = index > 0 && hasTiebreaker(index - 1);

                  return (
                    <TableRow
                      key={ranking.submissionId}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          <span className="text-white text-lg">{rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {getSubmissionTitle(ranking.submissionId)}
                          </span>
                          {showTiebreaker && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-500/20 text-yellow-300 border-0 text-xs w-fit mt-1"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Tiebreaker Applied
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-white/20 text-gray-300">
                          {ranking.judgeCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {ranking.breakdown.innovation.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {ranking.breakdown.technical.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {ranking.breakdown.completeness.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {ranking.breakdown.presentation.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {ranking.breakdown.reflection.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-white font-bold text-lg">
                          {ranking.averageScore.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Info */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Scoring Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-gray-300">
              <span className="font-semibold text-white">Weighted Criteria:</span> Innovation (30%), 
              Technical Implementation (30%), Completeness (20%), Presentation (10%), Reflection (10%)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-gray-300">
              <span className="font-semibold text-white">Score Averaging:</span> Final score is the simple 
              average of all judges' weighted scores
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0" />
            <p className="text-gray-300">
              <span className="font-semibold text-white">Tiebreaker Rule:</span> If final scores are tied, 
              the submission with the highest Innovation score ranks higher
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
