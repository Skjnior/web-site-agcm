'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import Logo from '../Logo';

const navLinks = [
  { id: '#axes', label: 'Nos axes' },
  { id: '#about', label: 'À propos' },
  { id: '#actualites', label: 'Actualités' },
  { id: '#evenements', label: 'Événements' },
  { id: '#dons', label: 'Faire un don' },
  { id: '#contact', label: 'Contact' },
];

export default function Navbar() {
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

  /** Empêche le scroll de la page derrière le menu mobile + évite le débordement horizontal */
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

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  /**
   * Hauteur barre : bande tricolore (4px) + rangée (64px mobile / 72px lg).
   * Le menu mobile doit être rendu EN DEHORS de <nav> : sinon `backdrop-blur` sur la nav
   * crée un bloc d’ancrage et les `position:fixed` du menu ne couvrent plus l’écran (menu invisible).
   */
  const mobileMenuTop = '4.25rem'; /* 4px + 64px */

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/98 backdrop-blur-xl shadow-xl shadow-black/30 border-b border-slate-800/50'
          : 'bg-slate-900/90 backdrop-blur-lg'
      }`}
    >
      {/* Barre tricolore guinéenne - plus visible */}
      <div className="h-1 flex">
        <div className="flex-1 bg-[#dc2626]" />
        <div className="flex-1 bg-[#eab308]" />
        <div className="flex-1 bg-[#16a34a]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.location.pathname === '/') {
                e.preventDefault();
                scrollToTop();
              }
            }}
            className="flex items-center gap-2 shrink-0 group"
          >
            <Logo />
          </Link>

          {/* Desktop nav - liens centrés et espacés */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.id}
                onClick={(e) => scrollToSection(e, link.id)}
                className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA / User actions */}
          <div className="flex items-center gap-2 sm:gap-3" ref={userMenuRef}>
            {isLoggedIn ? (
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-all duration-200"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30">
                    <User className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span>Mon espace</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 py-2 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Tableau de bord
                    </Link>
                    <div className="my-1 border-t border-slate-700/50" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 rounded-lg shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:scale-[1.02]"
              >
                Espace membre
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Hors de <nav> pour que position:fixed soit relatif à la fenêtre (voir commentaire mobileMenuTop) */}
      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="lg:hidden fixed left-0 right-0 bottom-0 z-[90] bg-black/50 backdrop-blur-sm"
            style={{ top: mobileMenuTop }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className="lg:hidden fixed left-0 right-0 bottom-0 z-[95] overflow-y-auto overscroll-contain border-t border-slate-700/50 bg-slate-900/98 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-2 duration-200"
            style={{ top: mobileMenuTop }}
            id="mobile-nav-panel"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1 pb-8 max-[380px]:pb-10">
              {isLoggedIn ? (
                <div className="mb-4 space-y-2 border-b border-slate-700/50 pb-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white font-medium bg-white/10 rounded-xl border border-white/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                      <User className="h-4 w-4 text-emerald-400" />
                    </div>
                    Mon espace
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-red-400 font-medium rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="mb-4 border-b border-slate-700/50 pb-4">
                  <Link
                    href="/connexion"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 text-white font-semibold bg-gradient-to-r from-red-600 to-red-500 rounded-lg"
                  >
                    Espace membre
                  </Link>
                </div>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.id}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
