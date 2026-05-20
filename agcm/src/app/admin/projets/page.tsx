import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FolderOpen, CheckCircle, Clock, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Projet {
  id: string;
  titre: string;
  slug: string;
  statut: string;
}

export default function AdminProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(''); // '' all, EN_COURS, TERMINE, etc.

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const url = new URL('/api/admin/projets', window.location.origin);
        if (filter) url.searchParams.set('status', filter);
        const res = await fetch(url.toString());
        const data = await res.json();
        setProjets(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjets();
  }, [filter]);

  const statutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_COURS':
        return { label: 'En cours', color: 'bg-amber-100 text-amber-800' };
      case 'TERMINE':
        return { label: 'Terminé', color: 'bg-green-100 text-green-800' };
      case 'BROUILLON':
        return { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: statut, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-agcm-900">Gestion des projets</h1>
        <Link href="/admin/projets/nouveau">
          <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            <FolderOpen className="h-4 w-4" />
            Créer un projet
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Button variant={filter === '' ? 'default' : 'outline'} onClick={() => setFilter('')}>Tous</Button>
        <Button variant={filter === 'EN_COURS' ? 'default' : 'outline'} onClick={() => setFilter('EN_COURS')}>En cours</Button>
        <Button variant={filter === 'TERMINE' ? 'default' : 'outline'} onClick={() => setFilter('TERMINE')}>Terminés</Button>
      </div>

      {loading ? (
        <p>Chargement des projets…</p>
      ) : projets.length === 0 ? (
        <p>Aucun projet trouvé.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projets.map((p) => {
            const { label, color } = statutLabel(p.statut);
            return (
              <Link key={p.id} href={`/admin/projets/${p.id}`}> 
                <div className="group rounded-2xl border border-slate-800/40 bg-slate-900/30 p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-agcm-100 line-clamp-1">{p.titre}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${color}`}>{label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{p.id}</span>
                  </div>
                  <div className="mt-2 text-right text-red-500 flex items-center gap-1">
                    En savoir plus <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
