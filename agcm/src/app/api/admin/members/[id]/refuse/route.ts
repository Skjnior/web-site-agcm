// app/api/admin/members/[id]/refuse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { canActOnUser } from '@/lib/permissions';
import { sendEmail } from '@/lib/email';
import { getMemberRefusalEmailTemplate } from '@/lib/email-templates';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
          select: { email: true, role: true },
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

    const { raison } = await req.json();

    // Mettre à jour le membre
    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: { status: 'RADIE' },
    });

    // Envoyer un email de refus au membre
    await sendEmail({
      to: member.user.email,
      subject: 'Décision concernant votre demande d\'adhésion à l\'AGCM',
      html: getMemberRefusalEmailTemplate({
        prenom: updatedMember.prenom,
        nom: updatedMember.nom,
        raison: raison || undefined,
      }),
    });

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Error refusing member:', error);
    return NextResponse.json({ error: 'Failed to refuse member' }, { status: 500 });
  }
}

