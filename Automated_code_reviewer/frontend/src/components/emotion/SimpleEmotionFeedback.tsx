import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toSimpleEmotion, type SimpleEmotionFeedback } from '@/lib/simpleEmotion';
import type { FatigueLevel, SentimentLevel } from '@/types/emotion';
import { cn } from '@/lib/utils';

interface SimpleEmotionFeedbackProps {
  name: string;
  sentiment: SentimentLevel;
  fatigue: FatigueLevel;
  /** When set, mood follows code review (not generic neutral → concerned bug) */
  codeReview?: { ok: boolean; issueCount: number };
  className?: string;
}

/**
 * Dead-simple emotional feedback — satisfied or not, with emoji and plain tips.
 * Built for anyone; no jargon.
 */
export function SimpleEmotionFeedback({
  name,
  sentiment,
  fatigue,
  codeReview,
  className,
}: SimpleEmotionFeedbackProps) {
  const feedback = toSimpleEmotion(sentiment, fatigue, codeReview);

  return (
    <Card className={cn('overflow-hidden', feedback.bgClass, className)}>
      <CardContent className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <div 
            className="text-6xl inline-block"
            role="img" 
            aria-label={`${feedback.headline}: ${feedback.emoji}`}
            aria-live="polite"
          >
            {feedback.emoji}
          </div>
        </motion.div>

        <h2 className={cn('mt-4 text-xl font-bold', feedback.colorClass)}>
          {feedback.headline}
        </h2>

        <p className="mt-2 text-base text-zinc-300">
          <span className="font-medium text-zinc-100">{name}</span> — {feedback.message}
        </p>

        <div
          className={cn(
            'mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
            feedback.isSatisfied
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/20 text-rose-300'
          )}
        >
          {feedback.isSatisfied ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Satisfied enough for normal review
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5" />
              Not satisfied — be extra gentle
            </>
          )}
        </div>

        <p className="mt-5 rounded-lg bg-zinc-900/60 px-4 py-3 text-sm leading-relaxed text-zinc-400">
          <strong className="text-zinc-200">What to do:</strong> {feedback.reviewTip}
        </p>
      </CardContent>
    </Card>
  );
}

/** Compact banner for PR header */
export function SimpleEmotionBanner({
  feedback,
  name,
}: {
  feedback: SimpleEmotionFeedback;
  name: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3',
        feedback.bgClass
      )}
    >
      <div role="img" aria-label={feedback.headline} className="text-3xl">
        {feedback.emoji}
      </div>
      <div className="min-w-0 text-left">
        <p className={cn('font-semibold', feedback.colorClass)}>{feedback.headline}</p>
        <p className="text-xs text-zinc-500">
          {name} · {feedback.isSatisfied ? 'Satisfied ✓' : 'Be gentle ✓'}
        </p>
      </div>
    </div>
  );
}
