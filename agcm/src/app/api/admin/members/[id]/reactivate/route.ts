// app/api/admin/members/[id]/reactivate/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canActOnMemberRecord } from '@/lib/permissions';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer le membre et son rôle
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: { roleSysteme: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Vérifier les permissions
    if (!canActOnMemberRecord(session.user.role, member)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission d\'agir sur ce membre' },
        { status: 403 }
      );
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: { statutMembre: 'ACTIF' },
    });

    // TODO: Envoyer un email de confirmation au membre

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Error reactivating member:', error);
    return NextResponse.json({ error: 'Failed to reactivate member' }, { status: 500 });
  }
}

