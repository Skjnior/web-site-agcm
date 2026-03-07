// components/admin/MembersTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import { getStatusBadgeClasses } from '@/lib/ui-utils';

type Member = {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone: string | null;
  ville: string | null;
  pays: string | null;
  statutMembre: string;
  dateAdhesion: Date | null;
  canAct?: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

type MembersTableProps = {
  members: Member[];
  currentUserRole: string;
  currentUserId?: string;
  onMemberDeleted?: () => void;
};

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    ACTIF: 'Actif',
    SUSPENDU: 'Suspendu',
    RADIE: 'Radié',
  };
  return labels[statut] || statut;
};

function formatDate(date: Date | null) {
  if (!date) return 'Non définie';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export default function MembersTable({ members, currentUserRole, currentUserId, onMemberDeleted }: MembersTableProps) {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; memberId: string | null }>({ isOpen: false, memberId: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const handleDelete = async () => {
    if (!deleteModal.memberId) return;

    setDeleting(deleteModal.memberId);
    setDeleteModal({ isOpen: false, memberId: null });

    try {
      const response = await fetch(`/api/admin/membres/${deleteModal.memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setSuccessModal({ isOpen: true, message: 'Membre supprimé avec succès' });
      if (onMemberDeleted) {
        onMemberDeleted();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la suppression' });
    } finally {
      setDeleting(null);
    }
  };

  if (members.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-12 text-center">
        <p className="text-gray-500">Aucun membre trouvé</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'adhésion
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => {
                const canDelete = member.canAct !== false && member.user.id !== currentUserId;
                const canEdit = member.canAct !== false;

                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {member.prenom} {member.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.user.email}</div>
                      {member.telephone && (
                        <div className="text-sm text-gray-500">{member.telephone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.ville && (
                        <div className="text-sm text-gray-900">{member.ville}</div>
                      )}
                      {member.pays && (
                        <div className="text-sm text-gray-500">{member.pays}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          member.statutMembre === 'ACTIF' ? 'approuve' :
                          member.statutMembre === 'SUSPENDU' ? 'rejete' :
                          'soumis'
                        }
                      >
                        {getStatutLabel(member.statutMembre)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(member.dateAdhesion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/membres/${member.id}`}>
                          <Button variant="view" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </Link>
                        {canEdit && (
                          <Button
                            variant="edit"
                            size="sm"
                            onClick={() => router.push(`/admin/membres/${member.id}/edit`)}
                            disabled={deleting === member.id}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="delete"
                            size="sm"
                            onClick={() => setDeleteModal({ isOpen: true, memberId: member.id })}
                            disabled={deleting === member.id}
                          >
                            {deleting === member.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, memberId: null })}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible et supprimera également le compte utilisateur associé."
        type="danger"
        confirmText="Supprimer"
        isLoading={deleting === deleteModal.memberId}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: '' });
          if (onMemberDeleted) {
            onMemberDeleted();
          }
        }}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </>
  );
}

