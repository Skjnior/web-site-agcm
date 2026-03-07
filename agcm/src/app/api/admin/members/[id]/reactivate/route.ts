// app/api/admin/members/[id]/reactivate/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { canActOnUser } from '@/lib/permissions';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer le membre et son rôle
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { role: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Vérifier les permissions
    if (!canActOnUser(session.user.role, member.user.role)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission d\'agir sur ce membre' },
        { status: 403 }
      );
    }

    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: { status: 'ACTIF' },
    });

    // TODO: Envoyer un email de confirmation au membre

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Error reactivating member:', error);
    return NextResponse.json({ error: 'Failed to reactivate member' }, { status: 500 });
  }
}

