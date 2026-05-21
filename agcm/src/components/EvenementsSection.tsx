'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
import EvenementModal from './EvenementModal';

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

interface EvenementsData {
  passes: Event[];
  enCours: Event[];
  aVenir: Event[];
}

type FilterType = 'aVenir' | 'enCours' | 'passes';

interface EvenementsSectionProps {
  onProposerEvenement: () => void;
}

export default function EvenementsSection({ onProposerEvenement }: EvenementsSectionProps) {
  const [events, setEvents] = useState<EvenementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('aVenir');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/public/evenements?afficheSite=true');
        if (!response.ok) throw new Error('Erreur lors du chargement');
        const data = await response.json();
        const evts: EvenementsData = data.data;
        setEvents(evts);

        // Sélectionner le premier filtre qui a des événements
        if (evts.aVenir.length > 0) setActiveFilter('aVenir');
        else if (evts.enCours.length > 0) setActiveFilter('enCours');
        else if (evts.passes.length > 0) setActiveFilter('passes');
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getActiveEvents = () => {
    if (!events) return [];
    switch (activeFilter) {
      case 'aVenir':
        return events.aVenir;
      case 'enCours':
        return events.enCours;
      case 'passes':
        return events.passes;
      default:
        return events.aVenir;
    }
  };

  // Auto-scroll avec animation
  useEffect(() => {
    const activeEvents = getActiveEvents();
    if (loading || activeEvents.length <= 1 || isPaused) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels par frame
    let animationFrame: number;

    const scroll = () => {
      if (isPaused) return;

      scrollPosition += scrollSpeed;

      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }

      container.scrollTo({
        left: scrollPosition,
        behavior: 'auto',
      });

      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [loading, activeFilter, events, isPaused]);

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

  const activeEvents = getActiveEvents();

  if (!loading && events && events.aVenir.length === 0 && events.enCours.length === 0 && events.passes.length === 0) {
    return null;
  }

  return (
    <section id="evenements" className="py-12 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="text-center mb-8 px-1">
          <span className="text-red-600 font-semibold text-sm uppercase">Événements</span>
          <h2 className="landing-heading text-agcm-900 mt-2">Nos événements</h2>
          <p className="text-slate-600 text-sm mt-2">Découvrez les événements de l'association</p>
        </div>

        {/* Filtres */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap px-1">
          {events?.aVenir.length ? (
            <button
              onClick={() => setActiveFilter('aVenir')}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all ${activeFilter === 'aVenir'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              À venir
            </button>
          ) : null}
          {events?.enCours.length ? (
            <button
              onClick={() => setActiveFilter('enCours')}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all ${activeFilter === 'enCours'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              En cours
            </button>
          ) : null}
          {events?.passes.length ? (
            <button
              onClick={() => setActiveFilter('passes')}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all ${activeFilter === 'passes'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              Passés
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-slate-600 mt-4">Chargement des événements...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Aucun événement {activeFilter === 'aVenir' ? 'à venir' : activeFilter === 'enCours' ? 'en cours' : 'passé'} pour le moment.</p>
          </div>
        ) : activeEvents.length === 1 ? (
          /* Affichage centré pour un seul événement */
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {activeEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div className="relative w-full h-56 bg-slate-200">
                    <Image
                      src={event.image || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80'}
                      alt={event.titre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-agcm-900 mb-4">
                      {event.titre}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span>
                          {formatDate(event.dateDebut)}
                          {event.dateFin && ` - ${formatDate(event.dateFin)}`}
                        </span>
                      </div>
                      {event.dateDebut && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(event.dateDebut)}</span>
                        </div>
                      )}
                      {event.lieu && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>{event.lieu}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate-700 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    <div className="mb-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activeFilter === 'aVenir'
                          ? 'bg-blue-100 text-blue-800'
                          : activeFilter === 'enCours'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {activeFilter === 'aVenir' ? 'À venir' : activeFilter === 'enCours' ? 'En cours' : 'Passé'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                    >
                      En savoir plus
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="relative overflow-x-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Scroll horizontal avec auto-scroll */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide touch-pan-x"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="flex gap-4 sm:gap-6 min-w-max" style={{ width: 'max-content' }}>
                {activeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex-shrink-0 w-[280px] sm:w-72 md:w-80 bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden hover-lift"
                  >
                    {/* Image */}
                    <div className="relative w-full h-48 bg-slate-200">
                      <Image
                        src={event.image || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80'}
                        alt={event.titre}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Contenu */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-agcm-900 mb-3 line-clamp-2">
                        {event.titre}
                      </h3>

                      {/* Dates */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span>
                            {formatDate(event.dateDebut)}
                            {event.dateFin && ` - ${formatDate(event.dateFin)}`}
                          </span>
                        </div>
                        {event.dateDebut && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(event.dateDebut)}</span>
                          </div>
                        )}
                        {event.lieu && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span>{event.lieu}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-sm text-slate-700 mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      )}

                      {/* Badge statut */}
                      <div className="mb-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activeFilter === 'aVenir'
                            ? 'bg-blue-100 text-blue-800'
                            : activeFilter === 'enCours'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {activeFilter === 'aVenir'
                            ? 'À venir'
                            : activeFilter === 'enCours'
                              ? 'En cours'
                              : 'Passé'}
                        </span>
                      </div>

                      {/* Bouton */}
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                      >
                        En savoir plus
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicateur de scroll */}
            {activeEvents.length > 1 && (
              <div className="text-center mt-4">
                <p className="text-xs text-slate-500">
                </p>
              </div>
            )}

            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        )}

        {/* Bouton proposer événement */}
        {events && (events.aVenir.length > 0 || events.enCours.length > 0 || events.passes.length > 0) && (
          <div className="text-center mt-6">
            <button
              onClick={onProposerEvenement}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-lg shadow hover:-translate-y-0.5 transition text-sm font-semibold"
            >
              Proposer un événement <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Modal */}
        <EvenementModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      </div>
    </section>
  );
}
