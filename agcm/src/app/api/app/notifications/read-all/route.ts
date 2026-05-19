// src/app/api/app/notifications/read-all/route.ts
// Marquer toutes les notifications comme lues

import { NextRequest, NextResponse } from 'next/server';
import { requireIntranetAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(_request: NextRequest) {
  const { error, session } = await requireIntranetAccess();
  if (error) return error;

  try {
    await prisma.notification.updateMany({
      where: { userId: session!.user!.id!, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur marquage notifications:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
