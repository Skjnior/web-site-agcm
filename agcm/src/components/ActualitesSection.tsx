'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Calendar,
  User,
  Clock,
  Facebook,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Newspaper,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ActualiteModal from './ActualiteModal';

interface Actualite {
  id: string;
  titre: string;
  contenu: string | null;
  imagePrincipale: string | null;
  createdAt: string;
  type: string;
  facebookPostId?: string | null;
  auteurPoste?: {
    nom: string;
  } | null;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ACTUALITE: { label: 'Actualité', color: 'bg-blue-500' },
  ACTIVITE: { label: 'Activité', color: 'bg-green-500' },
  PARTAGE: { label: 'Partage', color: 'bg-purple-500' },
  ANNONCE: { label: 'Annonce', color: 'bg-red-500' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  return `Il y a ${months} mois`;
}

function isNew(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 3 * 24 * 3600 * 1000; // < 3 jours
}

// Skeleton loader card
function SkeletonCard({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden animate-pulse shadow-md ${large ? 'h-[440px]' : 'h-48'
        }`}
    >
      <div className={`bg-slate-200 ${large ? 'h-64' : 'h-28'}`} />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  );
}

// --- Hero Card (grand article à gauche) ---
function HeroCard({
  actu,
  onRead,
  hasMounted,
}: {
  actu: Actualite;
  onRead: (a: Actualite) => void;
  hasMounted: boolean;
}) {
  const typeInfo = TYPE_LABELS[actu.type] || { label: actu.type, color: 'bg-slate-500' };
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => onRead(actu)}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full min-h-[440px] flex flex-col
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{ transition: 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease' }}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <Image
          src={actu.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'}
          alt={actu.titre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-bold text-white rounded-full uppercase tracking-wide ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
          {hasMounted && isNew(actu.createdAt) && (
            <span className="px-2.5 py-1 text-xs font-bold text-black bg-yellow-400 rounded-full uppercase tracking-wide animate-pulse">
              Nouveau
            </span>
          )}
        </div>

        {/* Facebook badge */}
        {actu.facebookPostId && (
          <div className="absolute top-3 right-3">
            <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg" title="Publié sur Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-extrabold text-white leading-tight line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300">
            {actu.titre}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {actu.contenu && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
            {actu.contenu}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {hasMounted ? timeAgo(actu.createdAt) : '...'}
            </span>
            {actu.auteurPoste && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {actu.auteurPoste.nom}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold text-sm group-hover:gap-2.5 transition-all duration-200">
            Lire <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Small Card ---
function SmallCard({
  actu,
  index,
  onRead,
  hasMounted,
}: {
  actu: Actualite;
  index: number;
  onRead: (a: Actualite) => void;
  hasMounted: boolean;
}) {
  const typeInfo = TYPE_LABELS[actu.type] || { label: actu.type, color: 'bg-slate-500' };
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => onRead(actu)}
      className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer flex gap-3
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}
      `}
      style={{
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s, box-shadow 0.3s ease`,
      }}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-24 sm:w-28">
        <Image
          src={actu.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80'}
          alt={actu.titre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-1 left-1 flex flex-col gap-1">
          <span
            className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded uppercase ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
          {hasMounted && isNew(actu.createdAt) && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-black bg-yellow-400 rounded uppercase">
              Nouveau
            </span>
          )}
        </div>
        {actu.facebookPostId && (
          <div className="absolute bottom-1 right-1">
            <div className="bg-blue-600/90 text-white p-1 rounded-full" title="Sur Facebook">
              <Facebook className="w-2.5 h-2.5" />
            </div>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 p-3 min-w-0">
        <h4 className="font-bold text-agcm-900 text-sm leading-tight line-clamp-2 group-hover:text-red-600 transition-colors duration-200 mb-1.5">
          {actu.titre}
        </h4>
        {actu.contenu && (
          <p className="text-slate-500 text-xs line-clamp-2 mb-2">{actu.contenu}</p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{hasMounted ? timeAgo(actu.createdAt) : '...'}</span>
          {actu.auteurPoste && (
            <>
              <span>•</span>
              <User className="w-3 h-3" />
              <span className="truncate">{actu.auteurPoste.nom}</span>
            </>
          )}
        </div>
        <span className="inline-flex items-center gap-1 mt-2 text-red-600 text-xs font-semibold group-hover:gap-2 transition-all">
          Lire <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function ActualitesSection() {
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActualite, setSelectedActualite] = useState<Actualite | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchActualites = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch('/api/public/actualites?limit=9&_t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        setActualites(data.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActualites();
    // Auto-refresh toutes les 60 secondes
    const interval = setInterval(() => fetchActualites(true), 60000);
    return () => clearInterval(interval);
  }, [fetchActualites]);

  const openModal = (actu: Actualite) => {
    setSelectedActualite(actu);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard large />
          </div>
          <div className="lg:col-span-3 space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (actualites.length === 0) {
    return (
      <div className="text-center py-16">
        <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">Aucune actualité disponible pour le moment.</p>
        <p className="text-slate-400 text-sm mt-2">Revenez bientôt pour découvrir nos dernières nouvelles !</p>
      </div>
    );
  }

  const [hero, ...others] = actualites;
  const sideCards = others.slice(0, 4);
  const extraCards = others.slice(4);

  return (
    <div className="space-y-8">
      {/* Refresh bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        {lastUpdated && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Mis à jour {hasMounted ? timeAgo(lastUpdated.toISOString()) : '...'}
          </span>
        )}
        <button
          onClick={() => fetchActualites(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Magazine grid: Hero + Side cards */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Hero */}
        <div className="lg:col-span-2">
          <HeroCard actu={hero} onRead={openModal} hasMounted={hasMounted} />
        </div>

        {/* Side cards */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {sideCards.map((actu, i) => (
            <SmallCard key={actu.id} actu={actu} index={i} onRead={openModal} hasMounted={hasMounted} />
          ))}
        </div>
      </div>

      {/* Extra cards row (si > 5 articles) */}
      {extraCards.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          {extraCards.map((actu, i) => (
            <div
              key={actu.id}
              onClick={() => openModal(actu)}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-36 overflow-hidden">
                <Image
                  src={actu.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80'}
                  alt={actu.titre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {hasMounted && isNew(actu.createdAt) && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-black bg-yellow-400 rounded uppercase">
                    Nouveau
                  </span>
                )}
                {actu.facebookPostId && (
                  <div className="absolute top-2 right-2 bg-blue-600/90 text-white p-1 rounded-full">
                    <Facebook className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-bold text-agcm-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                  {actu.titre}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {hasMounted ? timeAgo(actu.createdAt) : '...'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer link */}
      <div className="text-center pt-2">
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm border border-red-200 hover:border-red-400 rounded-full px-5 py-2 transition-all duration-200 hover:bg-red-50"
        >
          Voir toutes les actualités
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Modal */}
      <ActualiteModal
        actualite={selectedActualite}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedActualite(null);
        }}
      />
    </div>
  );
}
