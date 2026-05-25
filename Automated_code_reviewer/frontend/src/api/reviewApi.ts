import type { ApiResponse, EmotionAnalyzeResponse } from '@/types/emotion';

export interface CodeIssue {
  id: string;
  line: number;
  severity: 'error' | 'warning';
  title: string;
  problem: string;
  fix: string;
  snippet?: string;
}

export interface CodeReviewResult {
  ok: boolean;
  issueCount: number;
  summary: string;
  issues: CodeIssue[];
  fixedCode: string;
}

export interface FullReviewResponse {
  codeReview: CodeReviewResult;
  emotion: EmotionAnalyzeResponse;
  deliveryTip: string;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = 'error' in errorData ? errorData.error : `HTTP ${res.status}`;
      throw new Error(errorMsg);
    }
    
    const json = (await res.json()) as ApiResponse<T> | { success: false; error: string };
    
    if (!('data' in json)) {
      throw new Error('error' in json ? json.error : 'Invalid response from server');
    }
    
    return json.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error. Check backend.';
    throw new Error(message);
  }
}

export const reviewApi = {
  check: (code: string) =>
    fetchApi<CodeReviewResult>('/api/review/check', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  getSample: () => fetchApi<{ code: string }>('/api/review/sample'),

  /** Code review + emotion feedback in one request */
  full: (code: string, developerName = 'You') =>
    fetchApi<FullReviewResponse>('/api/review/full', {
      method: 'POST',
      body: JSON.stringify({ code, developerName }),
    }),
};
