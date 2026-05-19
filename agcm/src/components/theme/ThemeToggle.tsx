'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark' | 'system';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className={`inline-flex h-9 w-[7.5rem] rounded-lg border border-slate-300 bg-white/80 dark:border-slate-700/50 dark:bg-slate-800/30 ${className}`}
        aria-hidden
      />
    );
  }

  const cycle: Mode[] = ['light', 'dark', 'system'];
  const current = (theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system') as Mode;
  const next = () => {
    const i = cycle.indexOf(current);
    setTheme(cycle[(i + 1) % cycle.length]);
  };

  const Icon = current === 'system' ? Monitor : current === 'dark' ? Moon : Sun;
  const label =
    current === 'system'
      ? `Thème : système (${resolvedTheme === 'dark' ? 'sombre' : 'clair'})`
      : current === 'dark'
        ? 'Thème : sombre'
        : 'Thème : clair';

  return (
    <button
      type="button"
      onClick={next}
      title={label}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600/80 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800/70 ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0 text-amber-400/90" aria-hidden />
      <span className="hidden sm:inline tabular-nums">
        {current === 'system' ? 'Système' : current === 'dark' ? 'Sombre' : 'Clair'}
      </span>
    </button>
  );
}
