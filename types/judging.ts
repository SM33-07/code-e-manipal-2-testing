export interface Submission {
  id: string;
  title: string;
  description: string;
  demoUrl: string;
  writeup: string;
  reflection: string;
  // Team info hidden for blind judging
  teamSize: number;
}

export interface Criteria {
  innovation: number;
  technical: number;
  completeness: number;
  presentation: number;
  reflection: number;
}

export interface Score {
  submissionId: string;
  judgeName: string;
  criteria: Criteria;
  timestamp: Date;
}

export interface AggregatedScore {
  submissionId: string;
  averageScore: number;
  innovationScore: number;
  judgeCount: number;
  breakdown: Criteria;
}

export const WEIGHTS = {
  innovation: 0.30,
  technical: 0.30,
  completeness: 0.20,
  presentation: 0.10,
  reflection: 0.10,
};

export const CRITERIA_NAMES = {
  innovation: 'Innovation',
  technical: 'Technical Implementation',
  completeness: 'Completeness',
  presentation: 'Presentation',
  reflection: 'Reflection/Roadmap',
};

export const CRITERIA_DESCRIPTIONS = {
  innovation: 'Novelty and originality of the solution.',
  technical: 'Quality of code, architecture, and complexity.',
  completeness: 'How close the project is to a fully functioning prototype.',
  presentation: 'Clarity and quality of the demo video and write-up.',
  reflection: 'Depth of understanding of challenges and future vision.',
};
