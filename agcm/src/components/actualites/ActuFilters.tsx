"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type ActuFiltersProps = {
  initialValues?: {
    q?: string;
    categorie?: string;
  };
};

export default function ActuFilters({ initialValues }: ActuFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const values = {
    q: initialValues?.q ?? searchParams.get('q') ?? '',
    categorie: initialValues?.categorie ?? searchParams.get('categorie') ?? '',
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
          placeholder="Rechercher une actualité"
          className="w-full md:max-w-sm border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-guinea-red/30"
          value={values.q}
          onChange={(e) => updateQuery('q', e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-guinea-red/30"
          value={values.categorie}
          onChange={(e) => updateQuery('categorie', e.target.value)}
        >
          <option value="">Catégorie</option>
          <option value="EVENEMENT">Événement</option>
          <option value="FORMATION">Formation</option>
          <option value="REGLEMENTATION">Réglementation</option>
          <option value="VIE_ASSOCIATIVE">Vie associative</option>
          <option value="PARTENARIAT">Partenariat</option>
          <option value="AUTRE">Autre</option>
        </select>
      </div>
      <div className="text-xs text-gray-500">{isPending ? 'Chargement...' : 'Filtrez les actualités'}</div>
    </div>
  );
}
