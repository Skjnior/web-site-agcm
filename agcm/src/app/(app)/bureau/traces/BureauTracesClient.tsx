'use client';

import { useState, useEffect } from 'react';
import { History, User, Calendar, FileText, FolderOpen, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function BureauTracesClient() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [entityType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (entityType && entityType !== 'all') params.set('entityType', entityType);
      const res = await fetch(`/api/bureau/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-slate-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'Content', 'Projet', 'Event'].map((type) => (
          <Button
            key={type}
            variant={entityType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEntityType(type)}
          >
            {type === 'all' ? 'Tout' : entityLabels[type] || type}
          </Button>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Aucune action enregistrée sur vos contenus</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-700/30 transition-colors flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
                  {log.entityType === 'Content' && <FileText className="h-5 w-5 text-slate-400" />}
                  {log.entityType === 'Projet' && <FolderOpen className="h-5 w-5 text-slate-400" />}
                  {log.entityType === 'Event' && <CalendarDays className="h-5 w-5 text-slate-400" />}
                  {!['Content', 'Projet', 'Event'].includes(log.entityType) && (
                    <History className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium">
                    {actionLabels[log.action] || log.action} – {entityLabels[log.entityType] || log.entityType}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
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
      </div>
    </div>
  );
}
