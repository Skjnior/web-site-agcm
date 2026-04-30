// app/api/admin/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin, isBureauActif } from '@/lib/rbac';
import { saveUploadedImage } from '@/lib/image-upload';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Autoriser les Admins OU les membres actifs du Bureau
    const isAdministrator = isAdmin(session.user as any);
    const isBureau = await isBureauActif(session.user.id);

    if (!isAdministrator && !isBureau) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 });
    }

    const imageData = await saveUploadedImage(file);

    return NextResponse.json({ success: true, ...imageData });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    );
  }
}

