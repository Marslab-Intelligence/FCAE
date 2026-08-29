'use client';

import React from 'react';
import { DashboardThemeProvider } from '@/components/DashboardThemeProvider';
import { HolographicWall } from '@/components/ui/holographic-wall';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeProvider>
      <div className="relative min-h-screen w-full bg-bg text-text transition-colors duration-300 font-sans antialiased overflow-x-hidden">
        <HolographicWall />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </DashboardThemeProvider>
  );
}

export default AppShell;
