import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { teamMembers, buildTeamHealthSnapshot } from '../backend/src/data/mockTeam.js';
import { analyzeDeveloperEmotion, suggestReviewers } from '../backend/src/services/emotionAnalyzer.js';
import { reviewCode } from '../backend/src/services/codeReviewer.js';
import type { ApiResponse, EmotionAnalyzeResponse, TeamMember } from '../backend/src/types/emotion.js';
import type { CodeReviewResult } from '../backend/src/services/codeReviewer.js';

interface FullReviewResponse {
  codeReview: CodeReviewResult;
  emotion: EmotionAnalyzeResponse;
  deliveryTip: string;
}

const checkSchema = z.object({
  code: z.string().min(1, 'Please paste some code first'),
});

const fullSchema = z.object({
  code: z.string().min(1, 'Please paste some code first'),
  developerName: z.string().optional().default('You'),
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
  
  // Handle different routes based on URL path
  if (!url) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const pathname = new URL(url, `https://${req.headers.host}`).pathname;
  
  // POST /api/review/check
  if (method === 'POST' && pathname === '/api/review/check') {
    const parsed = checkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Paste your code in the box and click Check again.',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
    const result = reviewCode(parsed.data.code);
    return ok<CodeReviewResult>(res, result);
  }
  
  // POST /api/review/full
  if (method === 'POST' && pathname === '/api/review/full') {
    const parsed = fullSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Paste your code and try again.',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      });
    }

    const codeReview = reviewCode(parsed.data.code);
    const stressFromCode = Math.min(codeReview.issueCount * 0.08, 0.45);

    const input = {
      developerId: 'dev-user',
      developerName: parsed.data.developerName,
      signals: {
        commitFrequency: 5,
        avgSessionHours: 7 + codeReview.issueCount * 0.5,
        prTurnaroundHours: 12,
        commentSentimentScore: codeReview.ok
          ? codeReview.issueCount === 0
            ? 0.5
            : 0.35
          : -0.2 - stressFromCode,
        lateNightCommits: codeReview.issueCount > 4 ? 3 : 0,
        reviewBacklog: codeReview.issueCount,
        linesChangedThisWeek: 2000,
      },
      prTitle: 'Code review session',
      recentComments: codeReview.ok
        ? ['Thanks for the help!']
        : ['Still fixing these errors', 'This is confusing'],
      requiredExpertise: ['javascript'],
    };

    const analysis = analyzeDeveloperEmotion(input);
    const author: TeamMember = {
      id: input.developerId,
      name: input.developerName,
      role: 'Developer',
      expertise: ['javascript'],
      lastActive: new Date().toISOString(),
      emotion: { ...analysis, suggestedReviewerIds: [] },
    };

    const reviewerIds = suggestReviewers(author, teamMembers, input.requiredExpertise);
    analysis.suggestedReviewerIds = reviewerIds;

    const emotion: EmotionAnalyzeResponse = {
      analysis,
      author,
      teamHealth: buildTeamHealthSnapshot('team-alpha'),
      suggestedReviewers: reviewerIds
        .map((id) => teamMembers.find((m) => m.id === id))
        .filter((m): m is TeamMember => Boolean(m)),
    };

    const deliveryTip = codeReview.ok
      ? 'Code looks fine. You can give normal friendly feedback.'
      : codeReview.issueCount > 3
        ? 'Many issues found — explain fixes gently; they may feel overwhelmed.'
        : 'A few issues found — be clear but kind when you share the fixes.';

    return ok<FullReviewResponse>(res, {
      codeReview,
      emotion,
      deliveryTip,
    });
  }
  
  // GET /api/review/sample
  if (method === 'GET' && pathname === '/api/review/sample') {
    const sample = `// Example with a few easy mistakes — click Try sample
functon greet(name) {
  var msg = "Hello " + name
  if (name == null) {
    return msg
  }
  console.log(msg)
  return msg
}

try {
  greet("World")
} catch (e) {}
`;
    return ok(res, { code: sample });
  }
  
  // Default: 404
  return res.status(404).json({ error: 'Route not found' });
}