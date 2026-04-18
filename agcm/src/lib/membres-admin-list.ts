// Liste membres côté admin : filtre « bureau » (mandat actif) + indicateurs poste

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getMandatActif } from '@/lib/mandat';

type MemberRow = Prisma.MemberGetPayload<{
  include: {
    user: { select: { id: true; email: true; roleSysteme: true } };
    affectations: {
      include: { poste: { select: { nom: true; estBureau: true } } };
    };
  };
}>;

export async function listMembersForAdmin(params: {
  baseWhere: Prisma.MemberWhereInput;
  skip: number;
  take: number;
  bureauOnly: boolean;
}) {
  const mandatActif = await getMandatActif();

  const where: Prisma.MemberWhereInput = { ...params.baseWhere };

  if (params.bureauOnly && mandatActif) {
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

  const [total, rows] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      include,
      orderBy: { dateAdhesion: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  const members = (rows as MemberRow[]).map((m) => {
    const affs = m.affectations ?? [];
    const bureauAffs = affs.filter((a) => a.poste.estBureau);
    const isBureauActuel = bureauAffs.length > 0;
    const postesBureau =
      bureauAffs.length > 0 ? bureauAffs.map((a) => a.poste.nom).join(', ') : null;

    return {
      id: m.id,
      prenom: m.prenom,
      nom: m.nom,
      email: m.user.email,
      telephone: m.telephone,
      ville: m.ville,
      pays: m.pays,
      statutMembre: m.statutMembre,
      dateAdhesion: m.dateAdhesion,
      isBureauActuel,
      postesBureau,
      user: {
        id: m.user.id,
        email: m.user.email,
        role: m.user.roleSysteme,
      },
    };
  });

  return {
    total,
    members,
    mandatActifId: mandatActif?.id ?? null,
    hasMandatActif: Boolean(mandatActif),
  };
}
