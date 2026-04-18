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
      color: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25',
      icon: '👥',
    },
    {
      title: 'En attente',
      value: pendingMembers,
      color: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25',
      icon: '⏳',
    },
    {
      title: 'Membres actifs',
      value: activeMembers,
      color: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25',
      icon: '✅',
    },
    {
      title: 'Formations',
      value: totalFormations,
      color: 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/25',
      icon: '📚',
    },
    {
      title: 'Événements',
      value: totalEvents,
      color: 'bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/25',
      icon: '📅',
    },
    {
      title: 'Actualités',
      value: totalNews,
      color: 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/25',
      icon: '📰',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.title} className="admin-panel rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{stat.title}</p>
              <p className="mt-1 text-2xl font-bold text-slate-100">{stat.value}</p>
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

