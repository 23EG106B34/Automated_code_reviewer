import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { teamMembers, buildTeamHealthSnapshot } from '../data/mockTeam.js';
import {
  analyzeDeveloperEmotion,
  suggestReviewers,
} from '../services/emotionAnalyzer.js';
import type {
  ApiResponse,
  EmotionAnalyzeResponse,
} from '../types/emotion.js';

const router = Router();

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

function ok<T>(res: Response, data: T) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  res.json(body);
}

/**
 * POST /api/emotion/analyze
 *
 * Single sample route for Emotion & Team Dynamics Awareness.
 * Returns: fatigue/sentiment/workload analysis, adapted tone, team health, reviewer suggestions.
 */
router.post('/analyze', (req: Request, res: Response) => {
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

  const author: (typeof teamMembers)[0] = {
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
    .filter((m): m is (typeof teamMembers)[0] => Boolean(m));

  const teamHealth = buildTeamHealthSnapshot('team-alpha');

  const payload: EmotionAnalyzeResponse = {
    analysis,
    author,
    teamHealth,
    suggestedReviewers,
  };

  return ok<EmotionAnalyzeResponse>(res, payload);
});

export default router;
