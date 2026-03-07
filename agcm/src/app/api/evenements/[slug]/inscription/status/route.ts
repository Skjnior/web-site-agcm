// app/api/evenements/[slug]/inscription/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const session = await auth();
    console.log('GET /api/evenements/[slug]/inscription/status - Event slug:', decodedSlug);

    if (!session?.user) {
      return NextResponse.json({ status: null, authenticated: false }, { status: 401 });
    }

    // L'utilisateur est connecté
    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
    });

    if (!member) {
      // L'utilisateur est connecté mais n'a pas de profil membre
      return NextResponse.json({ 
        status: null, 
        authenticated: true,
        hasMember: false 
      });
    }

    // Récupérer l'événement par slug
    const evenement = await prisma.event.findUnique({
      where: { slug: decodedSlug },
    });

    if (!evenement) {
      return NextResponse.json({ status: null, authenticated: true, hasMember: true });
    }

    // TODO: InscriptionEvenement model à ajouter au schéma pour gérer les inscriptions
    // Pour l'instant, retourner status null (pas d'inscription enregistrée)
    return NextResponse.json({
      status: null,
      authenticated: true,
      hasMember: true,
    });
  } catch (error) {
    console.error('Error checking inscription status:', error);
    return NextResponse.json({ status: null });
  }
}

