import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
        emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        muted: 'border-zinc-700 bg-zinc-800/50 text-zinc-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
