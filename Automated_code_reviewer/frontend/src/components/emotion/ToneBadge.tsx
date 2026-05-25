import { motion } from 'framer-motion';
import {
  Heart,
  GraduationCap,
  Target,
  Minimize2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReviewTone } from '@/types/emotion';

interface ToneBadgeProps {
  tone: ReviewTone;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const toneConfig: Record<
  ReviewTone,
  { label: string; description: string; variant: 'default' | 'emerald' | 'amber' | 'rose'; icon: typeof Heart }
> = {
  empathetic: {
    label: 'Empathetic',
    description: 'Acknowledge effort, soften delivery',
    variant: 'rose',
    icon: Heart,
  },
  educational: {
    label: 'Educational',
    description: 'Teach with examples and context',
    variant: 'default',
    icon: GraduationCap,
  },
  direct: {
    label: 'Direct',
    description: 'Clear, actionable feedback',
    variant: 'emerald',
    icon: Target,
  },
  concise: {
    label: 'Concise',
    description: 'Bullet points, essentials only',
    variant: 'amber',
    icon: Minimize2,
  },
};

/**
 * ToneBadge — AI review tone selector (Empathetic / Educational / Direct / Concise).
 * Used in DeveloperContextSidebar for manual override of auto-adapted tone.
 */
export function ToneBadge({ tone, active, onClick, className }: ToneBadgeProps) {
  const { label, description, variant, icon: Icon } = toneConfig[tone];
  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
        active
          ? 'border-indigo-500/50 bg-indigo-500/10'
          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700',
        className
      )}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      layout
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80">
        <Icon className="h-4 w-4 text-zinc-300" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-100">{label}</span>
          <Badge variant={variant} className="text-[10px]">
            {tone}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>
    </Wrapper>
  );
}

export function ToneBadgeInline({ tone, className }: { tone: ReviewTone; className?: string }) {
  const { label, variant } = toneConfig[tone];
  return (
    <Badge variant={variant} className={cn('capitalize', className)}>
      {label}
    </Badge>
  );
}
