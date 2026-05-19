'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOutWithConfirmation } from '@/lib/sign-out-confirm';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import Logo from '../Logo';
import { publicNavForHeader } from '@/config/site-public-nav';

const NAV_OFFSET = 80;

function isHashHomeHref(href: string) {
  return href.startsWith('/#') && href.length > 2;
}

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (isHashHomeHref(href)) return false;
  if (href.startsWith('/#')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = '';
    };
  }, [isMenuOpen]);

  const scrollToHomeSection = (e: React.MouseEvent, href: string) => {
    if (!isHashHomeHref(href) || pathname !== '/') return;
    e.preventDefault();
    const id = href.split('#')[1];
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    if (!(await signOutWithConfirmation({ callbackUrl: '/' }))) return;
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const u = session?.user as { role?: string; canAccessIntranet?: boolean } | undefined;
  const showIntranetEntry =
    u?.role === 'SUPER_ADMIN' ||
    u?.role === 'ADMIN' ||
    (u?.role === 'MEMBER' && u?.canAccessIntranet === true);

  const mobileMenuTop = '4rem';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ${
          scrolled
            ? 'border-agcm-700/50 bg-agcm-900 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md'
            : 'border-agcm-800/30 bg-agcm-900 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-6">
          <div className="flex h-16 min-h-0 items-center gap-2 lg:h-[68px] lg:gap-3">
            <Link
              href="/"
              onClick={(e) => {
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  e.preventDefault();
                  scrollToTop();
                }
              }}
              className="group flex min-w-0 shrink-0 items-center"
            >
              <Logo variant="navbar" />
            </Link>

            <div className="hidden min-h-0 min-w-0 flex-1 justify-center lg:flex">
              <nav
                className="flex max-w-full flex-nowrap items-center gap-0.5 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] xl:gap-1 [&::-webkit-scrollbar]:hidden"
                aria-label="Navigation principale"
              >
                {publicNavForHeader.map((link) => {
                  const active = isNavActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      onClick={(e) => scrollToHomeSection(e, link.href)}
                      className={`shrink-0 rounded-md px-2 py-2 text-xs font-medium transition-all duration-200 xl:px-2.5 xl:text-sm ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3" ref={userMenuRef}>
              {isLoggedIn ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/15"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-green-600/20">
                      <User className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span>{showIntranetEntry ? 'Mon espace' : 'Mon compte'}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-52 animate-in rounded-xl border border-agcm-700/60 bg-agcm-800 py-2 shadow-xl fade-in slide-in-from-top-2 duration-200">
                      {showIntranetEntry && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          Tableau de bord
                        </Link>
                      )}
                      {showIntranetEntry && <div className="my-1 border-t border-agcm-700/50" />}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/connexion"
                  className="hidden whitespace-nowrap sm:inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] hover:from-red-500 hover:to-red-600 hover:shadow-red-500/40 xl:px-5 xl:py-2.5 xl:text-sm"
                >
                  Espace membre
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-x-0 bottom-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
            style={{ top: mobileMenuTop }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[95] overflow-y-auto overscroll-contain border-t border-agcm-700/50 bg-agcm-900/98 backdrop-blur-xl shadow-2xl lg:hidden animate-in slide-in-from-top-2 duration-200"
            style={{ top: mobileMenuTop }}
            id="mobile-nav-panel"
          >
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 pb-8">
              {publicNavForHeader.map((link) => {
                const active = isNavActive(pathname, link.href);
                return (
                  <Link
                    key={link.href + link.label + 'm'}
                    href={link.href}
                    onClick={(e) => scrollToHomeSection(e, link.href)}
                    className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 space-y-2 border-t border-agcm-700/50 pt-3">
                {isLoggedIn ? (
                  <>
                    {showIntranetEntry && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 font-medium text-white"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                          <User className="h-4 w-4 text-emerald-400" />
                        </div>
                        Tableau de bord
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link
                    href="/connexion"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 font-semibold text-white"
                  >
                    Espace membre
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
