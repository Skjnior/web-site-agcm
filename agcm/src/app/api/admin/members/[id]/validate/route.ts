// app/api/admin/members/[id]/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { canActOnUser } from '@/lib/permissions';
import { sendEmail } from '@/lib/email';
import { getMemberValidationEmailTemplate } from '@/lib/email-templates';

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

    const { memberNumber } = await req.json();

    if (!memberNumber || typeof memberNumber !== 'string') {
      return NextResponse.json({ error: 'Member number is required' }, { status: 400 });
    }

    // Vérifier que le numéro n'est pas déjà utilisé
    const existingMember = await prisma.member.findUnique({
      where: { numeroMembre: memberNumber },
    });

    if (existingMember && existingMember.id !== params.id) {
      return NextResponse.json({ error: 'Ce numéro de membre est déjà utilisé' }, { status: 400 });
    }

    // Mettre à jour le membre
    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: {
        status: 'ACTIF',
        numeroMembre: memberNumber,
        dateExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    });

    // Envoyer un email de confirmation au membre
    await sendEmail({
      to: member.user.email,
      subject: 'Votre adhésion à l\'AGCM a été validée',
      html: getMemberValidationEmailTemplate({
        prenom: updatedMember.prenom,
        nom: updatedMember.nom,
        numeroMembre: memberNumber,
        dateExpiration: updatedMember.dateExpiration,
      }),
    });

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Error validating member:', error);
    return NextResponse.json({ error: 'Failed to validate member' }, { status: 500 });
  }
}

