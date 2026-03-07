// components/dashboard/UpcomingFormations.tsx
import Link from 'next/link';

type Formation = {
  id: string;
  titre: string;
  slug: string;
  dateDebut: Date;
  dateFin: Date;
  lieu: string | null;
  status: string;
};

type UpcomingFormationsProps = {
  formations: Formation[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function UpcomingFormations({ formations }: UpcomingFormationsProps) {
  if (formations.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes formations à venir</h2>
        <p className="text-sm text-gray-500">Aucune formation à venir</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Mes formations à venir</h2>
        <Link href="/dashboard/mes-formations" className="text-sm text-guinea-red hover:underline">
          Voir tout →
        </Link>
      </div>

      <div className="space-y-3">
        {formations.slice(0, 5).map((formation) => (
          <Link
            key={formation.id}
            href={`/formations/${formation.slug}`}
            className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">{formation.titre}</div>
            <div className="text-sm text-gray-500 mt-1">
              {formatDate(formation.dateDebut)} - {formation.lieu ?? 'Lieu à confirmer'}
            </div>
            <div className="text-xs text-gray-400 mt-1">Statut: {formation.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

