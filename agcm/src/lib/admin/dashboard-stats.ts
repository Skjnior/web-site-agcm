import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const STATUT_MEMBRE_LABELS: Record<string, string> = {
  ACTIF: 'Actif',
  INACTIF: 'Inactif',
  SUSPENDU: 'Suspendu',
  RADIE: 'Radié',
};

const STATUT_WORKFLOW_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  SOUMIS: 'Soumis',
  APPROUVE: 'Approuvé',
  REJETE: 'Rejeté',
  PUBLIE: 'Publié',
  ARCHIVE: 'Archivé',
};

const DEMANDE_STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVEE: 'Approuvée',
  REFUSEE: 'Refusée',
};

const DONATION_STATUT_LABELS: Record<string, string> = {
  NOUVEAU: 'Nouveau',
  CONTACTE: 'Contacté',
  CONFIRME: 'Confirmé',
  CLASSE_SANS_SUITE: 'Classé sans suite',
};

const AFFECTATION_STATUT_LABELS: Record<string, string> = {
  ACTIF: 'Actif',
  INACTIF: 'Inactif',
  ARCHIVE: 'Archivé',
};

const EVENT_STATUT_LABELS: Record<string, string> = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  PASSE: 'Passé',
};

export type NamedCount = { name: string; value: number };

export type DayCount = { date: string; count: number };

export type MonthCount = { month: string; count: number };

export type AdminDashboardChartData = {
  membersByStatut: NamedCount[];
  contentsByWorkflow: NamedCount[];
  demandesAdhesionByStatut: NamedCount[];
  demandesPartenariatByStatut: NamedCount[];
  donationIntentsByStatut: NamedCount[];
  affectationsByStatut: NamedCount[];
  eventsByStatut: NamedCount[];
  pageViewsLast30Days: DayCount[];
  adhesionsCreatedLast6Months: MonthCount[];
};

function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastNDaysSeries(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    keys.push(utcDateKey(d));
  }
  return keys;
}

function lastNMonthsSeries(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    out.push({ key, label });
  }
  return out;
}

export async function getAdminDashboardChartData(): Promise<AdminDashboardChartData> {
  const now = new Date();
  const pageViewStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29, 0, 0, 0, 0));
  const monthSeries = lastNMonthsSeries(6);
  const adhesionMonthStart = new Date(`${monthSeries[0]!.key}-01T00:00:00.000Z`);

  const [
    membersGrouped,
    contentsGrouped,
    adhesionsGrouped,
    partenariatsGrouped,
    donationsGrouped,
    affectationsGrouped,
    eventsGrouped,
    adhesionMonthRows,
  ] = await Promise.all([
    prisma.member.groupBy({
      by: ['statutMembre'],
      _count: { _all: true },
    }),
    prisma.content.groupBy({
      by: ['statutWorkflow'],
      _count: { _all: true },
    }),
    prisma.demandeAdhesion.groupBy({
      by: ['statut'],
      _count: { _all: true },
    }),
    prisma.demandePartenariat.groupBy({
      by: ['statut'],
      _count: { _all: true },
    }),
    prisma.donationIntent.groupBy({
      by: ['statut'],
      _count: { _all: true },
    }),
    prisma.affectationPoste.groupBy({
      by: ['statut'],
      _count: { _all: true },
    }),
    prisma.event.groupBy({
      by: ['statut'],
      _count: { _all: true },
    }),
    prisma.$queryRaw<Array<{ month_key: string; count: bigint }>>`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month_key, COUNT(*)::bigint AS count
      FROM demandes_adhesion
      WHERE created_at >= ${adhesionMonthStart}
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `,
  ]);

  /** Base sans migration `page_views` : évite de casser /admin (P2010 / 42P01). */
  let pageViewRows: Array<{ day: Date; count: bigint }> = [];
  try {
    pageViewRows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::bigint AS count
      FROM page_views
      WHERE created_at >= ${pageViewStart}
      GROUP BY 1
      ORDER BY 1
    `;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const missingTable =
      (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2010' && msg.includes('page_views')) ||
      msg.includes('page_views');
    if (!missingTable) throw e;
    console.warn(
      '[getAdminDashboardChartData] Table page_views absente — exécuter `npx prisma migrate deploy`. Graphique des visites à 0.',
    );
  }

  const byDay = new Map<string, number>();
  for (const row of pageViewRows) {
    const k = utcDateKey(new Date(row.day));
    byDay.set(k, Number(row.count));
  }
  const dayKeys = lastNDaysSeries(30);
  const pageViewsLast30Days: DayCount[] = dayKeys.map((date) => ({
    date,
    count: byDay.get(date) ?? 0,
  }));

  const byAdhesionMonth = new Map<string, number>();
  for (const row of adhesionMonthRows) {
    byAdhesionMonth.set(row.month_key, Number(row.count));
  }
  const adhesionsCreatedLast6Months: MonthCount[] = monthSeries.map(({ key, label }) => ({
    month: label,
    count: byAdhesionMonth.get(key) ?? 0,
  }));

  return {
    membersByStatut: membersGrouped.map((r) => ({
      name: STATUT_MEMBRE_LABELS[r.statutMembre] ?? r.statutMembre,
      value: r._count._all,
    })),
    contentsByWorkflow: contentsGrouped.map((r) => ({
      name: STATUT_WORKFLOW_LABELS[r.statutWorkflow] ?? r.statutWorkflow,
      value: r._count._all,
    })),
    demandesAdhesionByStatut: adhesionsGrouped.map((r) => ({
      name: DEMANDE_STATUT_LABELS[r.statut] ?? r.statut,
      value: r._count._all,
    })),
    demandesPartenariatByStatut: partenariatsGrouped.map((r) => ({
      name: DEMANDE_STATUT_LABELS[r.statut] ?? r.statut,
      value: r._count._all,
    })),
    donationIntentsByStatut: donationsGrouped.map((r) => ({
      name: DONATION_STATUT_LABELS[r.statut] ?? r.statut,
      value: r._count._all,
    })),
    affectationsByStatut: affectationsGrouped.map((r) => ({
      name: AFFECTATION_STATUT_LABELS[r.statut] ?? r.statut,
      value: r._count._all,
    })),
    eventsByStatut: eventsGrouped.map((r) => ({
      name: EVENT_STATUT_LABELS[r.statut] ?? r.statut,
      value: r._count._all,
    })),
    pageViewsLast30Days,
    adhesionsCreatedLast6Months,
  };
}
