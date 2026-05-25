import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmotionAvatar } from './EmotionAvatar';
import { FatigueIndicator } from './FatigueIndicator';
import { ToneBadgeInline } from './ToneBadge';
import type { TeamMember } from '@/types/emotion';
import { cn } from '@/lib/utils';

interface DeveloperCardProps {
  member: TeamMember;
  selected?: boolean;
  onSelect?: (member: TeamMember) => void;
  showLink?: boolean;
  className?: string;
}

/** Compact developer summary card for team hub and reviewer suggestions */
export function DeveloperCard({
  member,
  selected,
  onSelect,
  showLink = true,
  className,
}: DeveloperCardProps) {
  const { emotion } = member;

  const content = (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-indigo-500/30',
        selected && 'border-indigo-500/50 ring-1 ring-indigo-500/30',
        className
      )}
      onClick={() => onSelect?.(member)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <EmotionAvatar
          name={member.name}
          sentiment={emotion.sentiment}
          fatigue={emotion.fatigue}
          energyScore={emotion.energyScore}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium text-zinc-100">{member.name}</h4>
            {emotion.fatigue === 'critical' && (
              <Sparkles className="h-3.5 w-3.5 text-rose-400" aria-label="Needs attention" />
            )}
          </div>
          <p className="text-xs text-zinc-500">{member.role}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {member.expertise.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden w-28 shrink-0 sm:block">
          <FatigueIndicator level={emotion.fatigue} compact showLabel={false} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <ToneBadgeInline tone={emotion.recommendedTone} />
          {showLink && (
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (showLink && !onSelect) {
    return (
      <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Link to={`/developer/${member.id}`}>{content}</Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
      {content}
    </motion.div>
  );
}
