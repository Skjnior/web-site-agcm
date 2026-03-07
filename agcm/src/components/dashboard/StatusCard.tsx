// components/dashboard/StatusCard.tsx

type StatusCardProps = {
  status: string;
  numeroMembre?: string | null;
  dateExpiration?: Date | null;
  cotisationAJour: boolean;
};

const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  ACTIF: { label: 'Actif', color: 'text-green-700', bgColor: 'bg-green-50' },
  EN_ATTENTE: { label: 'En attente', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  SUSPENDU: { label: 'Suspendu', color: 'text-red-700', bgColor: 'bg-red-50' },
  RADIE: { label: 'Radié', color: 'text-gray-700', bgColor: 'bg-gray-50' },
};

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Non définie';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export default function StatusCard({ status, numeroMembre, dateExpiration, cotisationAJour }: StatusCardProps) {
  const statusInfo = statusLabels[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-50' };

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Statut d'adhésion</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
          {statusInfo.label}
        </span>
      </div>

      {numeroMembre && !numeroMembre.startsWith('TEMP-') ? (
        <div>
          <div className="text-sm text-gray-500">Numéro de membre</div>
          <div className="text-lg font-bold text-gray-900">{numeroMembre}</div>
        </div>
      ) : (
        <div>
          <div className="text-sm text-gray-500">Numéro de membre</div>
          <div className="text-sm text-gray-400">En attente de validation</div>
        </div>
      )}

      <div>
        <div className="text-sm text-gray-500">Date d'expiration</div>
        <div className="text-sm font-medium text-gray-900">{formatDate(dateExpiration)}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${cotisationAJour ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          Cotisation {cotisationAJour ? 'à jour' : 'à renouveler'}
        </span>
      </div>
    </div>
  );
}

