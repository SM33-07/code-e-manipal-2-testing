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
    judgeId: 'judge-sarah',
    criteria: { innovation: 8, technical: 7, presentation: 9, impact: 8 },
    feedback: 'Great work overall.',
    isComplete: true,
  },
  {
    submissionId: 'sub-001',
    judgeId: 'judge-michael',
    criteria: { innovation: 9, technical: 8, presentation: 9, impact: 8 },
    feedback: 'Excellent technical execution.',
    isComplete: true,
  },
  {
    submissionId: 'sub-002',
    judgeId: 'judge-sarah',
    criteria: { innovation: 9, technical: 8, presentation: 8, impact: 9 },
    feedback: 'Strong social impact potential.',
    isComplete: true,
  },
  {
    submissionId: 'sub-003',
    judgeId: 'judge-michael',
    criteria: { innovation: 9, technical: 9, presentation: 8, impact: 8 },
    feedback: 'Polished demo and codebase.',
    isComplete: true,
  },
];
