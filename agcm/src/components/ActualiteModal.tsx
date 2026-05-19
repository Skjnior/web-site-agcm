'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Eye, ArrowRight, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Actualite {
  id: string;
  titre: string;
  contenu: string | null;
  imagePrincipale: string | null;
  createdAt: string;
  type: string;
  auteurPoste?: {
    nom: string;
  } | null;
}

interface ActualiteModalProps {
  actualite: Actualite | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActualiteModal({ actualite, isOpen, onClose }: ActualiteModalProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!isOpen || !actualite) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8 text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {/* Image */}
          <div className="relative w-full h-80 bg-slate-200">
            <Image
              src={actualite.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'}
              alt={actualite.titre}
              fill
              className="object-cover rounded-t-2xl"
            />
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 md:p-8">
          {/* Titre */}
          <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mb-6 leading-tight">
            {actualite.titre}
          </h2>

          {/* Informations */}
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-slate-200">
            {actualite.createdAt && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">
                  {hasMounted ? formatDate(actualite.createdAt) : '...'}
                </span>
              </div>
            )}

            {actualite.auteurPoste && (
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">
                  {actualite.auteurPoste.nom}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-600">
              <Tag className="w-5 h-5 text-red-500" />
              <span className="text-sm font-bold uppercase tracking-wider text-red-600">
                {actualite.type}
              </span>
            </div>
          </div>

          {/* Contenu */}
          {actualite.contenu && (
            <div
              className="agcm-article-body prose prose-slate max-w-none mb-8 text-base leading-relaxed text-lg text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900"
              dangerouslySetInnerHTML={{ __html: actualite.contenu }}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
            <Link
              href={`/actualites/${actualite.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-agcm-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all group"
            >
              Voir la page complète
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




