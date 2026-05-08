import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { canAccessSalonBureau } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { prisma } from '@/lib/prisma';
import { userIsBureauOnMandat } from '@/lib/bureau-chat-server';

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user!.id!;
  const canAccess = await canAccessSalonBureau(userId);
  if (!canAccess) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const mandatActif = await getMandatActif();
  if (!mandatActif) {
    return NextResponse.json({ members: [] });
  }

  const meOk = await userIsBureauOnMandat(userId, mandatActif.id);
  if (!meOk) {
    return NextResponse.json({ error: 'Aucun poste bureau actif sur ce mandat' }, { status: 403 });
  }

  const rows = await prisma.affectationPoste.findMany({
    where: {
      mandatId: mandatActif.id,
      statut: 'ACTIF',
      poste: { estBureau: true },
      member: { userId: { not: null } },
    },
    select: {
      member: {
        select: {
          userId: true,
          prenom: true,
          nom: true,
          photoUrl: true,
          user: { select: { id: true, email: true } },
        },
      },
    },
  });

  const byUser = new Map<
    string,
    { userId: string; email: string; prenom: string; nom: string; photoUrl: string | null }
  >();

  for (const r of rows) {
    const m = r.member;
    const uid = m.userId ?? m.user?.id;
    if (!uid || uid === userId) continue;
    if (!byUser.has(uid)) {
      byUser.set(uid, {
        userId: uid,
        email: m.user?.email ?? '',
        prenom: m.prenom,
        nom: m.nom,
        photoUrl: m.photoUrl,
      });
    }
  }

  const members = [...byUser.values()].sort((a, b) =>
    `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, 'fr'),
  );

  return NextResponse.json({ members });
}
