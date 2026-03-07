// API upload pièces jointes salon privé bureau (membres bureau uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { canAccessSalonBureau } from '@/lib/rbac';
import { saveChatAttachment } from '@/lib/chat-attachment-upload';

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const canAccess = await canAccessSalonBureau(session!.user!.id!);
  if (!canAccess) {
    return NextResponse.json(
      { error: 'Accès refusé : réservé aux membres du bureau' },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const result = await saveChatAttachment(file);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
