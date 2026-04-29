'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export default function ActualitesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [type, setType] = useState(searchParams.get('type') || 'all');

  // Synchroniser les états locaux avec l'URL (pour le bouton retour du navigateur par exemple)
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setStatus(searchParams.get('status') || 'all');
    setType(searchParams.get('type') || 'all');
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Réinitialiser la page quand on change un filtre
    params.set('page', '1');

    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    handleFilterChange('q', search);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setType('all');
    router.push('/admin/actualites');
  };

  const hasActiveFilters = searchParams.has('q') || 
                          (searchParams.has('status') && searchParams.get('status') !== 'all') ||
                          (searchParams.has('type') && searchParams.get('type') !== 'all');

  return (
    <div className="admin-glass p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-sm border border-slate-200/50">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Rechercher par titre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          className="pl-10 h-10 border-slate-200/60 focus:border-blue-400 rounded-xl"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
            handleFilterChange('type', value);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px] h-10 border-slate-200/60 rounded-xl">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="ACTUALITE">Actualité</SelectItem>
            <SelectItem value="ANNONCE">Annonce</SelectItem>
            <SelectItem value="ACTIVITE">Activité</SelectItem>
            <SelectItem value="PARTAGE">Partage</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            handleFilterChange('status', value);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 border-slate-200/60 rounded-xl">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PUBLIE">Publié</SelectItem>
            <SelectItem value="BROUILLON">Brouillon</SelectItem>
            <SelectItem value="SOUMIS">Soumis</SelectItem>
            <SelectItem value="APPROUVE">Approuvé</SelectItem>
            <SelectItem value="REJETE">Rejeté</SelectItem>
            <SelectItem value="ARCHIVE">Archivé</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4"
        >
          Filtrer
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl h-10"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
