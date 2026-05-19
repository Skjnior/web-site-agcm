// app/api/admin/evenements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAffectationActive } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { normalizeEventStatut } from '@/lib/admin/event-map';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.roleSysteme || session?.user?.role;

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(userRole as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Valider le format du slug (ne doit pas être une URL)
    if (data.slug && (data.slug.startsWith('http://') || data.slug.startsWith('https://'))) {
      return NextResponse.json({ error: 'Le slug ne peut pas être une URL. Utilisez un format comme "evenement-test"' }, { status: 400 });
    }

    const existing = await prisma.event.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 });
    }

    let mandatId = data.mandatId;
    if (!mandatId) {
      const mandatActif = await getMandatActif();
      if (!mandatActif) {
        const fallbackMandat = await prisma.mandat.findFirst({ orderBy: { dateDebut: 'desc' } });
        if (!fallbackMandat) return NextResponse.json({ error: 'Aucun mandat existant' }, { status: 400 });
        mandatId = fallbackMandat.id;
      } else {
        mandatId = mandatActif.id;
      }
    }

    let posteId;
    const affectation = await getAffectationActive(session.user.id);
    if (affectation) {
      posteId = affectation.posteId;
    } else {
      const adminPoste = await prisma.poste.findFirst({ where: { nom: { contains: 'Président' } } });
      posteId = adminPoste?.id || (await prisma.poste.findFirst())?.id;
      if (!posteId) return NextResponse.json({ error: 'Aucun poste existant' }, { status: 400 });
    }

    const dateDebut = new Date(`${data.dateEvenement}T${data.heureDebut || '00:00'}:00`);
    const dateFin = data.heureFin ? new Date(`${data.dateEvenement}T${data.heureFin}:00`) : dateDebut;

    const evenement = await prisma.event.create({
      data: {
        titre: data.titre,
        slug: data.slug,
        description: data.description || '',
        dateDebut,
        dateFin,
        lieu: data.lieu || null,
        statut: normalizeEventStatut(data.status ?? 'A_VENIR'),
        afficheSite: data.published || false,
        createdByPosteId: posteId,
        mandatId: mandatId,
      },
    });

    if (
      typeof data.imageUrl === 'string' &&
      data.imageUrl.trim() !== ''
    ) {
      await prisma.eventMedia.create({
        data: {
          eventId: evenement.id,
          url: data.imageUrl.trim(),
          isPrincipale: true,
          ordre: 0,
        },
      });
    }

    return NextResponse.json({ success: true, evenement });
  } catch (error) {
    console.error('Error creating evenement:', error);
    return NextResponse.json({ error: 'Failed to create evenement' }, { status: 500 });
  }
}

