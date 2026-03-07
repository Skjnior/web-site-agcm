'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // Vérifie le scroll
    useEffect(() => {
        const toggleVisibility = () => {
            // Afficher le bouton dès qu'on défile vers le bas d'environ 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        // Check initial au chargement
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Action pour remonter
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button
                onClick={scrollToTop}
                className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                aria-label="Remonter en haut"
            >
                <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
            </button>
        </div>
    );
}
