import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { teamMembers, buildTeamHealthSnapshot } from '../backend/src/data/mockTeam.js';
import { analyzeDeveloperEmotion, suggestReviewers } from '../backend/src/services/emotionAnalyzer.js';
import type { ApiResponse, EmotionAnalyzeResponse } from '../backend/src/types/emotion.js';

const signalsSchema = z.object({
  commitFrequency: z.number(),
  avgSessionHours: z.number(),
  prTurnaroundHours: z.number(),
  commentSentimentScore: z.number().min(-1).max(1),
  lateNightCommits: z.number(),
  reviewBacklog: z.number(),
  linesChangedThisWeek: z.number(),
});

const analyzeSchema = z.object({
  developerId: z.string(),
  developerName: z.string(),
  signals: signalsSchema,
  recentComments: z.array(z.string()).optional(),
  prTitle: z.string().optional(),
  prDescription: z.string().optional(),
  requiredExpertise: z.array(z.string()).optional(),
});

function ok<T>(res: VercelResponse, data: T) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.json(body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  
  if (!url) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const pathname = new URL(url, `https://${req.headers.host}`).pathname;
  
  // POST /api/emotion/analyze
  if (method === 'POST' && pathname === '/api/emotion/analyze') {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.message,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      });
    }

    const input = parsed.data;
    const analysis = analyzeDeveloperEmotion(input);
    const expertise = input.requiredExpertise ?? ['typescript', 'react'];

    const author = {
      id: input.developerId,
      name: input.developerName,
      role: teamMembers.find((m) => m.id === input.developerId)?.role ?? 'Engineer',
      expertise: teamMembers.find((m) => m.id === input.developerId)?.expertise ?? expertise,
      lastActive: new Date().toISOString(),
      emotion: { ...analysis, suggestedReviewerIds: [] },
    };

    const reviewerIds = suggestReviewers(author, teamMembers, expertise);
    analysis.suggestedReviewerIds = reviewerIds;

    const suggestedReviewers = reviewerIds
      .map((id) => teamMembers.find((m) => m.id === id))
      .filter((m) => Boolean(m));

    const teamHealth = buildTeamHealthSnapshot('team-alpha');

    const payload: EmotionAnalyzeResponse = {
      analysis,
      author,
      teamHealth,
      suggestedReviewers,
    };

    return ok<EmotionAnalyzeResponse>(res, payload);
  }
  
  // Default: 404
  return res.status(404).json({ error: 'Route not found' });
}