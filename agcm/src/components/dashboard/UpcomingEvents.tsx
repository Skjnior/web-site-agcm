// components/dashboard/UpcomingEvents.tsx
import Link from 'next/link';

type Evenement = {
  id: string;
  titre: string;
  slug: string;
  dateEvenement: Date;
  lieu: string | null;
  status: string;
};

type UpcomingEventsProps = {
  evenements: Evenement[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function UpcomingEvents({ evenements }: UpcomingEventsProps) {
  if (evenements.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes événements à venir</h2>
        <p className="text-sm text-gray-500">Aucun événement à venir</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Mes événements à venir</h2>
        <Link href="/dashboard/mes-evenements" className="text-sm text-guinea-red hover:underline">
          Voir tout →
        </Link>
      </div>

      <div className="space-y-3">
        {evenements.slice(0, 5).map((evenement) => (
          <Link
            key={evenement.id}
            href={`/evenements/${evenement.slug}`}
            className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">{evenement.titre}</div>
            <div className="text-sm text-gray-500 mt-1">
              {formatDate(evenement.dateEvenement)} - {evenement.lieu ?? 'Lieu à confirmer'}
            </div>
            <div className="text-xs text-gray-400 mt-1">Statut: {evenement.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

