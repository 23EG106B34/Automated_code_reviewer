import { motion } from 'framer-motion';
import { Battery, BatteryLow, BatteryWarning, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FatigueLevel } from '@/types/emotion';

interface FatigueIndicatorProps {
  level: FatigueLevel;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

const config: Record<
  FatigueLevel,
  { label: string; color: string; bar: string; icon: typeof Battery; pct: number }
> = {
  low: {
    label: 'Well rested',
    color: 'text-emerald-400',
    bar: 'bg-emerald-500',
    icon: Battery,
    pct: 90,
  },
  moderate: {
    label: 'Moderate fatigue',
    color: 'text-amber-400',
    bar: 'bg-amber-500',
    icon: BatteryLow,
    pct: 55,
  },
  high: {
    label: 'High fatigue',
    color: 'text-rose-400',
    bar: 'bg-rose-500',
    icon: BatteryWarning,
    pct: 28,
  },
  critical: {
    label: 'Critical — rest recommended',
    color: 'text-rose-500',
    bar: 'bg-rose-600',
    icon: ZapOff,
    pct: 10,
  },
};

/**
 * FatigueIndicator — visual meter for developer fatigue (low → critical).
 * Rose = high/critical, amber = moderate, emerald = well rested.
 */
export function FatigueIndicator({
  level,
  showLabel = true,
  compact = false,
  className,
}: FatigueIndicatorProps) {
  const { label, color, bar, icon: Icon, pct } = config[level];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', color)} />
        {showLabel && (
          <span className={cn('text-sm font-medium', color)}>{label}</span>
        )}
        {!compact && (
          <span className="ml-auto text-xs text-zinc-500 capitalize">{level}</span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={cn('h-full rounded-full', bar)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
