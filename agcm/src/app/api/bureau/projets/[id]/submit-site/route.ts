// src/app/api/bureau/projets/[id]/submit-site/route.ts
// Soumettre un projet pour affichage sur le site (nécessite approbation président)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { getAffectationActive } from '@/lib/rbac';
import { logAction } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireBureauModule('projets');
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

    const projet = await prisma.projet.findUnique({
      where: { id },
    });

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }

    if (projet.responsablePosteId !== affectation.posteId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas le responsable de ce projet' },
        { status: 403 }
      );
    }

    // Le projet reste avec visibiliteSite=false jusqu'à approbation président
    // On peut ajouter un champ "enAttenteApprobation" si nécessaire
    // Pour l'instant, on laisse le projet tel quel et le président l'approuve via approve-visibility

    await logAction({
      userId: session!.user.id,
      action: 'SUBMIT',
      entityType: 'Projet',
      entityId: id,
      afterData: projet,
    });

    // TODO: Envoyer notification au Président

    return NextResponse.json({
      success: true,
      message: 'Projet soumis pour approbation d\'affichage sur le site',
      projet,
    });
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



