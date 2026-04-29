'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Globe,
  Monitor,
  User,
  Calendar,
  MapPin,
  ExternalLink,
  Shield,
  Activity,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PageViewDetail {
  id: string;
  path: string;
  method: string;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  isProxy: boolean;
  sessionId: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    roleSysteme: string;
    member: {
      prenom: string;
      nom: string;
      photoUrl: string | null;
    } | null;
  } | null;
}

export default function PageViewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [view, setView] = useState<PageViewDetail | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchView();
  }, [id]);

  const fetchView = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/page-views/${id}`);

      if (!response.ok) {
        if (response.status === 404) setError('Visite introuvable');
        else setError('Erreur lors du chargement');
        return;
      }

      const data = await response.json();
      setView(data.view);
      setHistory(data.history || []);
    } catch (err) {
      setError('Erreur réseau');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBrowser = (ua: string | null) => {
    if (!ua) return 'Inconnu';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Edge') || ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Autre';
  };

  const getOS = (ua: string | null) => {
    if (!ua) return 'Inconnu';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Autre';
  };

  if (loading) {
    return (
      <div className="admin-page mx-auto flex min-h-[40vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !view) {
    return (
      <div className="admin-page mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p>{error || 'Visite introuvable'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page mx-auto max-w-5xl space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="border-slate-300 dark:border-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux visites
          </Button>
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
              Détail de la visite
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">{view.id}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
          Enregistré
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Info Principale */}
        <div className="admin-panel p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">Page consultée</h2>
          </div>
          <div>
            <Label className="text-slate-500 text-xs">Chemin (URL)</Label>
            <p className="font-mono text-sm break-all text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-lg mt-1">
              {view.path}
            </p>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-500">Méthode</span>
            <Badge variant="outline">{view.method}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-500">Date et heure</span>
            <span className="text-sm font-medium">
              {format(new Date(view.createdAt), 'dd MMMM yyyy à HH:mm:ss', { locale: fr })}
            </span>
          </div>
          {view.referer && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Label className="text-slate-500 text-xs">Référent (Source)</Label>
              <p className="text-xs truncate text-slate-600 dark:text-slate-400 mt-1">{view.referer}</p>
            </div>
          )}
        </div>

        {/* Visiteur */}
        <div className="admin-panel p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
              <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold">Visiteur</h2>
          </div>
          {view.user ? (
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="h-10 w-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                {view.user.member?.prenom[0] || view.user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">
                  {view.user.member ? `${view.user.member.prenom} ${view.user.member.nom}` : 'Utilisateur'}
                </p>
                <p className="text-xs text-slate-500 truncate">{view.user.email}</p>
              </div>
              <Link href={`/admin/users/${view.user.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
              <p className="text-sm text-slate-500 italic">Visiteur anonyme</p>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Adresse IP</span>
              <span className="font-mono font-medium">{view.ipAddress || 'Inconnue'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Session ID</span>
              <span className="font-mono text-[10px] text-slate-400 max-w-[150px] truncate">
                {view.sessionId || 'Non défini'}
              </span>
            </div>
          </div>
        </div>

        {/* Géolocalisation */}
        <div className="admin-panel p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
              <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold">Localisation</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs">Pays</Label>
              <div className="flex items-center gap-2">
                {view.countryCode && (
                  <img src={`https://flagcdn.com/20x15/${view.countryCode.toLowerCase()}.png`} className="h-3 shadow-sm" alt="" />
                )}
                <span className="text-sm font-medium">{view.country || 'Inconnu'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs">Ville</Label>
              <p className="text-sm font-medium">{view.city || 'Inconnue'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs">Région</Label>
              <p className="text-sm font-medium">{view.region || 'Inconnue'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs">Proxy / VPN</Label>
              <Badge variant={view.isProxy ? 'destructive' : 'outline'} className="text-[10px]">
                {view.isProxy ? 'Détecté' : 'Non'}
              </Badge>
            </div>
          </div>
          {view.isp && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Label className="text-slate-500 text-xs">Fournisseur d&apos;accès (ISP)</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{view.isp}</p>
            </div>
          )}
        </div>

        {/* Système technique */}
        <div className="admin-panel p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <Monitor className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold">Appareil & Système</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <Label className="text-slate-500 text-xs">OS</Label>
              <p className="text-sm font-bold mt-1">{getOS(view.userAgent)}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <Label className="text-slate-500 text-xs">Navigateur</Label>
              <p className="text-sm font-bold mt-1">{getBrowser(view.userAgent)}</p>
            </div>
          </div>
          <div>
            <Label className="text-slate-500 text-xs">User Agent complet</Label>
            <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 leading-tight break-all">
                {view.userAgent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Historique de navigation */}
      <div className="admin-panel p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Historique récent de ce visiteur</h2>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                onClick={() => router.push(`/admin/logs/visits/${item.id}`)}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {format(new Date(item.createdAt), 'HH:mm', { locale: fr })}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-blue-600 dark:text-blue-400">{item.path}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{item.method}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 px-2">
                  Voir <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 italic text-sm">
            Aucun autre historique trouvé pour ce visiteur.
          </div>
        )}
      </div>
    </div>
  );
}
