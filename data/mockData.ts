import { Submission, Score, Criteria } from '../types/judging';

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-001',
    title: 'EcoTrack - Carbon Footprint Monitor',
    description: 'A real-time carbon footprint tracking application that helps individuals and businesses monitor and reduce their environmental impact.',
    demoUrl: 'https://example.com/demo1',
    writeup: 'Our team built a comprehensive solution that integrates with IoT devices to track energy consumption, transportation habits, and daily activities. The app provides personalized recommendations and gamification elements to encourage sustainable behavior.',
    reflection: 'We faced challenges with real-time data synchronization and learned a lot about WebSocket implementation. Future plans include ML-based prediction models and corporate partnerships.',
    teamSize: 4,
  },
  {
    id: 'sub-002',
    title: 'MediConnect - Healthcare Bridge',
    description: 'A telemedicine platform connecting patients in rural areas with healthcare professionals through AI-powered triage and scheduling.',
    demoUrl: 'https://example.com/demo2',
    writeup: 'MediConnect addresses the healthcare accessibility gap by providing a seamless interface for virtual consultations. Features include symptom checker, appointment scheduling, prescription management, and emergency routing.',
    reflection: 'Security and HIPAA compliance were our biggest learning curves. We plan to integrate with existing EHR systems and expand language support.',
    teamSize: 5,
  },
  {
    id: 'sub-003',
    title: 'CodeCollab - Real-time Pair Programming',
    description: 'An innovative collaborative coding platform with AI-assisted code review and real-time mentorship features.',
    demoUrl: 'https://example.com/demo3',
    writeup: 'Built with WebRTC for peer-to-peer connections and operational transforms for conflict-free editing. Includes voice chat, screen sharing, and an AI assistant that provides context-aware suggestions.',
    reflection: 'Handling network latency and ensuring consistent state across multiple clients was challenging. Next steps include mobile support and integration with popular IDEs.',
    teamSize: 3,
  },
  {
    id: 'sub-004',
    title: 'FinanceAI - Personal Budget Assistant',
    description: 'An AI-powered personal finance manager that analyzes spending patterns and provides actionable insights for better financial health.',
    demoUrl: 'https://example.com/demo4',
    writeup: 'Uses machine learning to categorize transactions, detect anomalies, and predict future expenses. Includes goal setting, investment recommendations, and automated savings features.',
    reflection: 'Data privacy was a major consideration. We implemented end-to-end encryption. Future enhancements include cryptocurrency tracking and tax optimization.',
    teamSize: 4,
  },
  {
    id: 'sub-005',
    title: 'EduQuest - Gamified Learning Platform',
    description: 'A gamified educational platform that transforms traditional curriculum into interactive quests and challenges.',
    demoUrl: 'https://example.com/demo5',
    writeup: 'EduQuest uses game mechanics like XP, achievements, and leaderboards to make learning engaging. Teachers can create custom quests aligned with their curriculum, and students progress at their own pace.',
    reflection: 'Balancing fun with educational value was tricky. We learned about learning theory and cognitive load. Plans include VR integration and adaptive difficulty.',
    teamSize: 4,
  },
];

// Mock existing scores from other judges
export const MOCK_EXISTING_SCORES: Score[] = [
  {
    submissionId: 'sub-001',
    judgeName: 'Judge Sarah',
    criteria: {
      innovation: 85,
      technical: 78,
      completeness: 82,
      presentation: 90,
      reflection: 88,
    },
    timestamp: new Date('2026-03-07T10:30:00'),
  },
  {
    submissionId: 'sub-001',
    judgeName: 'Judge Michael',
    criteria: {
      innovation: 88,
      technical: 82,
      completeness: 85,
      presentation: 87,
      reflection: 85,
    },
    timestamp: new Date('2026-03-07T14:20:00'),
  },
  {
    submissionId: 'sub-002',
    judgeName: 'Judge Sarah',
    criteria: {
      innovation: 92,
      technical: 85,
      completeness: 88,
      presentation: 85,
      reflection: 90,
    },
    timestamp: new Date('2026-03-07T11:00:00'),
  },
  {
    submissionId: 'sub-003',
    judgeName: 'Judge Michael',
    criteria: {
      innovation: 90,
      technical: 92,
      completeness: 85,
      presentation: 82,
      reflection: 87,
    },
    timestamp: new Date('2026-03-07T15:00:00'),
  },
];
