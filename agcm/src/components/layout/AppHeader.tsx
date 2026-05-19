'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOutWithConfirmation } from '@/lib/sign-out-confirm';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, User, Lock, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { formatRole } from '@/lib/role-utils';

interface AppHeaderProps {
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  intranetHomeHref: string;
  userInfo?: {
    name: string;
    email: string;
    poste?: string;
    mandat?: string;
  };
  onMobileMenuClick?: () => void;
}

export default function AppHeader({ userRole, intranetHomeHref, userInfo, onMobileMenuClick }: AppHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/app/notifications?isRead=false&limit=1');
        if (response.ok) {
          const data = await response.json();
          setNotificationsCount(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    };

    if (session) {
      fetchNotifications();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleLogout = async () => {
    if (await signOutWithConfirmation({ redirect: true, callbackUrl: '/' })) {
      setShowUserMenu(false);
    }
  };

  const getRoleLabel = () => {
    if (userInfo?.poste) return `${userInfo.poste} – ${userInfo.mandat || ''}`;
    return formatRole(userRole);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)] transition-all duration-300">
      <div className="h-1 flex">
        <div className="flex-1 bg-guinea-red" />
        <div className="flex-1 bg-guinea-yellow" />
        <div className="flex-1 bg-guinea-green" />
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={intranetHomeHref} className="flex items-center gap-3">
            <Logo className="scale-90" variant="dark" />
          </Link>

          {/* User Info & Role */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-200">
                {userInfo?.name || session?.user?.name || 'Utilisateur'}
              </div>
              <div className="text-xs text-slate-400">
                {getRoleLabel()}
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-colors group"
              >
                <Bell className="h-5 w-5 group-hover:animate-pulse" />
                {notificationsCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                    {notificationsCount > 9 ? '9+' : notificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-slate-900 rounded-lg shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8)] border border-slate-800 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-slate-800">
                      <h3 className="font-semibold text-slate-200">Notifications</h3>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/app/notifications"
                        className="block px-4 py-2 text-sm text-center text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        Voir toutes les notifications
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-800"
              >
                <div className="h-8 w-8 rounded-full bg-slate-800 ring-2 ring-transparent hover:ring-blue-500/30 transition-all flex items-center justify-center text-blue-400 text-sm font-semibold">
                  {(userInfo?.name || session?.user?.name || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-lg shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8)] border border-slate-800 z-50">
                    <div className="p-4 border-b border-slate-800">
                      <div className="font-semibold text-slate-200 truncate">
                        {userInfo?.name || session?.user?.name}
                      </div>
                      <div className="text-sm text-slate-400 truncate">
                        {session?.user?.email}
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/dashboard/profil"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Mon profil
                      </Link>
                      <Link
                        href="/dashboard/changer-mot-de-passe"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                      >
                        <Lock className="h-4 w-4" />
                        Changer mot de passe
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors group"
                      >
                        <LogOut className="h-4 w-4 group-hover:-translate-x-1 group-hover:scale-110 transition-transform" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={onMobileMenuClick}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

