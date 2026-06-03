'use client';

import Image from 'next/image';
import { useState } from 'react';

type PhotoImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Wraps next/image with a warm gradient fallback when the image fails to load.
 * Used for seed data where Supabase Storage paths may not resolve to real images.
 */
export function PhotoImage({ src, alt, fill, sizes, priority, className }: PhotoImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={[
          'bg-gradient-to-br from-accent-warm/20 via-accent-gold/10 to-accent-rose/10',
          className ?? '',
        ].join(' ')}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
