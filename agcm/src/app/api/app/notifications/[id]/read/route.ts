// src/app/api/app/notifications/[id]/read/route.ts
// Marquer une notification comme lue

import { NextRequest, NextResponse } from 'next/server';
import { requireIntranetAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireIntranetAccess();
  if (error) return error;

  const { id } = await context.params;

  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session!.user!.id!,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur marquage notification:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
