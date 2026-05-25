import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelRightOpen,
  PanelRightClose,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { emotionApi, emotionKeys } from '@/api/emotionApi';
import { MOCK_PR } from '@/data/mockPRSession';
import { useEmotionStore } from '@/stores/useEmotionStore';
import { toSimpleEmotion } from '@/lib/simpleEmotion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DeveloperContextSidebar } from '@/components/emotion/DeveloperContextSidebar';
import { SimpleEmotionBanner } from '@/components/emotion/SimpleEmotionFeedback';
import { cn } from '@/lib/utils';

function DiffViewer({ diff }: { diff: string }) {
  const lines = diff.split('\n');
  return (
    <pre className="font-mono text-xs leading-relaxed">
      {lines.map((line, i) => {
        let className = 'block px-4 py-0.5';
        if (line.startsWith('+') && !line.startsWith('+++')) className += ' diff-add';
        else if (line.startsWith('-') && !line.startsWith('---')) className += ' diff-remove';
        else if (line.startsWith('@@')) className += ' text-indigo-400/90';
        else className += ' text-zinc-500';
        return (
          <code key={i} className={className}>
            {line || ' '}
          </code>
        );
      })}
    </pre>
  );
}

export function PRReviewPage() {
  const sidebarOpen = useEmotionStore((s) => s.emotionSidebarOpen);
  const toggleSidebar = useEmotionStore((s) => s.toggleEmotionSidebar);
  const applyAnalysis = useEmotionStore((s) => s.applyAnalysis);
  const setTeamHealth = useEmotionStore((s) => s.setTeamHealth);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: emotionKeys.analyze,
    queryFn: () => emotionApi.analyze(),
  });

  useEffect(() => {
    if (!data) return;
    applyAnalysis(data.author, data.suggestedReviewers);
    setTeamHealth(data.teamHealth);
  }, [data, applyAnalysis, setTeamHealth]);

  const author = data?.author;
  const ctx = MOCK_PR;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p>Checking how they feel…</p>
      </div>
    );
  }

  if (!author) return null;

  const simple = toSimpleEmotion(author.emotion.sentiment, author.emotion.fatigue);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h1 className="text-xl font-semibold text-zinc-100">{ctx.title}</h1>
        <SimpleEmotionBanner feedback={simple} name={author.name} />
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={toggleSidebar}>
            {sidebarOpen ? (
              <>
                <PanelRightClose className="h-4 w-4" /> Hide feelings panel
              </>
            ) : (
              <>
                <PanelRightOpen className="h-4 w-4" /> Show feelings panel
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <div
        className={cn(
          'grid gap-4 transition-all duration-300',
          sidebarOpen ? 'lg:grid-cols-[1fr_340px_280px]' : 'lg:grid-cols-[1fr_380px]'
        )}
      >
        <Card className="flex min-h-[400px] flex-col overflow-hidden lg:min-h-[560px]">
          <CardHeader className="border-b border-zinc-800/80 py-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Code changes</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <DiffViewer diff={ctx.diff} />
          </ScrollArea>
        </Card>

        <Card className="flex min-h-[400px] flex-col lg:min-h-[560px]">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-zinc-800/80 py-3">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-sm">Comments</CardTitle>
            <span className="ml-auto text-xs text-zinc-500">
              {simple.isSatisfied ? 'Friendly mode' : 'Gentle mode'}
            </span>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {ctx.comments.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                >
                  <p className="text-sm font-medium text-zinc-200">{c.author}</p>
                  <p className="mt-1 text-sm text-zinc-400">{c.body}</p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t border-zinc-800 p-3 text-center text-xs text-zinc-500">
            Comments adjusted because they are{' '}
            <strong className={simple.colorClass}>
              {simple.isSatisfied ? 'satisfied' : 'not satisfied'}
            </strong>
            {isFetching && ' · updating…'}
          </div>
        </Card>

        <AnimatePresence>
          {sidebarOpen && <DeveloperContextSidebar author={author} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
