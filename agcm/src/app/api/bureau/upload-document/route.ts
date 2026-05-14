// src/app/api/bureau/upload-document/route.ts
// PDF et documents bureau (aligné sur saveUploadedFile — pas réservé à l’admin)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureau } from '@/lib/require-auth';
import { saveUploadedFile } from '@/lib/file-upload';

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireBureau();
    if (error) return error;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const fileData = await saveUploadedFile(file);

    return NextResponse.json({
      success: true,
      fileUrl: fileData.fileUrl,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
    console.error('upload-document bureau:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
