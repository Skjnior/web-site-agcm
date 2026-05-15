import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import type { StatutMembre } from '@prisma/client';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { getMandatActif } from '@/lib/mandat';
import { memberContactEmail } from '@/lib/member-contact';

import type { CarteAdhesionMemberDto } from '@/lib/cartes-adhesion-types';

/**
 * Liste paginée pour génération des cartes d’adhérent (aperçu + impression).
 * Limite plafonnée : cette route est réservée à l’admin.
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = request.nextUrl.searchParams;
  const statusFilter = sp.get('status');
  const search = sp.get('q')?.trim() ?? '';
  const bureauOnly = sp.get('bureau') === '1';

  let limit = parseInt(sp.get('limit') ?? '60', 10);
  if (Number.isNaN(limit) || limit < 1) limit = 60;
  if (limit > 300) limit = 300;

  let page = parseInt(sp.get('page') ?? '1', 10);
  if (Number.isNaN(page) || page < 1) page = 1;

  const offset = (page - 1) * limit;

  const mandatActif = await getMandatActif();

  const baseWhere: Prisma.MemberWhereInput = {};

  if (statusFilter && statusFilter !== 'all') {
    baseWhere.statutMembre = statusFilter as StatutMembre;
  }

  if (search) {
    baseWhere.OR = [
      { prenom: { contains: search, mode: 'insensitive' } },
      { nom: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { telephone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const where: Prisma.MemberWhereInput = { ...baseWhere };

  if (bureauOnly && mandatActif) {
    where.affectations = {
      some: {
        mandatId: mandatActif.id,
        statut: 'ACTIF',
        poste: { estBureau: true },
      },
    };
  }

  const include = {
    user: {
      select: { id: true, email: true, roleSysteme: true },
    },
    ...(mandatActif
      ? {
          affectations: {
            where: { mandatId: mandatActif.id, statut: 'ACTIF' as const },
            include: { poste: { select: { nom: true, estBureau: true } } },
          },
        }
      : {}),
  };

  try {
    const [total, rows] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        include,
        orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
        skip: offset,
        take: limit,
      }),
    ]);

    const members: CarteAdhesionMemberDto[] = rows.map((m) => {
      const affs =
        'affectations' in m &&
        Array.isArray((m as { affectations?: unknown }).affectations)
          ? (
              m as unknown as {
                affectations: { poste: { nom: string; estBureau: boolean } }[];
              }
            ).affectations
          : [];
      const bureauAffs = affs.filter((a) => a.poste.estBureau);
      const postesBureau =
        bureauAffs.length > 0 ? bureauAffs.map((a) => a.poste.nom).join(' · ') : null;

      return {
        id: m.id,
        prenom: m.prenom,
        nom: m.nom,
        email: memberContactEmail(m),
        telephone: m.telephone,
        ville: m.ville,
        pays: m.pays,
        statutMembre: m.statutMembre,
        dateAdhesion: m.dateAdhesion.toISOString(),
        photoUrl: m.photoUrl,
        postesBureau,
        isAdherentSansCompte: !m.user,
      };
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      mandatTitre: mandatActif?.titre ?? null,
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error('[cartes-adhesion]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
