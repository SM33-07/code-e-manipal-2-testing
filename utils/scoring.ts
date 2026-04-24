import { Score, AggregatedScore, Criteria, WEIGHTS } from '../types/judging';

export function calculateWeightedScore(criteria: Criteria): number {
  return (
    criteria.innovation * WEIGHTS.innovation +
    criteria.technical * WEIGHTS.technical +
    criteria.completeness * WEIGHTS.completeness +
    criteria.presentation * WEIGHTS.presentation +
    criteria.reflection * WEIGHTS.reflection
  );
}

export function aggregateScores(scores: Score[]): Map<string, AggregatedScore> {
  const aggregated = new Map<string, AggregatedScore>();

  // Group scores by submission
  const scoresBySubmission = scores.reduce((acc, score) => {
    if (!acc[score.submissionId]) {
      acc[score.submissionId] = [];
    }
    acc[score.submissionId].push(score);
    return acc;
  }, {} as Record<string, Score[]>);

  // Calculate averages for each submission
  Object.entries(scoresBySubmission).forEach(([submissionId, submissionScores]) => {
    const count = submissionScores.length;
    
    // Average each criterion
    const avgCriteria: Criteria = {
      innovation: submissionScores.reduce((sum, s) => sum + s.criteria.innovation, 0) / count,
      technical: submissionScores.reduce((sum, s) => sum + s.criteria.technical, 0) / count,
      completeness: submissionScores.reduce((sum, s) => sum + s.criteria.completeness, 0) / count,
      presentation: submissionScores.reduce((sum, s) => sum + s.criteria.presentation, 0) / count,
      reflection: submissionScores.reduce((sum, s) => sum + s.criteria.reflection, 0) / count,
    };

    const averageScore = calculateWeightedScore(avgCriteria);

    aggregated.set(submissionId, {
      submissionId,
      averageScore,
      innovationScore: avgCriteria.innovation,
      judgeCount: count,
      breakdown: avgCriteria,
    });
  });

  return aggregated;
}

export function rankSubmissions(aggregatedScores: AggregatedScore[]): AggregatedScore[] {
  return aggregatedScores.sort((a, b) => {
    // First sort by average score
    if (Math.abs(a.averageScore - b.averageScore) > 0.01) {
      return b.averageScore - a.averageScore;
    }
    // Tiebreaker: highest innovation score wins
    return b.innovationScore - a.innovationScore;
  });
}
