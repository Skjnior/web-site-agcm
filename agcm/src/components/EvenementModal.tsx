'use client';

import { X, Calendar, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

interface Event {
  id: string;
  titre: string;
  slug: string;
  description: string;
  dateDebut: string;
  dateFin: string | null;
  lieu: string | null;
  statut: string;
  image: string | null;
}

interface EvenementModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EvenementModal({ event, isOpen, onClose }: EvenementModalProps) {
  if (!isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          {event.image ? (
            <div className="relative w-full h-64 bg-slate-200">
              <Image
                src={event.image}
                alt={event.titre}
                fill
                className="object-cover rounded-t-2xl"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center rounded-t-2xl">
              <Calendar className="w-24 h-24 text-red-500/50" />
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
            {event.titre}
          </h2>

          {/* Informations */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar className="w-5 h-5 text-red-500" />
              <div>
                <span className="font-semibold">Date :</span>{' '}
                <span>
                  {formatDate(event.dateDebut)}
                  {event.dateFin && ` - ${formatDate(event.dateFin)}`}
                </span>
              </div>
            </div>

            {event.dateDebut && (
              <div className="flex items-center gap-3 text-slate-700">
                <Clock className="w-5 h-5 text-red-500" />
                <div>
                  <span className="font-semibold">Heure :</span>{' '}
                  <span>{formatTime(event.dateDebut)}</span>
                </div>
              </div>
            )}

            {event.lieu && (
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-red-500" />
                <div>
                  <span className="font-semibold">Lieu :</span>{' '}
                  <span>{event.lieu}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Statut :</span>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  event.statut === 'A_VENIR'
                    ? 'bg-blue-100 text-blue-800'
                    : event.statut === 'EN_COURS'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {event.statut === 'A_VENIR'
                  ? 'À venir'
                  : event.statut === 'EN_COURS'
                  ? 'En cours'
                  : 'Terminé'}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-agcm-900 mb-3">Description</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {event.description}
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



