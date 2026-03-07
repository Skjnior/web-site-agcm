"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type EvenementFiltersProps = {
  initialValues?: {
    q?: string;
    type?: string;
    status?: string;
  };
};

export default function EvenementFilters({ initialValues }: EvenementFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const values = {
    q: initialValues?.q ?? searchParams.get('q') ?? '',
    type: initialValues?.type ?? searchParams.get('type') ?? '',
    status: initialValues?.status ?? searchParams.get('status') ?? '',
  };

  function updateQuery(name: keyof typeof values, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete('page');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="bg-white rounded-xl border p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <div className="flex gap-3 flex-1">
        <input
          type="text"
          placeholder="Rechercher un événement"
          className="w-full md:max-w-sm border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-guinea-red/30"
          value={values.q}
          onChange={(e) => updateQuery('q', e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-guinea-red/30"
          value={values.type}
          onChange={(e) => updateQuery('type', e.target.value)}
        >
          <option value="">Type</option>
          <option value="CONFERENCE">Conférence</option>
          <option value="SEMINAIRE">Séminaire</option>
          <option value="WEBINAIRE">Webinaire</option>
          <option value="ATELIER">Atelier</option>
          <option value="ASSEMBLEE_GENERALE">Assemblée générale</option>
          <option value="NETWORKING">Networking</option>
        </select>
        <select
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-guinea-red/30"
          value={values.status}
          onChange={(e) => updateQuery('status', e.target.value)}
        >
          <option value="">Statut</option>
          <option value="PLANIFIE">Planifié</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminé</option>
          <option value="ANNULE">Annulé</option>
        </select>
      </div>
      <div className="text-xs text-gray-500">
        {isPending ? 'Chargement...' : 'Filtrez les événements (données réelles)'}
      </div>
    </div>
  );
}
