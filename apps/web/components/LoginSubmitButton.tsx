'use client';

import { useFormStatus } from 'react-dom';

type LoginSubmitButtonProps = {
  pendingLabel: string;
  submitLabel: string;
};

export function LoginSubmitButton({ pendingLabel, submitLabel }: LoginSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 rounded-lg bg-accent-warm px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {pending ? pendingLabel : submitLabel}
    </button>
  );
}
