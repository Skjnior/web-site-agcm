'use client';

import { X, MapPin, Calendar, User, Target } from 'lucide-react';
import Image from 'next/image';

interface Projet {
  id: string;
  titre: string;
  slug: string;
  description: string;
  objectif: string;
  image: string | null;
  responsablePoste: {
    nom: string;
  } | null;
}

interface ProjetModalProps {
  projet: Projet | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjetModal({ projet, isOpen, onClose }: ProjetModalProps) {
  if (!isOpen || !projet) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {/* Image */}
          {projet.image ? (
            <div className="relative w-full h-64 bg-slate-200">
              <Image
                src={projet.image}
                alt={projet.titre}
                fill
                className="object-cover rounded-t-2xl"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center rounded-t-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-red-500/30 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-red-600 text-4xl font-bold">
                    {projet.titre[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Titre */}
          <h2 className="text-3xl font-bold text-agcm-900 mb-4">
            {projet.titre}
          </h2>

          {/* Informations */}
          <div className="space-y-3 mb-6">
            {projet.responsablePoste && (
              <div className="flex items-center gap-3 text-slate-700">
                <User className="w-5 h-5 text-red-500" />
                <div>
                  <span className="font-semibold">Responsable :</span>{' '}
                  <span>{projet.responsablePoste.nom}</span>
                </div>
              </div>
            )}
          </div>

          {/* Objectif */}
          {projet.objectif && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-agcm-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Objectif
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {projet.objectif}
              </p>
            </div>
          )}

          {/* Description */}
          {projet.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-agcm-900 mb-3">Description</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {projet.description}
              </p>
            </div>
          )}

          {/* Bouton fermer */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



