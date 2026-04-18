'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Database,
  Activity,
  GitCompareArrows,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getActionBadgeClasses } from '@/lib/ui-utils';
import { actionLabel, entityTypeLabel } from '@/lib/audit-log-labels';

interface AuditLogDetails {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData: unknown;
  afterData: unknown;
  createdAt: string;
  actorEmail?: string | null;
  user: {
    id: string;
    email: string;
    roleSysteme: string;
    member: {
      prenom: string;
      nom: string;
    } | null;
  } | null;
}

function stringifyPayload(data: unknown): string {
  if (data === null || data === undefined) return '';
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function hasPayload(data: unknown): boolean {
  return data !== null && data !== undefined;
}

function JsonPayloadBlock({
  title,
  subtitle,
  data,
  emptyHint,
  accent,
}: {
  title: string;
  subtitle?: string;
  data: unknown;
  emptyHint: string;
  accent: 'amber' | 'emerald';
}) {
  const [copied, setCopied] = useState(false);
  const present = hasPayload(data);
  const formatted = useMemo(() => stringifyPayload(data), [data]);

  const accentRing =
    accent === 'amber'
      ? 'border-amber-200/90 dark:border-amber-900/40'
      : 'border-emerald-200/90 dark:border-emerald-900/40';
  const accentIconBg =
    accent === 'amber'
      ? 'bg-amber-100 dark:bg-amber-950/40'
      : 'bg-emerald-100 dark:bg-emerald-950/40';
  const accentIcon =
    accent === 'amber'
      ? 'text-amber-800 dark:text-amber-400'
      : 'text-emerald-800 dark:text-emerald-400';

  const copyJson = async () => {
    if (!present || !formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`flex h-full min-h-[200px] flex-col rounded-xl border-2 ${accentRing} bg-white/50 dark:bg-slate-900/40`}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-slate-700/80">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2 ${accentIconBg}`}>
            <FileText className={`h-5 w-5 ${accentIcon}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {present ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyJson}
            className="shrink-0 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                Copié
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copier
              </>
            )}
          </Button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 p-4">
        {present ? (
          <div className="max-h-[min(70vh,520px)] overflow-auto rounded-lg border border-slate-200/80 bg-slate-50/90 dark:border-slate-700 dark:bg-slate-950/60">
            <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              {formatted}
            </pre>
          </div>
        ) : (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-4 text-center dark:border-slate-600 dark:bg-slate-900/30">
            <p className="text-sm text-slate-600 dark:text-slate-400">{emptyHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditLogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [log, setLog] = useState<AuditLogDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchLog();
  }, [id]);

  const fetchLog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/audit-logs/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Log d\'audit introuvable');
        } else {
          setError('Erreur lors du chargement');
        }
        return;
      }

      const data = await response.json();
      setLog(data.log);
    } catch (err) {
      setError('Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center px-4 text-slate-900 dark:text-slate-100">
        <div className="text-center">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary dark:border-slate-600"
            aria-hidden
          />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement…</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="admin-page mx-auto max-w-7xl space-y-6 px-4 pb-12 text-slate-900 dark:text-slate-100">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/40">
          <p className="text-red-800 dark:text-red-200">{error || "Log d'audit introuvable"}</p>
          <Link href="/admin/logs" className="mt-4 inline-block">
            <Button variant="outline" className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const actionClass = getActionBadgeClasses(log.action);
  const bothPresent = hasPayload(log.beforeData) && hasPayload(log.afterData);

  return (
    <div className="admin-page mx-auto max-w-7xl space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/admin/logs">
            <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au journal
            </Button>
          </Link>
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
              Détail du log d&apos;audit
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Identifiant du log :{' '}
              <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{log.id}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/50">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Action</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Type d&apos;action</p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${actionClass}`}
                >
                  {actionLabel(log.action)}
                </span>
                <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">({log.action})</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Entité concernée</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                <Database className="h-4 w-4 shrink-0 text-slate-400" />
                <Badge variant="outline" className="border-slate-300 font-normal dark:border-slate-600 dark:text-slate-200">
                  {entityTypeLabel(log.entityType)}
                </Badge>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{log.entityType}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">ID de l&apos;entité</p>
              <p className="mt-1 break-all font-mono text-sm text-slate-900 dark:text-slate-100">{log.entityId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Date et heure</p>
              <p className="mt-1 flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                {format(new Date(log.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-950/50">
              <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Acteur</h2>
          </div>
          <div className="space-y-3">
            {log.user ? (
              <>
                {log.user.member && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nom complet</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {log.user.member.prenom} {log.user.member.nom}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">E-mail</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{log.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Rôle système</p>
                  <Badge
                    variant={log.user.roleSysteme === 'SUPER_ADMIN' ? 'default' : 'outline'}
                    className="mt-1 border-slate-300 dark:border-slate-600"
                  >
                    {log.user.roleSysteme}
                  </Badge>
                </div>
              </>
            ) : log.actorEmail ? (
              <>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    E-mail (conservé après suppression du compte)
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{log.actorEmail}</p>
                </div>
                <p className="text-sm italic text-slate-600 dark:text-slate-400">
                  Le compte utilisateur n’existe plus en base ; l’e-mail ci-dessus provient du journal d’audit.
                </p>
              </>
            ) : (
              <p className="italic text-slate-500 dark:text-slate-400">Action sans acteur utilisateur associé.</p>
            )}
          </div>
        </div>
      </div>

      <div className="admin-panel p-6">
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-200/80 p-2 dark:bg-slate-800/80">
              <GitCompareArrows className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Données enregistrées</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
                Comparaison de l&apos;état <strong className="text-slate-800 dark:text-slate-200">avant</strong> et{' '}
                <strong className="text-slate-800 dark:text-slate-200">après</strong> l&apos;action. Selon le type
                d&apos;opération, une des deux colonnes peut être vide : par exemple une <strong>création</strong> n’a
                souvent que des « données après », une <strong>suppression</strong> souvent que des « données avant ».
              </p>
              {bothPresent ? (
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400/90">
                  Les deux instantanés sont présents — utile pour analyser une modification.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <JsonPayloadBlock
            title="Données avant"
            subtitle="État tel qu’il était avant l’action (si enregistré)"
            data={log.beforeData}
            emptyHint="Aucune donnée « avant » pour ce log. C’est normal pour une création pure, ou si l’API n’a pas stocké l’état précédent."
            accent="amber"
          />
          <JsonPayloadBlock
            title="Données après"
            subtitle="État résultant après l’action (si enregistré)"
            data={log.afterData}
            emptyHint="Aucune donnée « après » pour ce log. C’est normal pour une suppression, ou si seul l’état précédent a été conservé."
            accent="emerald"
          />
        </div>
      </div>
    </div>
  );
}
