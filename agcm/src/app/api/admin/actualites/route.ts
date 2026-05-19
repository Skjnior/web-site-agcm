// app/api/admin/actualites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getAdminSessionRole,
  isAdminRole,
  mapBodyToContentFields,
  resolveMandatAndAuteurPoste,
} from '@/lib/admin/actualite-map';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = getAdminSessionRole(session?.user);

    if (!session?.user?.id || !isAdminRole(role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const raw = await req.json();
    const fields = mapBodyToContentFields(raw);

    if (!fields.titre) {
      return NextResponse.json({ error: 'Le titre est obligatoire.' }, { status: 400 });
    }

    const resolved = await resolveMandatAndAuteurPoste(session.user.id);
    if (!resolved) {
      return NextResponse.json(
        {
          error:
            'Impossible de créer l’actualité : aucun mandat actif ou poste auteur trouvé. Contactez un super administrateur.',
        },
        { status: 400 },
      );
    }

    const actualite = await prisma.content.create({
      data: {
        titre: fields.titre,
        contenu: fields.contenu,
        type: fields.type,
        tags: fields.tags,
        imagePrincipale: fields.imagePrincipale,
        statutWorkflow: fields.statutWorkflow,
        approvedAt: fields.approvedAt ?? null,
        visibiliteCible: 'PUBLIC_SITE',
        mandatId: resolved.mandatId,
        auteurPosteId: resolved.auteurPosteId,
      },
    });

    return NextResponse.json({ success: true, actualite });
  } catch (error) {
    console.error('Error creating actualite:', error);
    return NextResponse.json(
      {
        error:
          'Impossible de créer l’actualité. Vérifiez les champs ou réessayez plus tard.',
      },
      { status: 500 },
    );
  }
}
