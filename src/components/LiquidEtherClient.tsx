'use client';

import dynamic from 'next/dynamic';
import type { LiquidEtherProps } from './LiquidEther';

// ssr: false is only valid inside a Client Component
const LiquidEther = dynamic(() => import('./LiquidEther'), {
  ssr: false,
  loading: () => null,
});

export function LiquidEtherClient(props: LiquidEtherProps) {
  return <LiquidEther {...props} />;
}
