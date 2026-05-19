// app/api/admin/members/[id]/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canActOnMemberRecord } from '@/lib/permissions';
import { sendEmail } from '@/lib/email';
import { getMemberValidationEmailTemplate } from '@/lib/email-templates';

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
    if (!canActOnMemberRecord(session.user.role, member)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission d\'agir sur ce membre' },
        { status: 403 }
      );
    }

    const contactEmail = member.user?.email ?? member.email;
    if (!contactEmail) {
      return NextResponse.json({ error: 'Aucun e-mail de contact pour ce membre' }, { status: 400 });
    }

    const { memberNumber } = await req.json();
    const memberNumberStr = memberNumber && typeof memberNumber === 'string' ? memberNumber : id;

    // Mettre à jour le membre
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        statutMembre: 'ACTIF',
      },
    });

    // Envoyer un email de confirmation au membre
    const dateExpiration = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    await sendEmail({
      to: contactEmail,
      subject: 'Votre adhésion à l\'AGCM a été validée',
      html: getMemberValidationEmailTemplate({
        prenom: updatedMember.prenom,
        nom: updatedMember.nom,
        numeroMembre: memberNumberStr,
        dateExpiration,
      }),
    });

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Error validating member:', error);
    return NextResponse.json({ error: 'Failed to validate member' }, { status: 500 });
  }
}

