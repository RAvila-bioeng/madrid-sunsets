type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-background/45 px-6 py-20 text-center">
      <p className="font-display text-2xl font-normal text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-foreground-muted max-w-xs leading-relaxed">{description}</p>
      )}
    </div>
  );
}
