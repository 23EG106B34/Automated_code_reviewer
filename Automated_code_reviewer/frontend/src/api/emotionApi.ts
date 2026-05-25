import type {
  ApiResponse,
  EmotionAnalyzeResponse,
} from '@/types/emotion';
import { DEMO_ANALYZE_PAYLOAD } from '@/data/mockPRSession';

export interface EmotionAnalyzeRequest {
  developerId: string;
  developerName: string;
  signals: {
    commitFrequency: number;
    avgSessionHours: number;
    prTurnaroundHours: number;
    commentSentimentScore: number;
    lateNightCommits: number;
    reviewBacklog: number;
    linesChangedThisWeek: number;
  };
  recentComments?: string[];
  prTitle?: string;
  prDescription?: string;
  requiredExpertise?: string[];
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = (await res.json()) as ApiResponse<T> | { success: false; error: string };
  if (!res.ok || !('data' in json)) {
    throw new Error('error' in json ? json.error : 'Emotion analysis failed');
  }
  return json.data;
}

export const emotionApi = {
  /**
   * Primary emotion API — analyzes developer state, tone, team health, reviewers.
   */
  analyze: (payload: EmotionAnalyzeRequest = DEMO_ANALYZE_PAYLOAD) =>
    fetchApi<EmotionAnalyzeResponse>('/api/emotion/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const emotionKeys = {
  analyze: ['emotion', 'analyze'] as const,
};
