import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Loader2, RefreshCw } from 'lucide-react';
import { emotionApi, emotionKeys } from '@/api/emotionApi';
import { SimpleEmotionFeedback } from '@/components/emotion/SimpleEmotionFeedback';
import { Button } from '@/components/ui/button';
import { useEmotionStore } from '@/stores/useEmotionStore';

/**
 * One-screen emotional check — click a button, see if someone is satisfied or not.
 * No code, no PRs, no technical words.
 */
export function SimpleEmotionPage() {
  const applyAnalysis = useEmotionStore((s) => s.applyAnalysis);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: emotionKeys.analyze,
    queryFn: async () => {
      const result = await emotionApi.analyze();
      applyAnalysis(result.author, result.suggestedReviewers);
      return result.author;
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-8 py-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20">
          <Heart className="h-7 w-7 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">How are they feeling?</h1>
        <p className="mt-2 text-lg text-zinc-400">
          One click. See if they&apos;re <strong className="text-emerald-400">satisfied</strong> or
          need a <strong className="text-rose-400">gentler</strong> review.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="default"
          className="h-12 flex-1 text-base sm:max-w-xs"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
        >
          {isLoading || isFetching ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Checking…
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5" /> Check mood now
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-zinc-600">
        Step 1: Click the button · Step 2: Read the face · Step 3: Follow the tip
      </p>

      {data && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SimpleEmotionFeedback
            name={data.name}
            sentiment={data.emotion.sentiment}
            fatigue={data.emotion.fatigue}
          />
        </motion.div>
      )}

      {!data && !isLoading && (
        <p className="rounded-xl border border-dashed border-zinc-700 py-12 text-center text-zinc-500">
          Click <strong className="text-zinc-300">Check mood now</strong> to see emotional feedback.
        </p>
      )}
    </div>
  );
}
