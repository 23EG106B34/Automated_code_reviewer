import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  ClipboardPaste,
  MessageSquare,
  Heart,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { reviewApi } from '@/api/reviewApi';
import { SimpleEmotionFeedback } from '@/components/emotion/SimpleEmotionFeedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * One flow: paste code → get simple review → then see how they feel (emotions).
 * Built for non-technical users.
 */
export function SimpleReviewFlowPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('You');
  const [copied, setCopied] = useState(false);

  const reviewMutation = useMutation({
    mutationFn: () => reviewApi.full(code, name.trim() || 'You'),
  });

  const sampleMutation = useMutation({
    mutationFn: () => reviewApi.getSample(),
    onSuccess: (data) => setCode(data.code),
  });

  const result = reviewMutation.data;

  async function copyFixed() {
    if (!result?.codeReview.fixedCode) return;
    await navigator.clipboard.writeText(result.codeReview.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full space-y-8 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100">Review & feelings</h1>
        <p className="mt-2 text-lg text-zinc-400">
          Paste code → get feedback → see if they&apos;re satisfied with how you should talk to them
        </p>
      </div>

      <div className="grid gap-2 text-sm text-zinc-500 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <strong className="text-indigo-400">1.</strong> Paste code
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <strong className="text-indigo-400">2.</strong> Read feedback
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <strong className="text-indigo-400">3.</strong> Check emotions
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">Your name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="You"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <ClipboardPaste className="h-4 w-4" />
              Your code
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sampleMutation.mutate()}
              disabled={sampleMutation.isPending}
            >
              Try sample
            </Button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="min-h-[280px] w-full resize-y bg-zinc-950 p-4 font-mono text-sm text-zinc-200 focus:outline-none lg:min-h-[360px]"
          />
        </CardContent>
      </Card>

      <Button
        variant="emerald"
        className="h-14 w-full text-lg font-semibold"
        onClick={() => reviewMutation.mutate()}
        disabled={!code.trim() || reviewMutation.isPending}
      >
        {reviewMutation.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Working…
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5" /> Get review & feelings
          </>
        )}
      </Button>

      {reviewMutation.isError && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200">
          {(reviewMutation.error as Error).message}
        </p>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8 xl:grid-cols-2 xl:items-start"
          >
            {/* STEP 1 — Code feedback */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                Step 1 — Code feedback
              </h2>

              <p
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm',
                  result.codeReview.ok
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                    : 'border-amber-500/30 bg-amber-500/5 text-amber-100'
                )}
              >
                {result.codeReview.summary}
              </p>

              {result.codeReview.issues.length > 0 && (
                <div className="space-y-2">
                  {result.codeReview.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm"
                    >
                      <p className="font-medium text-zinc-200">
                        Line {issue.line}: {issue.title}
                      </p>
                      <p className="mt-1 text-zinc-500">{issue.problem}</p>
                      <p className="mt-1 text-emerald-400/90">Fix: {issue.fix}</p>
                    </div>
                  ))}
                </div>
              )}

              <Card>
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
                  <span className="text-sm font-medium text-zinc-300">Fixed code</span>
                  <Button variant="outline" size="sm" onClick={copyFixed}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="max-h-72 overflow-auto p-4 font-mono text-sm text-zinc-300 lg:max-h-96">
                  {result.codeReview.fixedCode ||
                    'No auto-fix for this input — fix the issues listed above first.'}
                </pre>
              </Card>
            </section>

            {/* STEP 2 — Emotions */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
                <Heart className="h-5 w-5 text-rose-400" />
                Step 2 — How they feel
              </h2>

              <SimpleEmotionFeedback
                name={result.emotion.author.name}
                sentiment={result.emotion.author.emotion.sentiment}
                fatigue={result.emotion.author.emotion.fatigue}
                codeReview={{
                  ok: result.codeReview.ok,
                  issueCount: result.codeReview.issueCount,
                }}
              />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
