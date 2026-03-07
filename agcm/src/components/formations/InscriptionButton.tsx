'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type InscriptionButtonProps = {
  formationId: string;
  formationSlug?: string; // Slug optionnel pour les routes API
  placesDisponibles: number;
  dateInscriptionDebut: Date;
  dateInscriptionFin: Date;
  tarifMembre: number | string;
  tarifNonMembre: number | string;
  devise: string;
};

type InscriptionStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'LISTE_ATTENTE' | null;

export function InscriptionButton({
  formationId,
  formationSlug,
  placesDisponibles,
  dateInscriptionDebut,
  dateInscriptionFin,
  tarifMembre,
  tarifNonMembre,
  devise,
}: InscriptionButtonProps) {
  const router = useRouter();
  // Utiliser le slug si disponible, sinon l'ID
  const identifier = formationSlug || formationId;
  const [isLoading, setIsLoading] = useState(false);
  const [inscriptionStatus, setInscriptionStatus] = useState<InscriptionStatus>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkInscriptionStatus();
  }, [identifier]);

  const checkInscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/formations/${encodeURIComponent(identifier)}/inscription/status`);
      if (response.ok) {
        const data = await response.json();
        setInscriptionStatus(data.status || null);
        // Si la réponse est 200, l'utilisateur est authentifié (même si status est null)
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setInscriptionStatus(null);
      } else {
        // Autre erreur, mais l'utilisateur pourrait être authentifié
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking inscription status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInscription = async () => {
    if (!isAuthenticated) {
      router.push('/connexion?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/formations/${encodeURIComponent(identifier)}/inscription`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setInscriptionStatus(data.inscription.status);
        alert(data.message || 'Inscription réussie !');
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      alert('Erreur lors de l\'inscription');
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
      const response = await fetch(`/api/formations/${encodeURIComponent(identifier)}/inscription`, {
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
  const inscriptionsOuvertes = now >= dateInscriptionDebut && now <= dateInscriptionFin;
  const inscriptionsPasEncoreOuvertes = now < dateInscriptionDebut;
  const inscriptionsFermees = now > dateInscriptionFin;

  if (isChecking) {
    return (
      <div className="bg-white border rounded-xl p-4 space-y-3">
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
        <div className="text-sm text-gray-500">Tarifs</div>
        <div className="font-semibold">
          Membres : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise || 'GNF' }).format(Number(tarifMembre))}
        </div>
        <div className="font-semibold">
          Non-membres : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise || 'GNF' }).format(Number(tarifNonMembre))}
        </div>
        
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
      <div className="text-sm text-gray-500">Tarifs</div>
      <div className="font-semibold">
        Membres : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise || 'GNF' }).format(Number(tarifMembre))}
      </div>
      <div className="font-semibold">
        Non-membres : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise || 'GNF' }).format(Number(tarifNonMembre))}
      </div>

      {inscriptionsPasEncoreOuvertes && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
          Les inscriptions ouvrent le {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateInscriptionDebut)}
        </div>
      )}

      {inscriptionsFermees && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          Les inscriptions sont closes
        </div>
      )}

      {placesDisponibles === 0 && inscriptionsOuvertes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          Complet - Inscription sur liste d'attente possible
        </div>
      )}

      {inscriptionsOuvertes && (
        <button
          onClick={handleInscription}
          disabled={isLoading || !isAuthenticated}
          className="w-full bg-guinea-red hover:bg-guinea-red/90 text-white rounded-lg py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? 'Inscription...'
            : !isAuthenticated
            ? 'Se connecter pour s\'inscrire'
            : placesDisponibles === 0
            ? 'S\'inscrire sur liste d\'attente'
            : 'S\'inscrire'}
        </button>
      )}

      {!inscriptionsOuvertes && !inscriptionsPasEncoreOuvertes && !inscriptionsFermees && (
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

