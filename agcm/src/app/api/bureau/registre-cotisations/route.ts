import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireRegistreCotisationsAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { REGISTRE_PDF_MEMBER_SCOPE } from '@/lib/registre-pdf-member-scope';
import {
  formatDateYYYYMMDD,
  parseDateParamYYYYMMDD,
  utcTodayDate,
} from '@/lib/registre-cotisations-utils';

const REGISTRE_FILTERS = [
  'all',
  'sans_ligne',
  'situation_vide',
  'situation_remplie',
  'absences_remplies',
] as const;

type RegistreFilter = (typeof REGISTRE_FILTERS)[number];

function parseScope(raw: string | null): 'pdf' | 'all' {
  return raw === 'all' ? 'all' : 'pdf';
}

function parseRegistreFilter(raw: string | null): RegistreFilter {
  if (raw && REGISTRE_FILTERS.includes(raw as RegistreFilter)) {
    return raw as RegistreFilter;
  }
  return 'all';
}

export async function GET(request: NextRequest) {
  const { error } = await requireRegistreCotisationsAccess();
  if (error) return error;

  const { page, limit, offset } = parsePagination(request);
  const q = request.nextUrl.searchParams.get('q')?.trim();
  const dateParam = request.nextUrl.searchParams.get('dateReference')?.trim();
  const scope = parseScope(request.nextUrl.searchParams.get('scope'));
  const registreFilter = parseRegistreFilter(
    request.nextUrl.searchParams.get('registreFilter'),
  );

  let dateReference: Date;
  if (dateParam) {
    const parsed = parseDateParamYYYYMMDD(dateParam);
    if (!parsed) {
      return NextResponse.json({ error: 'Paramètre dateReference invalide (YYYY-MM-DD).' }, { status: 400 });
    }
    dateReference = parsed;
  } else {
    const latest = await prisma.memberRegistreCotisation.findFirst({
      orderBy: { dateReference: 'desc' },
      select: { dateReference: true },
    });
    dateReference = latest?.dateReference ?? utcTodayDate();
  }

  const scopeWhere: Prisma.MemberWhereInput =
    scope === 'pdf' ? REGISTRE_PDF_MEMBER_SCOPE : {};

  const filterClause = (): Prisma.MemberWhereInput | undefined => {
    switch (registreFilter) {
      case 'sans_ligne':
        return {
          registreCotisations: { none: { dateReference } },
        };
      case 'situation_vide':
        return {
          OR: [
            { registreCotisations: { none: { dateReference } } },
            {
              registreCotisations: {
                some: { dateReference, situationText: '' },
              },
            },
          ],
        };
      case 'situation_remplie':
        return {
          registreCotisations: {
            some: { dateReference, NOT: { situationText: '' } },
          },
        };
      case 'absences_remplies':
        return {
          registreCotisations: {
            some: {
              dateReference,
              absencesText: { not: null },
              NOT: { absencesText: '' },
            },
          },
        };
      default:
        return undefined;
    }
  };

  const qClause: Prisma.MemberWhereInput | undefined = q
    ? {
        OR: [
          { prenom: { contains: q, mode: 'insensitive' } },
          { nom: { contains: q, mode: 'insensitive' } },
          { telephone: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { user: { email: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : undefined;

  const extra = filterClause();
  const clauses = [scopeWhere, qClause, extra].filter(
    (x): x is Prisma.MemberWhereInput => Boolean(x && Object.keys(x).length > 0),
  );
  const whereMember: Prisma.MemberWhereInput =
    clauses.length > 0 ? { AND: clauses } : {};

  const includeStats = page === 1;

  const [total, members, dateRows, statsBundle] = await Promise.all([
    prisma.member.count({ where: whereMember }),
    prisma.member.findMany({
      where: whereMember,
      skip: offset,
      take: limit,
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
      select: {
        id: true,
        prenom: true,
        nom: true,
        telephone: true,
        registreCotisations: {
          where: { dateReference },
          take: 1,
          select: {
            id: true,
            situationText: true,
            absencesText: true,
            updatedAt: true,
          },
        },
      },
    }),
    includeStats
      ? prisma.memberRegistreCotisation.findMany({
          distinct: ['dateReference'],
          select: { dateReference: true },
          orderBy: { dateReference: 'desc' },
          take: 48,
        })
      : Promise.resolve([]),
    includeStats
      ? Promise.all([
          prisma.member.count({
            where: scope === 'pdf' ? REGISTRE_PDF_MEMBER_SCOPE : {},
          }),
          prisma.memberRegistreCotisation.count({
            where: {
              dateReference,
              ...(scope === 'pdf' ? { member: REGISTRE_PDF_MEMBER_SCOPE } : {}),
            },
          }),
          prisma.memberRegistreCotisation.count({
            where: {
              dateReference,
              NOT: { situationText: '' },
              ...(scope === 'pdf' ? { member: REGISTRE_PDF_MEMBER_SCOPE } : {}),
            },
          }),
          prisma.memberRegistreCotisation.count({
            where: {
              dateReference,
              absencesText: { not: null },
              NOT: { absencesText: '' },
              ...(scope === 'pdf' ? { member: REGISTRE_PDF_MEMBER_SCOPE } : {}),
            },
          }),
          prisma.member.count({ where: REGISTRE_PDF_MEMBER_SCOPE }),
          prisma.memberRegistreCotisation.count({
            where: {
              dateReference,
              member: REGISTRE_PDF_MEMBER_SCOPE,
            },
          }),
        ])
      : Promise.resolve([0, 0, 0, 0, 0, 0] as const),
  ]);

  const [
    totalMembersAll,
    lignesPourDate,
    situationRenseignee,
    absencesRenseignees,
    registrePdfMembresTotaux,
    registrePdfLignesPourDate,
  ] = statsBundle;

  const rows = members.map((m, index) => {
    const reg = m.registreCotisations[0];
    return {
      rowNum: offset + index + 1,
      memberId: m.id,
      prenom: m.prenom,
      nom: m.nom,
      telephone: m.telephone ?? '',
      situationText: reg?.situationText ?? '',
      absencesText: reg?.absencesText ?? '',
      registreId: reg?.id ?? null,
      registreUpdatedAt: reg?.updatedAt ?? null,
    };
  });

  const sansLignePourDate = Math.max(0, totalMembersAll - lignesPourDate);

  return NextResponse.json(
    {
      ...createPaginatedResponse(rows, total, page, limit),
      dateReference: formatDateYYYYMMDD(dateReference),
      availableDates: includeStats
        ? dateRows.map((r) => formatDateYYYYMMDD(r.dateReference))
        : undefined,
      scope,
      registreFilter,
      stats: includeStats
        ? {
            totalMembres: totalMembersAll,
            lignesPourDate,
            sansLignePourDate,
            situationRenseignee,
            situationVideOuSansLigne: Math.max(0, totalMembersAll - situationRenseignee),
            absencesRenseignees,
            snapshotsEnBase: dateRows.length,
            registrePdfMembresEnBase: registrePdfMembresTotaux,
            registrePdfLignesPourDate,
          }
        : undefined,
    },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },
  );
}
