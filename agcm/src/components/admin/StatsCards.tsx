// components/admin/StatsCards.tsx

type StatsCardsProps = {
  totalMembers: number;
  pendingMembers: number;
  activeMembers: number;
  totalFormations: number;
  totalEvents: number;
  totalNews: number;
};

export default function StatsCards({
  totalMembers,
  pendingMembers,
  activeMembers,
  totalFormations,
  totalEvents,
  totalNews,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Membres',
      value: totalMembers,
      color: 'bg-blue-50 text-blue-700',
      icon: '👥',
    },
    {
      title: 'En attente',
      value: pendingMembers,
      color: 'bg-yellow-50 text-yellow-700',
      icon: '⏳',
    },
    {
      title: 'Membres actifs',
      value: activeMembers,
      color: 'bg-green-50 text-green-700',
      icon: '✅',
    },
    {
      title: 'Formations',
      value: totalFormations,
      color: 'bg-purple-50 text-purple-700',
      icon: '📚',
    },
    {
      title: 'Événements',
      value: totalEvents,
      color: 'bg-pink-50 text-pink-700',
      icon: '📅',
    },
    {
      title: 'Actualités',
      value: totalNews,
      color: 'bg-indigo-50 text-indigo-700',
      icon: '📰',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.title} className="admin-panel rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

