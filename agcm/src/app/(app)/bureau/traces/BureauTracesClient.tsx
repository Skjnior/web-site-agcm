'use client';

import { useState, useEffect } from 'react';
import { History, User, Calendar, FileText, FolderOpen, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PaginationMeta } from '@/lib/pagination';

const actionLabels: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  APPROVE: 'Approbation',
  REJECT: 'Rejet',
  SUBMIT: 'Soumission',
  ASSIGN: 'Affectation',
  INACTIVATE: 'Inactivation',
  ARCHIVE: 'Archivage',
};

const entityLabels: Record<string, string> = {
  Content: 'Contenu',
  Projet: 'Projet',
  Event: 'Événement',
};

const ACTION_OPTIONS = [
  'all',
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'REJECT',
  'SUBMIT',
  'ASSIGN',
  'INACTIVATE',
  'ARCHIVE',
] as const;

interface TraceLogRow {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  user?: {
    email?: string | null;
    member?: { prenom: string; nom: string } | null;
  } | null;
}

const DEFAULT_ENTITY_TYPES = ['all', 'Content', 'Projet', 'Event'];

export default function BureauTracesClient({
  entityTypes = DEFAULT_ENTITY_TYPES,
}: {
  /** Filtre entités selon les modules bureau du poste (ex. Organisation : sans Contenu) */
  entityTypes?: string[];
}) {
  const [logs, setLogs] = useState<TraceLogRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!entityTypes.includes(entityType)) {
      setEntityType('all');
      setPage(1);
    }
  }, [entityTypes, entityType]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, actionFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (entityType && entityType !== 'all') params.set('entityType', entityType);
      if (actionFilter && actionFilter !== 'all') params.set('action', actionFilter);
      const res = await fetch(`/api/bureau/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
        setPagination(data.pagination ?? null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;

  if (loading && logs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
        <p className="mt-4 text-slate-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full min-w-[200px] sm:w-56">
          <label htmlFor="trace-entity" className="mb-1.5 block text-xs font-medium text-slate-400">
            Type d&apos;entité
          </label>
          <Select
            value={entityType}
            onValueChange={(v) => {
              setEntityType(v);
              setPage(1);
            }}
          >
            <SelectTrigger id="trace-entity" className="border-slate-600 bg-slate-900/50 text-slate-100">
              <SelectValue placeholder="Entité" />
            </SelectTrigger>
            <SelectContent className="z-[100] border-slate-600 bg-slate-900 text-slate-100">
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'Toutes' : entityLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="trace-action" className="mb-1.5 block text-xs font-medium text-slate-400">
            Action
          </label>
          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger id="trace-action" className="border-slate-600 bg-slate-900/50 text-slate-100">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent className="z-[100] border-slate-600 bg-slate-900 text-slate-100">
              {ACTION_OPTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a === 'all' ? 'Toutes' : actionLabels[a] || a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {pagination && (
          <p className="text-sm text-slate-400 sm:ml-auto">
            {pagination.total} entrée{pagination.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">
              Aucune trace pour ces filtres. Les actions sur vos contenus, projets et événements apparaissent ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-4 transition-colors hover:bg-slate-700/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
                  {log.entityType === 'Content' && <FileText className="h-5 w-5 text-slate-400" />}
                  {log.entityType === 'Projet' && <FolderOpen className="h-5 w-5 text-slate-400" />}
                  {log.entityType === 'Event' && <CalendarDays className="h-5 w-5 text-slate-400" />}
                  {!['Content', 'Projet', 'Event'].includes(log.entityType) && (
                    <History className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-200">
                    {actionLabels[log.action] || log.action} – {entityLabels[log.entityType] || log.entityType}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {log.user?.member
                        ? `${log.user.member.prenom} ${log.user.member.nom}`
                        : log.user?.email || 'Inconnu'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(log.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-700 bg-slate-900/80 px-3 py-4 sm:flex-row sm:items-center sm:px-6">
            <div className="text-center text-sm text-slate-300 sm:text-left">
              Page {currentPage} / {totalPages}
              {pagination ? (
                <>
                  {' '}
                  · {(currentPage - 1) * pagination.limit + 1}–
                  {Math.min(currentPage * pagination.limit, pagination.total)} sur {pagination.total}
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || loading}
                className="border-slate-600 text-slate-200"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || loading}
                className="border-slate-600 text-slate-200"
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
