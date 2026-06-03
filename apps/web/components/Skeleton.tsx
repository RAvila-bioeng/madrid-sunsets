import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md',
        'bg-gradient-to-br from-accent-warm/10 to-accent-gold/5',
        className,
      )}
    />
  );
}
