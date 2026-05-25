import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Wand2,
  ClipboardPaste,
} from 'lucide-react';
import { reviewApi } from '@/api/reviewApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * One-screen code checker — paste code, click one button, get plain fixes.
 * Built for people who do not want jargon or complex tools.
 */
export function SimpleReviewPage() {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const checkMutation = useMutation({
    mutationFn: () => reviewApi.check(code),
  });

  const sampleMutation = useMutation({
    mutationFn: () => reviewApi.getSample(),
    onSuccess: (data) => setCode(data.code),
  });

  const result = checkMutation.data;

  async function copyFixed() {
    if (!result?.fixedCode) return;
    await navigator.clipboard.writeText(result.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full space-y-8 py-4">
      {/* Hero — no tech speak */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Fix your code in 3 clicks
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Paste your code. We find mistakes. You copy the fixed version. That&apos;s it.
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { step: '1', text: 'Paste your code below' },
          { step: '2', text: 'Click the big green button' },
          { step: '3', text: 'Copy the fixed code' },
        ].map((s) => (
          <div
            key={s.step}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {s.step}
            </span>
            <span className="text-sm text-zinc-300">{s.text}</span>
          </div>
        ))}
      </div>

      {/* Code input */}
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
              Try sample code
            </Button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            spellCheck={false}
            className="min-h-[220px] w-full resize-y bg-zinc-950 p-4 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </CardContent>
      </Card>

      {/* Main action */}
      <Button
        variant="emerald"
        size="default"
        className="h-14 w-full text-lg font-semibold"
        onClick={() => checkMutation.mutate()}
        disabled={!code.trim() || checkMutation.isPending}
      >
        <Wand2 className="h-5 w-5" />
        {checkMutation.isPending ? 'Checking...' : 'Check my code'}
      </Button>

      {checkMutation.isError && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200">
          {(checkMutation.error as Error).message}
        </p>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div
              className={cn(
                'flex items-start gap-4 rounded-xl border p-5',
                result.ok
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-amber-500/30 bg-amber-500/5'
              )}
            >
              {result.ok ? (
                <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-8 w-8 shrink-0 text-amber-400" />
              )}
              <div>
                <p className="text-lg font-medium text-zinc-100">
                  {result.ok ? 'All good!' : 'Here is what we found'}
                </p>
                <p className="mt-1 text-zinc-400">{result.summary}</p>
              </div>
            </div>

            {result.issues.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                  Problems ({result.issues.length})
                </h2>
                {result.issues.map((issue, i) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'rounded-xl border p-4',
                      issue.severity === 'error'
                        ? 'border-rose-500/30 bg-rose-500/5'
                        : 'border-amber-500/20 bg-amber-500/5'
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">
                        Line {issue.line}: {issue.title}
                      </span>
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-xs',
                          issue.severity === 'error'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        )}
                      >
                        {issue.severity === 'error' ? 'Fix this' : 'Optional'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{issue.problem}</p>
                    <p className="mt-2 text-sm text-emerald-300/90">
                      <strong className="text-emerald-400">Do this:</strong> {issue.fix}
                    </p>
                    {issue.snippet && (
                      <pre className="mt-2 overflow-x-auto rounded bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-500">
                        {issue.snippet}
                      </pre>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <Card>
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <span className="font-medium text-zinc-200">Fixed code (ready to copy)</span>
                <Button variant="outline" size="sm" onClick={copyFixed}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy all
                    </>
                  )}
                </Button>
              </div>
              <pre className="max-h-64 overflow-auto p-4 font-mono text-sm text-zinc-300">
                {result.fixedCode}
              </pre>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
