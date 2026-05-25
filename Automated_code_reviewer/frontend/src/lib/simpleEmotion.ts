import type { FatigueLevel, SentimentLevel } from '@/types/emotion';

/** Plain-English mood for non-technical users */
export type SimpleMood = 'satisfied' | 'okay' | 'concerned' | 'not_great' | 'needs_rest';

export interface SimpleEmotionFeedback {
  mood: SimpleMood;
  emoji: string;
  headline: string;
  message: string;
  /** True = happy enough for normal review; false = be extra gentle */
  isSatisfied: boolean;
  reviewTip: string;
  colorClass: string;
  bgClass: string;
}

const moodConfig: Record<
  SimpleMood,
  Omit<SimpleEmotionFeedback, 'mood' | 'isSatisfied'>
> = {
  satisfied: {
    emoji: '😊',
    headline: 'Satisfied & doing well',
    message: 'This person seems in a good place. Normal friendly feedback is fine.',
    reviewTip: 'You can give a regular code review — clear and helpful.',
    colorClass: 'text-emerald-400',
    bgClass: 'border-emerald-500/40 bg-emerald-500/10',
  },
  okay: {
    emoji: '😐',
    headline: 'Okay — nothing alarming',
    message: 'They seem fine but not super energized. Keep feedback simple.',
    reviewTip: 'Use short comments. Skip tiny nitpicks.',
    colorClass: 'text-indigo-300',
    bgClass: 'border-indigo-500/30 bg-indigo-500/10',
  },
  concerned: {
    emoji: '😕',
    headline: 'Concerned — code has issues',
    message: 'Code quality needs attention. Be supportive but clear about fixes needed.',
    reviewTip: 'Highlight what needs fixing. Offer help with solutions.',
    colorClass: 'text-yellow-400',
    bgClass: 'border-yellow-500/40 bg-yellow-500/10',
  },
  not_great: {
    emoji: '😟',
    headline: 'Not satisfied — under stress',
    message: 'They may feel frustrated or overwhelmed. Be kind first.',
    reviewTip: 'Start with something positive. Only mention must-fix issues.',
    colorClass: 'text-amber-400',
    bgClass: 'border-amber-500/40 bg-amber-500/10',
  },
  needs_rest: {
    emoji: '😫',
    headline: 'Very tired — needs rest',
    message: 'High fatigue detected. They are NOT in a good headspace for harsh feedback.',
    reviewTip: 'Postpone non-urgent comments. Say "looks good" when possible.',
    colorClass: 'text-rose-400',
    bgClass: 'border-rose-500/40 bg-rose-500/10',
  },
};

/**
 * Converts backend sentiment + fatigue into one simple mood anyone can read.
 */
export function toSimpleEmotion(
  sentiment: SentimentLevel,
  fatigue: FatigueLevel,
  codeReview?: { ok: boolean; issueCount: number }
): SimpleEmotionFeedback {
  let mood: SimpleMood;

  if (codeReview) {
    if (codeReview.issueCount === 0) {
      mood = 'satisfied';
    } else if (!codeReview.ok) {
      mood =
        codeReview.issueCount > 3 || fatigue === 'high' || fatigue === 'critical'
          ? 'not_great'
          : 'concerned';
    } else {
      mood = 'okay';
    }
  } else if (fatigue === 'critical' || fatigue === 'high' || sentiment === 'burned_out') {
    mood = 'needs_rest';
  } else if (
    sentiment === 'frustrated' ||
    sentiment === 'stressed' ||
    fatigue === 'moderate'
  ) {
    mood = 'not_great';
  } else if (sentiment === 'positive' && fatigue === 'low') {
    mood = 'satisfied';
  } else {
    mood = 'okay';
  }

  const base = moodConfig[mood];
  return {
    mood,
    ...base,
    isSatisfied: mood === 'satisfied' || mood === 'okay',
  };
}
