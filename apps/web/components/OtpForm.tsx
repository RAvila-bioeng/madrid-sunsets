'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

type OtpState = { error: string | null; errorCount: number };
type OtpAction = (prevState: OtpState, formData: FormData) => Promise<OtpState>;

type OtpFormLabels = {
  codeLabel: string;
  submit: string;
  pending: string;
  invalidCode: string;
  noCode: string;
  requestNew: string;
  loginHref: string;
};

type OtpFormProps = {
  action: OtpAction;
  email: string;
  next: string;
  labels: OtpFormLabels;
};

function SubmitButton({
  submitLabel,
  pendingLabel,
}: { submitLabel: string; pendingLabel: string }) {
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

export function OtpForm({ action, email, next, labels }: OtpFormProps) {
  const [state, formAction] = useActionState(action, { error: null, errorCount: 0 });
  const [code, setCode] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on initial mount (replaces autoFocus to satisfy a11y lint)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear input and refocus whenever a new error arrives
  useEffect(() => {
    if (state.errorCount > 0) {
      setCode('');
      inputRef.current?.focus();
    }
  }, [state.errorCount]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCode(digits);
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <label htmlFor="otp-token" className="text-sm font-medium text-foreground">
          {labels.codeLabel}
        </label>
        <input
          ref={inputRef}
          id="otp-token"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          pattern="[0-9]{6,10}"
          required
          value={code}
          onChange={handleChange}
          className="h-16 rounded-lg border border-border bg-background px-3 text-center font-mono text-3xl tracking-[0.5em] text-foreground outline-none transition-colors placeholder:text-foreground-muted/40 focus:border-accent-warm focus:ring-2 focus:ring-accent-warm/25"
          placeholder="······"
        />
        {state.error ? (
          <p role="alert" className="min-h-5 text-xs text-red-500">
            {labels.invalidCode}
          </p>
        ) : (
          <p className="min-h-5" aria-hidden />
        )}
      </div>

      <div>
        <SubmitButton submitLabel={labels.submit} pendingLabel={labels.pending} />
      </div>

      <p className="text-center text-xs text-foreground-muted">
        {labels.noCode}{' '}
        <a
          href={labels.loginHref}
          className="text-accent-warm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded"
        >
          {labels.requestNew}
        </a>
      </p>
    </form>
  );
}
