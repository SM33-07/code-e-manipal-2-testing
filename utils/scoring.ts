import { Criteria, WEIGHTS } from '@/types/judging';

export function calculateWeightedScore(criteria: Criteria): number {
  return (
    criteria.innovation * WEIGHTS.innovation +
    criteria.technical * WEIGHTS.technical +
    criteria.presentation * WEIGHTS.presentation +
    criteria.impact * WEIGHTS.impact
  );
}
