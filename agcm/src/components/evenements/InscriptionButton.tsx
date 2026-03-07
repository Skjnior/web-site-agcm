'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type InscriptionButtonProps = {
  evenementId: string;
  evenementSlug?: string; // Slug optionnel pour les routes API
  inscriptionRequise: boolean;
  placesMax?: number | null;
  dateInscriptionFin?: Date | null;
};

type InscriptionStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'LISTE_ATTENTE' | null;

export function InscriptionButton({
  evenementId,
  evenementSlug,
  inscriptionRequise,
  placesMax,
  dateInscriptionFin,
}: InscriptionButtonProps) {
  // Utiliser le slug si disponible, sinon l'ID
  const identifier = evenementSlug || evenementId;
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [inscriptionStatus, setInscriptionStatus] = useState<InscriptionStatus>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [placesDisponibles, setPlacesDisponibles] = useState<number | null>(null);

  // L'utilisateur est authentifié si la session existe
  const isAuthenticated = sessionStatus === 'authenticated' && !!session?.user;
  const isLoadingSession = sessionStatus === 'loading';

  useEffect(() => {
    // Attendre que le statut de la session soit déterminé
    if (isLoadingSession) {
      return;
    }

    // Si l'utilisateur est connecté, vérifier son statut d'inscription
    if (isAuthenticated) {
      checkInscriptionStatus();
    } else {
      setIsChecking(false);
    }
  }, [identifier, isAuthenticated, isLoadingSession]);

  useEffect(() => {
    // Récupérer le nombre de places disponibles (indépendamment de l'authentification)
    if (placesMax) {
      fetch(`/api/evenements/${encodeURIComponent(identifier)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.placesDisponibles !== undefined) {
            setPlacesDisponibles(data.placesDisponibles);
          }
        })
        .catch(console.error);
    }
  }, [identifier, placesMax]);

  const checkInscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/evenements/${encodeURIComponent(identifier)}/inscription/status`);
      if (response.ok) {
        const data = await response.json();
        setInscriptionStatus(data.status || null);
      }
    } catch (error) {
      console.error('Error checking inscription status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInscription = async () => {
    // Si non connecté, rediriger vers la page de connexion
    if (!isAuthenticated) {
      router.push('/connexion?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // Si connecté, procéder à l'inscription
    setIsLoading(true);
    try {
      console.log('Attempting to register for event:', identifier);
      const url = `/api/evenements/${encodeURIComponent(identifier)}/inscription`;
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Si ce n'est pas du JSON, lire le texte pour voir ce qui est retourné
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        console.error('Response status:', response.status);
        console.error('Response URL:', response.url);
        
        // Si c'est une erreur 404, la route n'existe pas
        if (response.status === 404) {
          throw new Error('La route API n\'a pas été trouvée. Veuillez redémarrer le serveur de développement.');
        }
        
        throw new Error(`Le serveur a retourné une erreur (${response.status}). Veuillez redémarrer le serveur de développement.`);
      }

      if (response.ok) {
        setInscriptionStatus(data.inscription.status);
        alert(data.message || 'Inscription réussie !');
        router.refresh();
      } else {
        // Afficher le message d'erreur détaillé
        const errorMessage = data.error || data.message || 'Erreur lors de l\'inscription';
        console.error('Inscription error:', data);
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Inscription error:', error);
      const errorMessage = error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnulation = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre inscription ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/evenements/${encodeURIComponent(identifier)}/inscription`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setInscriptionStatus(null);
        alert('Inscription annulée');
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      alert('Erreur lors de l\'annulation');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si les inscriptions sont ouvertes
  const now = new Date();
  const inscriptionsOuvertes = !dateInscriptionFin || now <= dateInscriptionFin;
  const inscriptionsFermees = dateInscriptionFin && now > dateInscriptionFin;

  if (!inscriptionRequise) {
    return (
      <div className="bg-white border rounded-xl p-4">
        <div className="text-sm text-gray-500 mb-2">Inscription</div>
        <div className="text-gray-700">Inscription facultative</div>
      </div>
    );
  }

  if (isChecking || isLoadingSession) {
    return (
      <div className="bg-white border rounded-xl p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Si déjà inscrit
  if (inscriptionStatus) {
    return (
      <div className="bg-white border rounded-xl p-4 space-y-3">
        {inscriptionStatus === 'CONFIRMEE' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            ✓ Inscription confirmée
          </div>
        )}
        
        {inscriptionStatus === 'LISTE_ATTENTE' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⏳ Vous êtes sur la liste d'attente
          </div>
        )}
        
        {inscriptionStatus === 'EN_ATTENTE' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            ⏳ Inscription en attente de confirmation
          </div>
        )}

        {placesMax && placesDisponibles !== null && (
          <div className="text-sm text-gray-500">
            Places disponibles : {placesDisponibles} / {placesMax}
          </div>
        )}

        <button
          onClick={handleAnnulation}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
        >
          {isLoading ? 'Annulation...' : 'Annuler l\'inscription'}
        </button>
      </div>
    );
  }

  // Si pas encore inscrit
  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      {inscriptionsFermees && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          Les inscriptions sont closes
        </div>
      )}

      {placesMax && placesDisponibles !== null && placesDisponibles === 0 && inscriptionsOuvertes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          Complet - Inscription sur liste d'attente possible
        </div>
      )}

      {placesMax && placesDisponibles !== null && placesDisponibles > 0 && (
        <div className="text-sm text-gray-500">
          Places disponibles : {placesDisponibles} / {placesMax}
        </div>
      )}

      {inscriptionsOuvertes && (
        <>
          {!isAuthenticated ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                Vous devez être connecté pour vous inscrire à cet événement.
              </div>
              <button
                onClick={handleInscription}
                disabled={isLoading}
                className="w-full bg-guinea-red hover:bg-guinea-red/90 text-white rounded-lg py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Redirection...' : 'Se connecter pour s\'inscrire'}
              </button>
            </>
          ) : (
            <button
              onClick={handleInscription}
              disabled={isLoading}
              className="w-full bg-guinea-red hover:bg-guinea-red/90 text-white rounded-lg py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Inscription...'
                : placesMax && placesDisponibles === 0
                ? 'S\'inscrire sur liste d\'attente'
                : 'S\'inscrire'}
            </button>
          )}
        </>
      )}

      {inscriptionsFermees && (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 rounded-lg py-2 font-semibold cursor-not-allowed"
        >
          Inscriptions fermées
        </button>
      )}
    </div>
  );
}

