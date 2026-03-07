// components/dashboard/PendingPayments.tsx
import Link from 'next/link';

type Payment = {
  id: string;
  type: string;
  montant: number | string;
  devise: string;
  status: string;
  description: string | null;
  createdAt: Date;
};

type PendingPaymentsProps = {
  payments: Payment[];
};

function formatPrice(amount: number | string, devise: string) {
  try {
    const numericValue = typeof amount === 'number' ? amount : parseFloat(amount.toString());
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise || 'GNF' }).format(numericValue);
  } catch {
    return `${amount} ${devise}`;
  }
}

const typeLabels: Record<string, string> = {
  COTISATION: 'Cotisation',
  FORMATION: 'Formation',
  EVENEMENT: 'Événement',
  AUTRE: 'Autre',
};

export default function PendingPayments({ payments }: PendingPaymentsProps) {
  const pending = payments.filter((p) => p.status === 'PENDING');

  if (pending.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Paiements en attente</h2>
        <p className="text-sm text-gray-500">Aucun paiement en attente</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Paiements en attente</h2>
        <Link href="/dashboard/paiements" className="text-sm text-guinea-red hover:underline">
          Voir tout →
        </Link>
      </div>

      <div className="space-y-3">
        {pending.slice(0, 5).map((payment) => (
          <div key={payment.id} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{typeLabels[payment.type] || payment.type}</div>
                {payment.description && <div className="text-sm text-gray-500 mt-1">{payment.description}</div>}
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatPrice(payment.montant, payment.devise)}</div>
                <div className="text-xs text-yellow-600 mt-1">En attente</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

