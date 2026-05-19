'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReactNode } from 'react';
import type { AdminDashboardChartData, NamedCount } from '@/lib/admin/dashboard-stats';

const PALETTE = ['#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#38bdf8', '#94a3b8', '#f87171'];

const axisTick = { fill: '#94a3b8', fontSize: 12 };
const gridStroke = '#334155';

const tooltipStyles = {
  contentStyle: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(51, 65, 85, 0.8)',
    borderRadius: '12px',
  },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' },
};

function ChartFrame({
  title,
  description,
  children,
  empty,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="admin-glass relative overflow-hidden rounded-3xl border border-slate-800/50 p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)]">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      <div className="relative mt-4 h-[280px] w-full">
        {empty ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-700/80 text-sm text-slate-500">
            Aucune donnée pour cette période
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function sumValues(rows: NamedCount[]): number {
  return rows.reduce((s, r) => s + r.value, 0);
}

export default function AdminDashboardCharts({ data }: { data: AdminDashboardChartData }) {
  const pageTick = (isoDate: string) => {
    const d = new Date(`${isoDate}T12:00:00.000Z`);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const viewsTotal = data.pageViewsLast30Days.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Indicateurs et tendances</h2>
        <p className="mt-1 text-sm text-slate-400">
          Données issues de la base AGCM (membres, demandes, contenus, dons, événements et visites enregistrées sur le site).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartFrame
          title="Membres par statut"
          description="Répartition actuelle du fichier adhérents."
          empty={sumValues(data.membersByStatut) === 0}
        >
        {sumValues(data.membersByStatut) > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.membersByStatut}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.membersByStatut.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]!} stroke="rgba(15,23,42,0.6)" />
                ))}
              </Pie>
              <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Membres']} />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>

        <ChartFrame
          title="Contenus par étape de validation"
          description="Actualités et contenus (workflow éditorial interne)."
          empty={sumValues(data.contentsByWorkflow) === 0}
        >
        {sumValues(data.contentsByWorkflow) > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.contentsByWorkflow} margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" tick={axisTick} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={108} tick={axisTick} />
              <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Contenus']} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Contenus">
                {data.contentsByWorkflow.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]!} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>

        <ChartFrame
          title="Nouvelles demandes d’adhésion (6 mois)"
          description="Nombre de demandes créées chaque mois (tous statuts confondus)."
          empty={sumValues(
            data.adhesionsCreatedLast6Months.map((m) => ({ name: m.month, value: m.count })),
          ) === 0}
        >
        {sumValues(data.adhesionsCreatedLast6Months.map((m) => ({ name: m.month, value: m.count }))) > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.adhesionsCreatedLast6Months} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisTick} interval={0} angle={-12} textAnchor="end" height={56} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Demandes']} />
              <Bar dataKey="count" fill="#60a5fa" name="Demandes" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>

        <ChartFrame
          title="Visites enregistrées sur le site (30 jours)"
          description="Requêtes tracées en base (`page_views`)."
          empty={viewsTotal === 0}
        >
        {viewsTotal > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.pageViewsLast30Days} margin={{ left: 4, right: 8 }}>
              <defs>
                <linearGradient id="pvFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="date" tick={axisTick} tickFormatter={pageTick} minTickGap={16} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip
                {...tooltipStyles}
                labelFormatter={(l) => pageTick(String(l))}
                formatter={(value) => [value, 'Vues']}
              />
              <Area type="monotone" dataKey="count" stroke="#34d399" fill="url(#pvFill)" strokeWidth={2} name="Vues" />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>

        <ChartFrame
          title="Intentions de don par statut"
          description="Suivi des signalements de dons (matériel, financier, autre)."
          empty={sumValues(data.donationIntentsByStatut) === 0}
        >
        {sumValues(data.donationIntentsByStatut) > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.donationIntentsByStatut} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} interval={0} angle={-14} textAnchor="end" height={64} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Dons']} />
              <Bar dataKey="value" name="Intentions" radius={[8, 8, 0, 0]}>
                {data.donationIntentsByStatut.map((_, i) => (
                  <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]!} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>

        <ChartFrame
          title="Événements par statut"
          description="Événements créés dans l’admin (à venir, en cours, passés)."
          empty={sumValues(data.eventsByStatut) === 0}
        >
        {sumValues(data.eventsByStatut) > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eventsByStatut} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Événements']} />
              <Bar dataKey="value" fill="#a78bfa" name="Événements" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChartFrame
          title="Traitement des demandes d’adhésion"
          description="Ventilation par statut (attente, accepté, refusé)."
          empty={sumValues(data.demandesAdhesionByStatut) === 0}
        >
        {sumValues(data.demandesAdhesionByStatut) > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.demandesAdhesionByStatut} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Demandes']} />
              <Bar dataKey="value" fill="#38bdf8" name="Demandes" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>

        <ChartFrame
          title="Demandes de partenariat"
          description="Même ventilation pour les sollicitations partenaires."
          empty={sumValues(data.demandesPartenariatByStatut) === 0}
        >
        {sumValues(data.demandesPartenariatByStatut) > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.demandesPartenariatByStatut} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Demandes']} />
              <Bar dataKey="value" fill="#f472b6" name="Demandes" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
        </ChartFrame>
      </div>

      <ChartFrame
        title="Affectations aux postes (mandats)"
        description="Postes occupés dans les organigrammes : actifs, inactifs, archivés."
        empty={sumValues(data.affectationsByStatut) === 0}
      >
      {sumValues(data.affectationsByStatut) > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.affectationsByStatut} margin={{ left: 4, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" tick={axisTick} />
            <YAxis tick={axisTick} allowDecimals={false} />
            <Tooltip {...tooltipStyles} formatter={(value) => [value, 'Affectations']} />
            <Bar dataKey="value" fill="#fbbf24" name="Affectations" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : null}
      </ChartFrame>
    </div>
  );
}
