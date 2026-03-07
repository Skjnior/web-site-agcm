// src/components/layout/MobileMenu.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ name: string; href: string }>;
  isActive: (href: string) => boolean;
  session: Session | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
}

export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  isActive,
  session,
  status,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed top-[85px] left-0 right-0 bottom-0 bg-white z-40 lg:hidden animate-in slide-in-from-top duration-300 overflow-y-auto">
        <div className="px-4 py-6 space-y-6">
          {/* Navigation Links */}
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive(link.href)
                    ? 'text-guinea-red bg-guinea-red/10 border-l-4 border-guinea-red'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t pt-6">
            {status === 'loading' ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-guinea-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : session ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-guinea-red to-guinea-yellow flex items-center justify-center text-white font-bold text-lg">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {session.user.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {session.user.email}
                    </div>
                  </div>
                </div>

                {/* User Menu Items */}
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Tableau de bord</span>
                  </Link>

                  <Link
                    href="/dashboard/profil"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Mon profil</span>
                  </Link>

                  <Link
                    href="/dashboard/mes-formations"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Mes formations</span>
                  </Link>

                  <Link
                    href="/dashboard/mes-evenements"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Mes événements</span>
                  </Link>

                  {/* Admin Link */}
                  {['ADMIN', 'SUPER_ADMIN'].includes(session.user.role) && (
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-3 text-guinea-red hover:bg-guinea-red/10 rounded-lg transition-colors border border-guinea-red/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold">Administration</span>
                    </Link>
                  )}
                </div>

                {/* Sign Out Button */}
                <Button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/connexion" onClick={handleLinkClick} className="block">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription" onClick={handleLinkClick} className="block">
                  <Button className="w-full bg-gradient-to-r from-guinea-red to-guinea-red/90">
                    Devenir membre
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
