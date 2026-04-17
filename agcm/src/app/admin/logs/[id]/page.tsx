'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, User, Calendar, Database, Activity } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLogDetails {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData: any;
  afterData: any;
  createdAt: string;
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

export default function AuditLogDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  const getActionBadgeVariant = (action: string) => {
    if (['CREATE', 'ASSIGN'].includes(action)) return 'success';
    if (['UPDATE', 'MODIFY'].includes(action)) return 'default';
    if (['DELETE', 'REMOVE', 'INACTIVATE'].includes(action)) return 'destructive';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'Log d\'audit introuvable'}</p>
          <Link href="/admin/audit-logs" className="mt-4 inline-block">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Link href="/admin/audit-logs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Détails du log d'audit</h1>
          <p className="text-gray-600 mt-1">Informations complètes sur cette action</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="admin-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Action</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Type d'action</p>
              <Badge variant={getActionBadgeVariant(log.action)} className="mt-1">
                {log.action}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type d'entité</p>
              <p className="text-gray-900 font-medium flex items-center gap-2 mt-1">
                <Database className="h-4 w-4" />
                {log.entityType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID de l'entité</p>
              <p className="text-gray-900 font-mono text-sm mt-1">{log.entityId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date et heure</p>
              <p className="text-gray-900 font-medium flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(log.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="admin-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Utilisateur</h2>
          </div>
          <div className="space-y-3">
            {log.user ? (
              <>
                {log.user.member && (
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="text-gray-900 font-medium">
                      {log.user.member.prenom} {log.user.member.nom}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{log.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rôle système</p>
                  <Badge variant={log.user.roleSysteme === 'SUPER_ADMIN' ? 'default' : 'outline'}>
                    {log.user.roleSysteme}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-gray-500 italic">Action système (pas d'utilisateur associé)</p>
            )}
          </div>
        </div>

        {/* Données avant (si disponibles) */}
        {log.beforeData && (
          <div className="admin-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Données avant</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(log.beforeData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Données après (si disponibles) */}
        {log.afterData && (
          <div className="admin-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Données après</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(log.afterData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


