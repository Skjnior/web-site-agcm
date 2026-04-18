// components/admin/MemberValidationModal.tsx
'use client';

import { useState } from 'react';

type Member = {
  id: string;
  prenom: string;
  nom: string;
  user: {
    email: string;
  };
};

type MemberValidationModalProps = {
  member: Member;
  onClose: () => void;
  onSuccess: () => void;
};

export default function MemberValidationModal({ member, onClose, onSuccess }: MemberValidationModalProps) {
  const [memberNumber, setMemberNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateNumber = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/members/generate-number');
      if (res.ok) {
        const data = await res.json();
        setMemberNumber(data.memberNumber);
      }
    } catch (error) {
      alert('Erreur lors de la génération du numéro');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNumber.trim()) {
      alert('Veuillez générer ou saisir un numéro de membre');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberNumber }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la validation');
      }
    } catch (error) {
      alert('Erreur lors de la validation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="admin-panel mx-4 max-w-md rounded-xl p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-100">Valider le membre</h2>
        <p className="text-sm text-gray-600 mb-4">
          Vous êtes sur le point de valider <strong>{member.prenom} {member.nom}</strong> ({member.user.email})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="memberNumber" className="block text-sm text-gray-700 mb-2">
              Numéro de membre
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="memberNumber"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
                placeholder="AGCM-2025-001"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={handleGenerateNumber}
                disabled={isGenerating}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {isGenerating ? '...' : 'Générer'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Format: AGCM-YYYY-XXX</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !memberNumber.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Validation...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

