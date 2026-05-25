/**
 * Emotion Analyzer Service
 * Detects developer fatigue, sentiment, workload, and experience level.
 * Builds LLM-ready prompts and produces structured analysis for review tone adaptation.
 */

import type {
  EmotionAnalysisInput,
  EmotionAnalysisResult,
  ExperienceLevel,
  FatigueLevel,
  ReviewTone,
  SentimentLevel,
  TeamMember,
  WorkloadLevel,
} from '../types/emotion.js';

// ---------------------------------------------------------------------------
// LLM prompt templates — production systems would send these to an LLM API
// ---------------------------------------------------------------------------

export const EMOTION_SYSTEM_PROMPT = `You are the Emotion & Team Dynamics engine for an AI Code Review SaaS platform.

MISSION
Infer developer wellbeing from behavioral signals (never clinical diagnosis) and adapt how the AI writes review feedback.

OUTPUT
Return ONLY valid JSON matching the schema in the user message. No markdown, no preamble.

DIMENSIONS TO INFER
1. sentiment — positive | neutral | stressed | frustrated | burned_out
2. fatigue — low | moderate | high | critical (from session length, late commits, backlog)
3. workload — light | balanced | heavy | overloaded
4. experienceLevel — junior | mid | senior | staff
5. recommendedTone — empathetic | educational | direct | concise
6. energyScore — integer 0–100 (higher = more capacity for deep review)
7. insights — 3–5 short, kind, actionable strings for the reviewer
8. twinSummary — one sentence "Developer Twin" persona for the sidebar
9. confidence — 0.0–1.0

TONE ADAPTATION RULES (strict priority)
- burned_out OR critical fatigue → empathetic: acknowledge effort, no nitpicks, max 3 comments
- frustrated → empathetic first, then one constructive ask
- junior + neutral/positive → educational: explain why, link to patterns, offer examples
- senior + low fatigue + positive → direct: crisp, respect time, assume context
- overloaded workload → concise: bullets only, blockers first, defer style debates

PRIVACY & SAFETY
- Never quote private messages; paraphrase patterns only
- Never label someone "lazy" or "unproductive"
- Frame fatigue as systemic (workload, hours), not personal failure`;

export function buildEmotionUserPrompt(input: EmotionAnalysisInput): string {
  const { developerName, signals, recentComments, prTitle, prDescription } = input;

  return `Analyze the following developer context and return a JSON object with:
- sentiment: one of positive | neutral | stressed | frustrated | burned_out
- fatigue: one of low | moderate | high | critical
- workload: one of light | balanced | heavy | overloaded
- experienceLevel: one of junior | mid | senior | staff
- recommendedTone: one of empathetic | educational | direct | concise
- confidence: 0.0–1.0
- insights: string[] (3–5 actionable, kind observations)
- energyScore: 0–100
- twinSummary: one sentence "Developer Twin" persona insight

Developer: ${developerName}

Behavioral signals (last 7 days):
- Commit frequency: ${signals.commitFrequency}/day
- Avg session length: ${signals.avgSessionHours}h
- PR turnaround: ${signals.prTurnaroundHours}h
- Comment sentiment score: ${signals.commentSentimentScore} (-1 to 1)
- Late-night commits: ${signals.lateNightCommits}
- Review backlog: ${signals.reviewBacklog} PRs
- Lines changed: ${signals.linesChangedThisWeek}

${prTitle ? `Current PR: "${prTitle}"` : ''}
${prDescription ? `PR context: ${prDescription.slice(0, 500)}` : ''}

${recentComments?.length ? `Recent review comments:\n${recentComments.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}

Apply tone rules from system prompt. Also return:
- teamHealthHint: one line on whether the broader team can absorb a heavy review this week
- reviewerGuidance: who should NOT review this PR (e.g. also burned out) and why`;
}

export function buildReviewerSuggestionPrompt(
  author: TeamMember,
  candidates: TeamMember[],
  requiredExpertise: string[]
): string {
  return `Suggest the best code reviewer for this PR.

Author state:
- Energy: ${author.emotion.energyScore}/100
- Fatigue: ${author.emotion.fatigue}
- Experience: ${author.emotion.experienceLevel}
- Sentiment: ${author.emotion.sentiment}

Required expertise: ${requiredExpertise.join(', ')}

Candidates:
${candidates
  .map(
    (c) =>
      `- ${c.name} (id: ${c.id}): energy=${c.emotion.energyScore}, fatigue=${c.emotion.fatigue}, expertise=[${c.expertise.join(', ')}], backlog=${c.emotion.workload}`
  )
  .join('\n')}

Rules:
1. Prefer reviewers with energyScore > 60 and fatigue !== critical
2. Match at least one required expertise tag
3. Avoid pairing burned_out author with overloaded reviewer
4. Return ordered reviewer IDs with brief rationale`;
}

// ---------------------------------------------------------------------------
// Heuristic analyzer (runs offline; mirrors LLM logic for demo/production fallback)
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function inferFatigue(signals: EmotionAnalysisInput['signals']): FatigueLevel {
  let score = 0;
  if (signals.avgSessionHours > 10) score += 2;
  else if (signals.avgSessionHours > 8) score += 1;
  if (signals.lateNightCommits > 5) score += 2;
  else if (signals.lateNightCommits > 2) score += 1;
  if (signals.reviewBacklog > 8) score += 2;
  else if (signals.reviewBacklog > 4) score += 1;
  if (signals.commitFrequency > 15) score += 1;

  if (score >= 5) return 'critical';
  if (score >= 3) return 'high';
  if (score >= 1) return 'moderate';
  return 'low';
}

function inferWorkload(signals: EmotionAnalysisInput['signals']): WorkloadLevel {
  const load =
    signals.reviewBacklog * 2 +
    signals.linesChangedThisWeek / 500 +
    (signals.prTurnaroundHours < 4 ? 2 : 0);

  if (load > 12) return 'overloaded';
  if (load > 7) return 'heavy';
  if (load > 3) return 'balanced';
  return 'light';
}

function inferSentiment(
  signals: EmotionAnalysisInput['signals'],
  comments?: string[]
): SentimentLevel {
  const score = signals.commentSentimentScore;
  const frustratedKeywords = ['again', 'why', 'broken', 'frustrated', 'ugh', 'still'];
  const hasFrustration =
    comments?.some((c) =>
      frustratedKeywords.some((k) => c.toLowerCase().includes(k))
    ) ?? false;

  if (score < -0.5 || (hasFrustration && score < 0)) return 'burned_out';
  if (score < -0.25 || hasFrustration) return 'frustrated';
  if (score < 0) return 'stressed';
  if (score > 0.35) return 'positive';
  return 'neutral';
}

function inferExperience(signals: EmotionAnalysisInput['signals']): ExperienceLevel {
  const complexity = signals.linesChangedThisWeek / 1000 + signals.prTurnaroundHours / 24;
  if (complexity > 8) return 'staff';
  if (complexity > 5) return 'senior';
  if (complexity > 2) return 'mid';
  return 'junior';
}

function selectTone(
  sentiment: SentimentLevel,
  fatigue: FatigueLevel,
  workload: WorkloadLevel,
  experience: ExperienceLevel
): ReviewTone {
  if (sentiment === 'burned_out' || fatigue === 'critical') return 'empathetic';
  if (sentiment === 'frustrated') return 'empathetic';
  if (experience === 'junior') return 'educational';
  if (workload === 'overloaded') return 'concise';
  if (experience === 'senior' && fatigue === 'low') return 'direct';
  return 'educational';
}

function computeEnergyScore(
  fatigue: FatigueLevel,
  sentiment: SentimentLevel,
  workload: WorkloadLevel
): number {
  const fatiguePenalty = { low: 0, moderate: 15, high: 35, critical: 55 }[fatigue];
  const sentimentBonus = {
    positive: 15,
    neutral: 5,
    stressed: -5,
    frustrated: -15,
    burned_out: -30,
  }[sentiment];
  const workloadPenalty = { light: 10, balanced: 5, heavy: -10, overloaded: -25 }[workload];

  return clamp(75 - fatiguePenalty + sentimentBonus + workloadPenalty, 5, 98);
}

function generateInsights(
  input: EmotionAnalysisInput,
  sentiment: SentimentLevel,
  fatigue: FatigueLevel,
  workload: WorkloadLevel,
  tone: ReviewTone
): string[] {
  const insights: string[] = [];

  if (fatigue === 'critical' || fatigue === 'high') {
    insights.push(
      `${input.developerName} shows signs of elevated fatigue — consider deferring non-blocking review comments.`
    );
  }
  if (workload === 'overloaded') {
    insights.push('Review backlog is high; batch feedback into prioritized sections.');
  }
  if (sentiment === 'frustrated' || sentiment === 'burned_out') {
    insights.push('Recent communication patterns suggest frustration — lead with acknowledgment.');
  }
  if (input.signals.lateNightCommits > 3) {
    insights.push('Frequent late-night commits detected — encourage sustainable pacing.');
  }
  const simpleLabel =
    sentiment === 'positive' && fatigue === 'low'
      ? 'They seem satisfied — normal review is OK.'
      : fatigue === 'critical' || fatigue === 'high' || sentiment === 'burned_out'
        ? 'They are NOT satisfied — be very gentle.'
        : 'They seem okay but stressed — keep feedback short and kind.';
  insights.unshift(simpleLabel);
  insights.push(`Recommended review tone for this session: **${tone}**.`);
  if (input.signals.commentSentimentScore > 0.3) {
    insights.push('Positive collaboration signals — good time for deeper architectural feedback.');
  }

  return insights.slice(0, 5);
}

function buildTwinSummary(
  name: string,
  sentiment: SentimentLevel,
  experience: ExperienceLevel,
  energy: number
): string {
  const mood =
    sentiment === 'positive'
      ? 'collaborative and energized'
      : sentiment === 'burned_out'
        ? 'running on reserves but still shipping'
        : 'focused with occasional friction';

  return `${name}'s Developer Twin: ${experience}-level contributor, currently ${mood} (energy ${energy}/100).`;
}

/**
 * Main analysis entry — call from routes or queue workers.
 * In production, optionally call LLM with EMOTION_SYSTEM_PROMPT + buildEmotionUserPrompt().
 */
export function analyzeDeveloperEmotion(
  input: EmotionAnalysisInput
): EmotionAnalysisResult {
  const fatigue = inferFatigue(input.signals);
  const workload = inferWorkload(input.signals);
  const sentiment = inferSentiment(input.signals, input.recentComments);
  const experienceLevel = inferExperience(input.signals);
  const recommendedTone = selectTone(sentiment, fatigue, workload, experienceLevel);
  const energyScore = computeEnergyScore(fatigue, sentiment, workload);
  const confidence = clamp(
    0.72 +
      (input.recentComments?.length ? 0.08 : 0) +
      (input.signals.commentSentimentScore !== 0 ? 0.1 : 0),
    0.65,
    0.95
  );

  return {
    developerId: input.developerId,
    sentiment,
    fatigue,
    workload,
    experienceLevel,
    recommendedTone,
    confidence,
    insights: generateInsights(input, sentiment, fatigue, workload, recommendedTone),
    energyScore,
    suggestedReviewerIds: [],
    twinSummary: buildTwinSummary(
      input.developerName,
      sentiment,
      experienceLevel,
      energyScore
    ),
  };
}

/**
 * Rank reviewers by energy, expertise match, and workload compatibility.
 */
export function suggestReviewers(
  author: TeamMember,
  candidates: TeamMember[],
  requiredExpertise: string[]
): string[] {
  const scored = candidates
    .filter((c) => c.id !== author.id)
    .map((candidate) => {
      let score = candidate.emotion.energyScore;

      const expertiseMatch = requiredExpertise.filter((tag) =>
        candidate.expertise.some((e) => e.toLowerCase().includes(tag.toLowerCase()))
      ).length;
      score += expertiseMatch * 15;

      if (candidate.emotion.fatigue === 'critical') score -= 40;
      if (candidate.emotion.fatigue === 'high') score -= 20;
      if (candidate.emotion.workload === 'overloaded') score -= 25;
      if (author.emotion.sentiment === 'burned_out' && candidate.emotion.workload === 'overloaded') {
        score -= 30;
      }
      if (candidate.emotion.fatigue === 'low') score += 10;

      return { id: candidate.id, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.id);
}

export function getLLMPayload(input: EmotionAnalysisInput) {
  return {
    model: 'gpt-4o',
    temperature: 0.3,
    response_format: { type: 'json_object' as const },
    messages: [
      { role: 'system' as const, content: EMOTION_SYSTEM_PROMPT },
      { role: 'user' as const, content: buildEmotionUserPrompt(input) },
    ],
  };
}
