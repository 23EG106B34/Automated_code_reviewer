import { analyzeDeveloperEmotion } from '../services/emotionAnalyzer.js';
import type { TeamMember, TeamHealthSnapshot } from '../types/emotion.js';

const rawMembers = [
  {
    id: 'dev-1',
    name: 'Alex Chen',
    role: 'Staff Engineer',
    expertise: ['typescript', 'architecture', 'mentoring'],
    signals: {
      commitFrequency: 4,
      avgSessionHours: 7.5,
      prTurnaroundHours: 18,
      commentSentimentScore: 0.42,
      lateNightCommits: 1,
      reviewBacklog: 2,
      linesChangedThisWeek: 2400,
    },
  },
  {
    id: 'dev-2',
    name: 'Jordan Lee',
    role: 'Senior Frontend',
    expertise: ['react', 'design-systems', 'accessibility'],
    signals: {
      commitFrequency: 8,
      avgSessionHours: 9.2,
      prTurnaroundHours: 6,
      commentSentimentScore: -0.15,
      lateNightCommits: 4,
      reviewBacklog: 6,
      linesChangedThisWeek: 5200,
    },
  },
  {
    id: 'dev-3',
    name: 'Sam Rivera',
    role: 'Mid Backend',
    expertise: ['nodejs', 'postgres', 'api-design'],
    signals: {
      commitFrequency: 6,
      avgSessionHours: 8,
      prTurnaroundHours: 12,
      commentSentimentScore: 0.1,
      lateNightCommits: 2,
      reviewBacklog: 4,
      linesChangedThisWeek: 3100,
    },
  },
  {
    id: 'dev-4',
    name: 'Taylor Kim',
    role: 'Junior Developer',
    expertise: ['javascript', 'testing', 'documentation'],
    signals: {
      commitFrequency: 10,
      avgSessionHours: 11,
      prTurnaroundHours: 28,
      commentSentimentScore: -0.35,
      lateNightCommits: 7,
      reviewBacklog: 9,
      linesChangedThisWeek: 1800,
    },
  },
];

export const teamMembers: TeamMember[] = rawMembers.map((m) => ({
  id: m.id,
  name: m.name,
  role: m.role,
  expertise: m.expertise,
  avatarUrl: undefined,
  lastActive: new Date().toISOString(),
  emotion: analyzeDeveloperEmotion({
    developerId: m.id,
    developerName: m.name,
    signals: m.signals,
    recentComments:
      m.id === 'dev-4'
        ? ['Still not sure why this test fails', 'Can we simplify this?']
        : m.id === 'dev-2'
          ? ['LGTM with minor notes', 'Nice refactor on the hook']
          : undefined,
  }),
}));

export function buildTeamHealthSnapshot(teamId: string): TeamHealthSnapshot {
  const members = teamMembers;
  const sentiments = members.map((m) => m.emotion.sentiment);
  const distribution = {
    positive: 0,
    neutral: 0,
    stressed: 0,
    frustrated: 0,
    burned_out: 0,
  } as TeamHealthSnapshot['sentimentDistribution'];

  sentiments.forEach((s) => {
    distribution[s]++;
  });

  const toneRecs = { empathetic: 0, educational: 0, direct: 0, concise: 0 } as Record<
    import('../types/emotion.js').ReviewTone,
    number
  >;
  members.forEach((m) => {
    toneRecs[m.emotion.recommendedTone]++;
  });

  const avgEnergy =
    members.reduce((sum, m) => sum + m.emotion.energyScore, 0) / members.length;
  const burnoutRisk = members.filter(
    (m) => m.emotion.fatigue === 'critical' || m.emotion.sentiment === 'burned_out'
  ).length;

  const alerts: TeamHealthSnapshot['alerts'] = [];
  members.forEach((m) => {
    if (m.emotion.fatigue === 'critical') {
      alerts.push({
        id: `alert-${m.id}-fatigue`,
        severity: 'critical',
        message: `${m.name} is at critical fatigue — consider redistributing reviews.`,
        developerId: m.id,
      });
    } else if (m.emotion.workload === 'overloaded') {
      alerts.push({
        id: `alert-${m.id}-load`,
        severity: 'warning',
        message: `${m.name} has an overloaded review queue.`,
        developerId: m.id,
      });
    }
  });

  const healthScore = Math.round(
    clamp(
      avgEnergy * 0.6 +
        (100 - burnoutRisk * 25) * 0.3 +
        (distribution.positive / members.length) * 100 * 0.1,
      0,
      100
    )
  );

  return {
    teamId,
    averageEnergy: Math.round(avgEnergy),
    burnoutRiskCount: burnoutRisk,
    sentimentDistribution: distribution,
    toneRecommendations: toneRecs,
    members,
    healthScore,
    alerts,
    updatedAt: new Date().toISOString(),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
