'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Thème global (localStorage `agcm-theme`).
 * Mode sombre : classe `dark` sur <html> — utiliser les variantes `dark:` dans l’admin.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="agcm-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
