// src/app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SignOutConfirmProvider } from '@/components/auth/SignOutConfirmProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SignOutConfirmProvider>{children}</SignOutConfirmProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
