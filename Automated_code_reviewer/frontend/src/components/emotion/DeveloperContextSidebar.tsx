import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleEmotionFeedback } from './SimpleEmotionFeedback';
import { EmotionAvatar } from './EmotionAvatar';
import { DeveloperCard } from './DeveloperCard';
import { useEmotionStore } from '@/stores/useEmotionStore';
import { toSimpleEmotion } from '@/lib/simpleEmotion';
import type { TeamMember } from '@/types/emotion';
import { cn } from '@/lib/utils';

interface DeveloperContextSidebarProps {
  author: TeamMember;
  className?: string;
}

/**
 * Simplified emotion sidebar — big mood feedback + who should review (optional).
 */
export function DeveloperContextSidebar({ author, className }: DeveloperContextSidebarProps) {
  const suggestedReviewers = useEmotionStore((s) => s.suggestedReviewers);
  const selectedReviewerId = useEmotionStore((s) => s.selectedReviewerId);
  const setSelectedReviewer = useEmotionStore((s) => s.setSelectedReviewer);
  const teamHealth = useEmotionStore((s) => s.teamHealth);

  const { emotion } = author;
  const simple = toSimpleEmotion(emotion.sentiment, emotion.fatigue);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('space-y-4', className)}
    >
      <div className="flex items-center gap-3 px-1">
        <EmotionAvatar
          name={author.name}
          sentiment={emotion.sentiment}
          fatigue={emotion.fatigue}
          energyScore={emotion.energyScore}
          size="md"
        />
        <p className="font-medium text-zinc-100">{author.name}</p>
      </div>

      <SimpleEmotionFeedback
        name={author.name}
        sentiment={emotion.sentiment}
        fatigue={emotion.fatigue}
      />

      {teamHealth && (
        <Card className="border-zinc-800">
          <CardContent className="p-4 text-sm text-zinc-400">
            <p>
              <strong className="text-zinc-200">Team:</strong>{' '}
              {teamHealth.healthScore >= 70
                ? '😊 Team is doing okay overall'
                : '😟 Team is stretched — go easy on everyone'}
            </p>
          </CardContent>
        </Card>
      )}

      {suggestedReviewers.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm">Who should review?</CardTitle>
            <p className="text-xs text-zinc-500">Tap someone with energy</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedReviewers.map((r) => (
              <DeveloperCard
                key={r.id}
                member={r}
                selected={selectedReviewerId === r.id}
                onSelect={(m) => setSelectedReviewer(m.id)}
                showLink={false}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <p className="rounded-lg bg-zinc-900/80 px-3 py-2 text-center text-xs text-zinc-500">
        AI will write comments in a{' '}
        <span className={simple.colorClass}>{simple.isSatisfied ? 'friendly' : 'very soft'}</span>{' '}
        way
      </p>
    </motion.aside>
  );
}
