'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';

interface AppLayoutClientProps {
  children: React.ReactNode;
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  isBureau?: boolean;
  posteNom?: string;
  userInfo: {
    name: string;
    email: string;
    poste?: string;
    mandat?: string;
  };
}

export default function AppLayoutClient({
  children,
  userRole,
  isBureau,
  posteNom,
  userInfo,
}: AppLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] w-[20vw] h-[20vw] rounded-full bg-emerald-900/10 blur-[80px]" />
      </div>

      {/* Sidebar desktop */}
      <AppSidebar
        userRole={userRole}
        isBureau={isBureau}
        posteNom={posteNom}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 w-full h-full overflow-hidden relative z-10 min-w-0">
        <AppHeader
          userRole={userRole}
          userInfo={userInfo}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
