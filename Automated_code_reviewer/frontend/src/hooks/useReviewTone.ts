import { useEmotionStore } from '@/stores/useEmotionStore';
import type { ReviewTone } from '@/types/emotion';

/**
 * Resolves the AI review tone for the current PR session.
 * Critical fatigue → always empathetic (overrides manual tone selection).
 */
export function useReviewTone(): ReviewTone {
  const activeTone = useEmotionStore((s) => s.activeTone);
  const currentFatigue = useEmotionStore((s) => s.currentFatigue);
  const recommendedTone = useEmotionStore((s) => {
    const id = s.activeDeveloperId;
    if (!id) return undefined;
    return s.emotionByDeveloper[id]?.recommendedTone;
  });

  if (currentFatigue === 'critical') {
    return 'empathetic';
  }

  return activeTone || recommendedTone || 'educational';
}
