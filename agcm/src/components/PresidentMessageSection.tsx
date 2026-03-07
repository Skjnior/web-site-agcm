'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PresidentCitation {
    id: string;
    nom: string;
    message: string;
    debutMandat: string;
    finMandat: string | null;
    photoUrl: string | null;
}

export default function PresidentMessageSection() {
    const [citations, setCitations] = useState<PresidentCitation[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCitations = async () => {
            try {
                const response = await fetch('/api/public/president-messages');
                if (response.ok) {
                    const data = await response.json();
                    setCitations(data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des citations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCitations();
    }, []);

    useEffect(() => {
        if (citations.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % citations.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [citations.length]);

    if (loading || citations.length === 0) {
        if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
        return null;
    }

    const current = citations[currentIndex];

    const next = () => setCurrentIndex((prev) => (prev + 1) % citations.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + citations.length) % citations.length);

    return (
        <section className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <Quote size={40} className="text-white" />
            </div>

            <div className="relative z-10 py-2">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-px w-6 bg-red-500"></div>
                    <span className="text-red-400 font-bold text-[9px] uppercase tracking-widest">Message du Président</span>
                </div>

                <div className="min-h-[120px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            <p className="text-sm md:text-base italic text-white font-medium leading-relaxed relative pl-3 border-l-2 border-red-500">
                                « {current.message} »
                            </p>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-red-100/20 shadow-sm">
                                    <Image
                                        src={current.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
                                        alt={current.nom}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{current.nom}</h4>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        Mandat : {new Date(current.debutMandat).getFullYear()} — {current.finMandat ? new Date(current.finMandat).getFullYear() : (new Date().getFullYear() <= 2026 ? 'Présent' : new Date().getFullYear())}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {citations.length > 1 && (
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={prev}
                            className="p-1.5 rounded-full border border-white/10 text-slate-400 hover:border-red-500 hover:text-red-500 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex gap-1">
                            {citations.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-red-600' : 'w-1 bg-white/20'}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            className="p-1.5 rounded-full border border-white/10 text-slate-400 hover:border-red-500 hover:text-red-500 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
