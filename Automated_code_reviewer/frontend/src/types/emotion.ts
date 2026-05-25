/** Frontend types mirroring backend emotion API contracts */

export type ReviewTone = 'empathetic' | 'educational' | 'direct' | 'concise';

export type SentimentLevel = 'positive' | 'neutral' | 'stressed' | 'frustrated' | 'burned_out';

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'staff';

export type FatigueLevel = 'low' | 'moderate' | 'high' | 'critical';

export type WorkloadLevel = 'light' | 'balanced' | 'heavy' | 'overloaded';

export interface EmotionAnalysisResult {
  developerId: string;
  sentiment: SentimentLevel;
  fatigue: FatigueLevel;
  workload: WorkloadLevel;
  experienceLevel: ExperienceLevel;
  recommendedTone: ReviewTone;
  confidence: number;
  insights: string[];
  energyScore: number;
  suggestedReviewerIds: string[];
  twinSummary: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  expertise: string[];
  emotion: EmotionAnalysisResult;
  lastActive: string;
}

export interface TeamAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  developerId?: string;
}

export interface TeamHealthSnapshot {
  teamId: string;
  averageEnergy: number;
  burnoutRiskCount: number;
  sentimentDistribution: Record<SentimentLevel, number>;
  toneRecommendations: Record<ReviewTone, number>;
  members: TeamMember[];
  healthScore: number;
  alerts: TeamAlert[];
  updatedAt: string;
}

export interface PRComment {
  id: string;
  author: string;
  body: string;
  line: number;
  tone: ReviewTone;
}

export interface PRReviewContext {
  prId: string;
  title: string;
  author: TeamMember;
  suggestedReviewers: TeamMember[];
  diff: string;
  comments: PRComment[];
}

export interface EmotionAnalyzeResponse {
  analysis: EmotionAnalysisResult;
  author: TeamMember;
  teamHealth: TeamHealthSnapshot;
  suggestedReviewers: TeamMember[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
