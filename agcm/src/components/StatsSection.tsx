'use client';

import { useState, useEffect } from 'react';

interface Stat {
  label: string;
  value: string;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.stats)) setStats(data.stats);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/10 border border-white/10 rounded-xl p-4 animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-2"></div>
            <div className="h-6 bg-white/20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Statistiques indisponibles pour le moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative group bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:shadow-red-500/20 hover:border-red-400/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-colors duration-300 rounded-2xl" />
          <p className="relative text-4xl font-black text-white mb-2 tracking-tight group-hover:scale-110 transition-transform duration-300 origin-left italic">
            {stat.value}
          </p>
          <p className="relative text-slate-300 text-xs font-bold uppercase tracking-widest">
            {stat.label}
          </p>
          <div className="absolute bottom-2 right-4 w-8 h-1 bg-red-500/30 rounded-full group-hover:w-16 group-hover:bg-red-500 transition-all duration-500" />
        </div>
      ))}
    </div>
  );
}



