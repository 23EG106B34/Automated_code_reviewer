/** Shared emotion & team dynamics types for the API layer */

export type ReviewTone = 'empathetic' | 'educational' | 'direct' | 'concise';

export type SentimentLevel = 'positive' | 'neutral' | 'stressed' | 'frustrated' | 'burned_out';

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'staff';

export type FatigueLevel = 'low' | 'moderate' | 'high' | 'critical';

export type WorkloadLevel = 'light' | 'balanced' | 'heavy' | 'overloaded';

export interface DeveloperSignals {
  commitFrequency: number;
  avgSessionHours: number;
  prTurnaroundHours: number;
  commentSentimentScore: number;
  lateNightCommits: number;
  reviewBacklog: number;
  linesChangedThisWeek: number;
}

export interface EmotionAnalysisInput {
  developerId: string;
  developerName: string;
  signals: DeveloperSignals;
  recentComments?: string[];
  prTitle?: string;
  prDescription?: string;
}

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

export interface TeamAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  developerId?: string;
}

export interface AnalyzeEmotionRequest {
  developerId: string;
  developerName: string;
  signals: DeveloperSignals;
  recentComments?: string[];
  prTitle?: string;
  prDescription?: string;
  requiredExpertise?: string[];
}

/** Response from POST /api/emotion/analyze */
export interface EmotionAnalyzeResponse {
  analysis: EmotionAnalysisResult;
  author: TeamMember;
  teamHealth: TeamHealthSnapshot;
  suggestedReviewers: TeamMember[];
}

export interface SuggestReviewerRequest {
  prAuthorId: string;
  requiredExpertise: string[];
  teamMemberIds: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  timestamp: string;
}
