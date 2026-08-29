'use client';

import { AlertTriangle } from 'lucide-react';

interface ModelErrorProps {
  fileName?: string;
  message?: string;
}

export function ModelError({
  fileName = 'image.png',
  message = 'This model does not support image input.',
}: ModelErrorProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
        ERROR: Cannot read &quot;{fileName}&quot;
      </h1>
      <p className="text-text-muted text-base leading-relaxed max-w-md">
        {message}
      </p>
      <p className="text-text-dim text-sm">
        Please use a supported image format or try a different model.
      </p>
    </div>
  );
}