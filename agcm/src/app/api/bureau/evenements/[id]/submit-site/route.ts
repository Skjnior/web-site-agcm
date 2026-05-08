// src/app/api/bureau/evenements/[id]/submit-site/route.ts
// Soumettre un événement pour affichage sur le site (nécessite approbation président)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { getAffectationActive } from '@/lib/rbac';
import { logAction } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireBureauModule('evenements');
  if (error) return error;

  const { id } = await params;

  try {
    const affectation = await getAffectationActive(session!.user.id);
    if (!affectation) {
      return NextResponse.json(
        { error: 'Vous devez avoir un poste actif' },
        { status: 403 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      );
    }

    if (event.createdByPosteId !== affectation.posteId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas le créateur de cet événement' },
        { status: 403 }
      );
    }

    // L'événement reste avec afficheSite=false jusqu'à approbation président
    // TODO: Envoyer notification au Président

    await logAction({
      userId: session!.user.id,
      action: 'SUBMIT',
      entityType: 'Event',
      entityId: id,
      afterData: event,
    });

    return NextResponse.json({
      success: true,
      message: 'Événement soumis pour approbation d\'affichage sur le site',
      event,
    });
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



