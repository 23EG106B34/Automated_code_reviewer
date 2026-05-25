import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SentimentLevel, FatigueLevel } from '@/types/emotion';

interface EmotionAvatarProps {
  name: string;
  sentiment: SentimentLevel;
  fatigue?: FatigueLevel;
  energyScore?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sentimentRing: Record<SentimentLevel, string> = {
  positive: 'ring-emerald-500/60 shadow-emerald-500/20',
  neutral: 'ring-zinc-500/40 shadow-zinc-500/10',
  stressed: 'ring-amber-500/50 shadow-amber-500/20',
  frustrated: 'ring-rose-500/50 shadow-rose-500/25',
  burned_out: 'ring-rose-600/70 shadow-rose-600/30',
};

const sentimentGlow: Record<SentimentLevel, string> = {
  positive: 'from-emerald-500/30',
  neutral: 'from-zinc-500/20',
  stressed: 'from-amber-500/25',
  frustrated: 'from-rose-500/30',
  burned_out: 'from-rose-600/40',
};

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

/**
 * EmotionAvatar — developer avatar with sentiment ring and energy badge.
 * Pulses when fatigue is critical or sentiment is burned_out (rose accent).
 */
export function EmotionAvatar({
  name,
  sentiment,
  fatigue,
  energyScore,
  size = 'md',
  className,
}: EmotionAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const pulse =
    fatigue === 'critical' || sentiment === 'burned_out';

  return (
    <div className={cn('relative inline-flex', className)}>
      {pulse && (
        <motion.span
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br opacity-60 blur-md',
            sentimentGlow[sentiment]
          )}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full bg-zinc-900 font-semibold text-zinc-100 ring-2 shadow-lg',
          sentimentRing[sentiment],
          sizeMap[size]
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {initials}
        {energyScore !== undefined && size !== 'sm' && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
            {energyScore}
          </span>
        )}
      </motion.div>
    </div>
  );
}
