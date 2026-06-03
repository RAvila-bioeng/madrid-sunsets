type DayNoteProps = {
  note: string | null;
};

export function DayNote({ note }: DayNoteProps) {
  if (!note) return null;

  return (
    <blockquote className="relative pl-5 border-l-2 border-accent-warm/30">
      <p className="font-display text-lg font-normal italic text-foreground-muted leading-relaxed line-clamp-2">
        {note}
      </p>
    </blockquote>
  );
}
