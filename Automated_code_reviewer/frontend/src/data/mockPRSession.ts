import type { PRComment } from '@/types/emotion';

/** Static PR content; emotion data comes live from POST /api/emotion/analyze */
export const MOCK_PR = {
  prId: 'demo-pr-42',
  title: 'feat: emotion-aware review sidebar + tone adaptation',
  diff: `--- a/src/hooks/useReviewTone.ts
+++ b/src/hooks/useReviewTone.ts
@@ -1,8 +1,26 @@
+import { useEmotionStore } from '@/stores/useEmotionStore';
+import type { ReviewTone } from '@/types/emotion';
+
-export function useReviewTone() {
-  return 'direct';
+export function useReviewTone(): ReviewTone {
+  const activeTone = useEmotionStore((s) => s.activeTone);
+  const currentFatigue = useEmotionStore((s) => s.currentFatigue);
+
+  if (currentFatigue === 'critical') {
+    return 'empathetic';
+  }
+
+  return activeTone || 'educational';
 }`,
  comments: [
    {
      id: 'c1',
      author: 'Alex Chen',
      body: 'Consider extracting tone selection into a pure function for testability.',
      line: 12,
      tone: 'educational' as const,
    },
    {
      id: 'c2',
      author: 'AI Review',
      body: 'Great alignment with team wellbeing goals — fatigue gate is a nice touch.',
      line: 8,
      tone: 'empathetic' as const,
    },
  ] satisfies PRComment[],
};

/** Default author signals for demo (Jordan Lee — elevated fatigue) */
export const DEMO_ANALYZE_PAYLOAD = {
  developerId: 'dev-2',
  developerName: 'Jordan Lee',
  signals: {
    commitFrequency: 8,
    avgSessionHours: 9.2,
    prTurnaroundHours: 6,
    commentSentimentScore: -0.15,
    lateNightCommits: 4,
    reviewBacklog: 6,
    linesChangedThisWeek: 5200,
  },
  recentComments: ['LGTM with minor notes', 'Can we revisit this tomorrow?'],
  prTitle: MOCK_PR.title,
  requiredExpertise: ['react', 'typescript'],
};
