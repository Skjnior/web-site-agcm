'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUp } from 'lucide-react';
import Logo from '../Logo';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 40);
            setShowScrollTop(y > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        if (window.location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.location.href = '/#top';
        }
    };

    const handleSmooth = (e: React.MouseEvent, id: string) => {
        if (window.location.pathname !== '/') {
            // Si on n'est pas sur la home, on laisse le comportement par défaut du lien (navigation vers /#id)
            return;
        }

        e.preventDefault();
        const el = document.querySelector(id);
        if (el) {
            const navHeight = 80;
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        setIsMenuOpen(false);
    };

    const navLinks = [
        { id: '#axes', label: 'Axes' },
        { id: '#about', label: 'À propos' },
        { id: '#actualites', label: 'Actualités' },
        { id: '#evenements', label: 'Événements' },
        { id: '#dons', label: 'Faire un don' },
        { id: '#contact', label: 'Contact' },
    ];

    return (
        <>
            <button
                onClick={scrollToTop}
                className={`scroll-to-top fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 p-2.5 sm:p-3 rounded-full bg-red-600 shadow-lg transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                aria-label="Retour en haut"
            >
                <ArrowUp className="text-white" size={20} />
            </button>

            <nav className={`fixed w-full z-40 transition-all duration-300 ${scrolled ? 'backdrop-blur bg-agcm-800/90 shadow-lg border-b border-white/10' : 'bg-agcm-800/80'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/#top" className="flex items-center gap-3" onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); scrollToTop(); } }}>
                            <Logo />
                        </Link>

                        <div className="hidden md:flex items-center gap-5 text-sm font-semibold">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.id.startsWith('#') ? `/${link.id}` : link.id}
                                    onClick={(e) => handleSmooth(e, link.id)}
                                    className="text-slate-200 hover:text-red-300 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link href="/dashboard" className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-red-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                Espace membre
                            </Link>
                        </div>

                        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-agcm-800/95 border-t border-white/10 px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={link.id.startsWith('#') ? `/${link.id}` : link.id}
                                className="block text-slate-200"
                                onClick={(e) => handleSmooth(e, link.id)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/dashboard" className="block text-slate-200" onClick={() => setIsMenuOpen(false)}>
                            Espace membre
                        </Link>
                    </div>
                )}
            </nav>
        </>
    );
}
