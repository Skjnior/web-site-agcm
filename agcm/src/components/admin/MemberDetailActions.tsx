// components/admin/MemberDetailActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberValidationModal from './MemberValidationModal';

type Member = {
  id: string;
  prenom: string;
  nom: string;
  status: string;
  numeroMembre: string | null;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

type MemberDetailActionsProps = {
  member: Member;
  currentUserRole: string;
  canAct: boolean;
};

export default function MemberDetailActions({ member, currentUserRole, canAct }: MemberDetailActionsProps) {
  const router = useRouter();
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canValidate = member.status === 'EN_ATTENTE';
  const canSuspend = member.status === 'ACTIF';
  const canReactivate = member.status === 'SUSPENDU';
  const canRefuse = member.status === 'EN_ATTENTE';

  const handleSuspend = async () => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce membre ?')) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}/suspend`, {
        method: 'POST',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Erreur lors de la suspension');
      }
    } catch (error) {
      alert('Erreur lors de la suspension');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce membre ?')) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}/reactivate`, {
        method: 'POST',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Erreur lors de la réactivation');
      }
    } catch (error) {
      alert('Erreur lors de la réactivation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefuse = async () => {
    const raison = prompt('Raison du refus (optionnel) :');
    if (raison === null) return; // Annulé

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}/refuse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raison: raison || undefined }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors du refus');
      }
    } catch (error) {
      alert('Erreur lors du refus');
    } finally {
      setIsProcessing(false);
    }
  };

  // Si l'utilisateur ne peut pas agir sur ce membre, afficher un message
  if (!canAct) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-900">Action non autorisée</p>
            <p className="text-sm text-yellow-700 mt-1">
              Vous ne pouvez pas modifier les informations d'un Super Administrateur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex gap-3 flex-wrap">
          {canValidate && (
            <button
              onClick={() => setShowValidationModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Valider le membre
            </button>
          )}
          {canSuspend && (
            <button
              onClick={handleSuspend}
              disabled={isProcessing}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              Suspendre
            </button>
          )}
          {canReactivate && (
            <button
              onClick={handleReactivate}
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Réactiver
            </button>
          )}
          {canRefuse && (
            <button
              onClick={handleRefuse}
              disabled={isProcessing}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Refuser
            </button>
          )}
        </div>
      </div>

      {showValidationModal && (
        <MemberValidationModal
          member={member}
          onClose={() => setShowValidationModal(false)}
          onSuccess={() => {
            setShowValidationModal(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

