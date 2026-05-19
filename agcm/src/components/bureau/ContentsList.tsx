'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Send, FileText, XCircle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import BureauConfirmDialog from '@/components/bureau/BureauConfirmDialog';
import {
  CONFIRM_SUBMIT_CONTENT_DIALOG_TITLE,
  CONFIRM_SUBMIT_CONTENT_MESSAGE,
  CONFIRM_DELETE_CONTENT_DIALOG_TITLE,
  CONFIRM_DELETE_CONTENT_MESSAGE,
} from '@/config/bureau-content-messages';
import { TableRowActionsMenu, type TableRowAction } from '@/components/ui/table-row-actions-menu';

interface Content {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  statutWorkflow: string;
  visibiliteCible: string;
  createdAt: Date;
  rejectionReason: string | null;
  auteurPoste?: {
    id: string;
    nom: string;
    description: string | null;
  } | null;
  mandat?: {
    id: string;
    titre: string;
    dateDebut: Date;
    dateFin: Date;
  } | null;
  approvedBy?: {
    id: string;
    email: string;
  } | null;
  canDelete?: boolean;
}

interface ContentsListProps {
  contents: Content[];
  currentPage: number;
  totalPages: number;
  total: number;
  isSuperAdmin?: boolean;
  basePath?: string;
  pageSize?: number;
  getPaginationHref?: (page: number) => string;
}

const thClass = 'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 sm:px-4';

const actionsTriggerClass =
  'border-slate-600 bg-slate-900/50 text-slate-200 hover:bg-slate-800 dark:border-slate-600';

export default function ContentsList({
  contents,
  currentPage,
  totalPages,
  total,
  isSuperAdmin = false,
  basePath = '/bureau/contents',
  pageSize = 10,
  getPaginationHref,
}: ContentsListProps) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [pendingSubmitId, setPendingSubmitId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const pageHref = (pageNum: number) =>
    getPaginationHref ? getPaginationHref(pageNum) : `${basePath}?page=${pageNum}`;

  const detailBase = isSuperAdmin ? `/admin/contents` : `/bureau/contents`;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'brouillon' | 'soumis' | 'approuve' | 'rejete' | 'publie' | 'archive'> = {
      BROUILLON: 'brouillon',
      SOUMIS: 'soumis',
      APPROUVE: 'approuve',
      REJETE: 'rejete',
      PUBLIE: 'publie',
      ARCHIVE: 'archive',
    };
    return variants[status] || 'brouillon';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ACTIVITE: 'Activité',
      ACTUALITE: 'Actualité',
      PARTAGE: 'Partage',
      ANNONCE: 'Annonce',
    };
    return labels[type] || type;
  };

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const buildRowActions = (content: Content): TableRowAction[] => {
    const actions: TableRowAction[] = [
      {
        label: 'Voir',
        variant: 'view',
        icon: <Eye className="h-4 w-4 shrink-0" />,
        onClick: () => router.push(`${detailBase}/${content.id}`),
      },
    ];

    if (content.statutWorkflow === 'BROUILLON' || content.statutWorkflow === 'REJETE' || isSuperAdmin) {
      actions.push({
        label: 'Modifier',
        variant: 'edit',
        icon: <Edit className="h-4 w-4 shrink-0" />,
        onClick: () => router.push(`${detailBase}/${content.id}/edit`),
      });
    }

    if (content.statutWorkflow === 'BROUILLON' && content.visibiliteCible !== 'PRIVE_BUREAU' && !isSuperAdmin) {
      actions.push({
        label: submitting === content.id ? 'Envoi...' : 'Soumettre',
        variant: 'default',
        icon:
          submitting === content.id ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Send className="h-4 w-4 shrink-0" />
          ),
        disabled: submitting === content.id,
        onClick: () => setPendingSubmitId(content.id),
      });
    }

    if (content.canDelete || isSuperAdmin) {
      actions.push({
        label: deletingId === content.id ? 'Suppression...' : 'Supprimer',
        variant: 'delete',
        icon:
          deletingId === content.id ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 shrink-0" />
          ),
        disabled: deletingId === content.id,
        onClick: () => setPendingDeleteId(content.id),
      });
    }

    return actions;
  };

  const runSubmit = async (contentId: string) => {
    setSubmitting(contentId);
    try {
      const response = await fetch(`/api/bureau/contents/${contentId}/submit`, {
        method: 'POST',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la soumission');
      }
    } catch {
      alert('Erreur lors de la soumission');
    } finally {
      setSubmitting(null);
    }
  };

  const handleConfirmSubmit = () => {
    const id = pendingSubmitId;
    setPendingSubmitId(null);
    if (id) void runSubmit(id);
  };

  const runDelete = async (contentId: string) => {
    setDeletingId(contentId);
    try {
      const url = isSuperAdmin
        ? `/api/super-admin/contents/${contentId}`
        : `/api/bureau/contents/${contentId}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmDelete = () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    if (id) void runDelete(id);
  };

  const rejectionBlock = (content: Content) =>
    content.rejectionReason ? (
      <div className="mt-2 rounded-lg border border-red-900/50 bg-red-950/40 p-2">
        <div className="flex items-start gap-2">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-medium text-red-300">Motif du rejet :</p>
            <p className="break-words text-xs text-red-200/90">{content.rejectionReason}</p>
          </div>
        </div>
      </div>
    ) : null;

  if (contents.length === 0) {
    return (
      <div className="admin-panel p-8 text-center sm:p-12">
        <FileText className="mx-auto mb-4 h-12 w-12 text-slate-500" />
        <p className="mb-4 text-slate-400">Aucun contenu</p>
        <Link href="/bureau/contents/nouveau">
          <Button>
            {isSuperAdmin ? 'Créer un contenu' : 'Créer votre premier contenu'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <BureauConfirmDialog
        open={pendingDeleteId !== null}
        title={CONFIRM_DELETE_CONTENT_DIALOG_TITLE}
        message={CONFIRM_DELETE_CONTENT_MESSAGE}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        Icon={Trash2}
        variant="danger"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
      <BureauConfirmDialog
        open={pendingSubmitId !== null}
        title={CONFIRM_SUBMIT_CONTENT_DIALOG_TITLE}
        message={CONFIRM_SUBMIT_CONTENT_MESSAGE}
        confirmLabel="Soumettre"
        cancelLabel="Annuler"
        Icon={Send}
        onCancel={() => setPendingSubmitId(null)}
        onConfirm={handleConfirmSubmit}
      />

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        {/* Mobile : cartes */}
        <div className="space-y-3 p-3 md:hidden">
          {contents.map((content) => (
            <div
              key={content.id}
              className="cursor-pointer rounded-xl border border-slate-700/50 bg-slate-950/40 p-4 transition-colors hover:bg-slate-800/50"
              onClick={() => router.push(`${detailBase}/${content.id}`)}
              role="presentation"
            >
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-medium text-slate-100">{content.titre}</h3>
                  {content.contenu && (
                    <p className="mt-1 line-clamp-2 break-words text-sm text-slate-400">
                      {content.contenu.length > 120 ? `${content.contenu.substring(0, 120)}...` : content.contenu}
                    </p>
                  )}
                  {isSuperAdmin && (
                    <p className="mt-2 text-xs text-slate-400">
                      {content.auteurPoste?.nom || 'N/A'}
                      {content.mandat?.titre ? ` · ${content.mandat.titre}` : ''}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">{getTypeLabel(content.type)}</span>
                    <Badge variant={getStatusBadge(content.statutWorkflow)} className="text-[10px]">
                      {content.statutWorkflow}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatDate(content.createdAt)}</span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>{rejectionBlock(content)}</div>
                </div>
                <div className="shrink-0 self-start" onClick={(e) => e.stopPropagation()}>
                  <TableRowActionsMenu
                    actions={buildRowActions(content)}
                    triggerClassName={actionsTriggerClass}
                    alwaysDropdown={!isSuperAdmin}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tableau desktop */}
        <div className="hidden w-full overflow-x-auto md:block" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full min-w-[640px] lg:table-fixed lg:min-w-0">
            {isSuperAdmin ? (
              <colgroup>
                <col className="lg:w-[32%]" />
                <col className="lg:w-[18%]" />
                <col className="lg:w-[10%]" />
                <col className="lg:w-[12%]" />
                <col className="lg:w-[12%]" />
                <col className="lg:w-[13%]" />
              </colgroup>
            ) : (
              <colgroup>
                <col className="lg:w-[38%]" />
                <col className="lg:w-[14%]" />
                <col className="lg:w-[14%]" />
                <col className="lg:w-[14%]" />
                <col className="lg:w-[20%]" />
              </colgroup>
            )}
            <thead className="bg-slate-800/90">
              <tr>
                <th className={thClass}>Titre</th>
                {isSuperAdmin && <th className={thClass}>Auteur</th>}
                <th className={thClass}>Type</th>
                <th className={thClass}>Statut</th>
                <th className={thClass}>Date</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-slate-950/40">
              {contents.map((content) => (
                <tr
                  key={content.id}
                  onClick={() => router.push(`${detailBase}/${content.id}`)}
                  className="cursor-pointer transition-colors hover:bg-slate-800/60"
                >
                  <td className="px-3 py-3 align-top sm:px-4 sm:py-4">
                    <div className="break-words pr-2 font-medium text-slate-100">{content.titre}</div>
                    {content.contenu && (
                      <div className="mt-1 line-clamp-2 break-words pr-2 text-sm text-slate-400">
                        {content.contenu.length > 150 ? `${content.contenu.substring(0, 150)}...` : content.contenu}
                      </div>
                    )}
                    {rejectionBlock(content)}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-3 py-3 align-top sm:px-4 sm:py-4">
                      <div className="break-words pr-2 text-sm text-slate-100">
                        {content.auteurPoste?.nom || 'N/A'}
                      </div>
                      {content.mandat && (
                        <div className="mt-1 break-words pr-2 text-xs text-slate-400">{content.mandat.titre}</div>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-3 align-top sm:px-4 sm:py-4">
                    <span className="text-sm text-slate-100">{getTypeLabel(content.type)}</span>
                  </td>
                  <td className="px-3 py-3 align-top sm:px-4 sm:py-4">
                    <Badge variant={getStatusBadge(content.statutWorkflow)} className="whitespace-nowrap">
                      {content.statutWorkflow}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-top text-sm text-slate-400 sm:px-4 sm:py-4">
                    {formatDate(content.createdAt)}
                  </td>
                  <td
                    className="px-2 py-3 align-top text-right text-sm font-medium sm:px-4 sm:py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end">
                      <TableRowActionsMenu
                        actions={buildRowActions(content)}
                        triggerClassName={actionsTriggerClass}
                        alwaysDropdown={!isSuperAdmin}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-700 bg-slate-900/80 px-3 py-4 sm:flex-row sm:items-center sm:px-6">
            <div className="text-center text-sm text-slate-300 sm:text-left">
              Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, total)} sur {total}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              {currentPage > 1 && (
                <Link href={pageHref(currentPage - 1)}>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                    Précédent
                  </Button>
                </Link>
              )}
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Link key={pageNum} href={pageHref(pageNum)}>
                      <Button
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[40px] border-slate-600 text-slate-200 hover:bg-slate-800"
                      >
                        {pageNum}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {currentPage < totalPages && (
                <Link href={pageHref(currentPage + 1)}>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                    Suivant
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
