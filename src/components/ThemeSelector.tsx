'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Sparkles } from 'lucide-react';
import { useDashboardTheme, THEME_OPTIONS } from './DashboardThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function ThemeSelector({ variant = 'full', className }: ThemeSelectorProps) {
  const { theme, setTheme } = useDashboardTheme();

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap gap-2 items-center", className)}>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-dim flex items-center gap-1.5 mr-1">
          <Palette className="w-3.5 h-3.5 text-accent" /> Theme:
        </span>
        {THEME_OPTIONS.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "relative group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-accent/15 border-accent/40 text-accent shadow-[0_0_12px_-3px_rgba(139,92,246,0.3)] font-semibold"
                  : "bg-white/5 border-white/10 text-text-muted hover:text-text hover:bg-white/10"
              )}
              title={t.description}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-white/20 shadow-xs"
                style={{ backgroundColor: t.accentHex }}
              />
              <span>{t.name.split(' ')[0]}</span>
              {isActive && <Check className="w-3 h-3 text-accent shrink-0 ml-0.5" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg text-text flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" /> Dashboard Theme & Color Scheme
          </h3>
          <p className="text-text-muted text-sm mt-0.5">
            Select a theme to instantly customize the visual aesthetic of your cloud portal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THEME_OPTIONS.map((t) => {
          const isActive = theme === t.id;
          return (
            <motion.div
              key={t.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(t.id)}
              className={cn(
                "relative p-5 rounded-2xl border cursor-pointer transition-all overflow-hidden flex flex-col justify-between",
                isActive
                  ? "border-accent ring-2 ring-accent/30 bg-accent/10 shadow-[0_0_25px_-5px_rgba(139,92,246,0.25)]"
                  : "border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8"
              )}
            >
              {/* Color preview bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 items-center">
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 shadow-md z-20"
                        style={{ backgroundColor: t.bgHex }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 shadow-md z-10"
                        style={{ backgroundColor: t.accentHex }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 shadow-md z-0"
                        style={{ backgroundColor: t.secondaryHex }}
                      />
                    </div>
                    <span className="font-display font-semibold text-base text-text">
                      {t.name}
                    </span>
                  </div>

                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-white shadow-xs">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Mini UI Card Mockup Preview */}
              <div
                className="mt-4 p-3 rounded-xl border border-white/10 text-xs space-y-2"
                style={{
                  backgroundColor: t.bgHex,
                  color: t.isLight ? '#0f172a' : '#f1f5f9'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] opacity-90 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" style={{ color: t.accentHex }} /> Preview Card
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: `${t.accentHex}25`, color: t.accentHex }}
                  >
                    Live
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full w-3/4 opacity-60"
                  style={{ backgroundColor: t.accentHex }}
                />
                <div
                  className="h-1.5 rounded-full w-1/2 opacity-30"
                  style={{ backgroundColor: t.secondaryHex }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
