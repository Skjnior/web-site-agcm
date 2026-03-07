// app/api/admin/members/[id]/refuse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canActOnUser } from '@/lib/permissions';
import { sendEmail } from '@/lib/email';
import { getMemberRefusalEmailTemplate } from '@/lib/email-templates';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
          select: { email: true, roleSysteme: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Vérifier les permissions
    if (!canActOnUser(session.user.role, member.user.roleSysteme)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission d\'agir sur ce membre' },
        { status: 403 }
      );
    }

    const { raison } = await req.json();

    // Mettre à jour le membre
    const updatedMember = await prisma.member.update({
      where: { id },
      data: { statutMembre: 'RADIE' },
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

