// lib/chat-attachment-upload.ts
// Upload de pièces jointes pour le salon privé bureau (PDF, images, vidéos)

import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, basename } from 'path';
import { existsSync } from 'fs';
import { fileTypeFromBuffer } from 'file-type';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'salon-bureau');
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB par fichier

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'DOCUMENT',
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/webp': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
};

export async function ensureChatUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveChatAttachment(file: File): Promise<{
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}> {
  await ensureChatUploadDir();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop volumineux. Maximum : ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !(fileType.mime in ALLOWED_MIME_TYPES)) {
    throw new Error(
      'Type non autorisé. Formats acceptés : PDF, JPEG, PNG, GIF, WebP, MP4, WebM'
    );
  }

  const attachmentType = ALLOWED_MIME_TYPES[fileType.mime] as 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const safeExtension = fileType.ext || 'bin';
  const fileName = `${timestamp}-${randomStr}.${safeExtension}`;
  const safeFileName = basename(fileName);
  const filePath = resolve(UPLOAD_DIR, safeFileName);

  const resolvedUploadDir = resolve(UPLOAD_DIR);
  if (!filePath.startsWith(resolvedUploadDir)) {
    throw new Error('Chemin de fichier invalide');
  }

  await writeFile(filePath, buffer);
  const url = `/uploads/salon-bureau/${safeFileName}`;

  return {
    url,
    fileName: file.name,
    fileSize: buffer.length,
    mimeType: fileType.mime,
    type: attachmentType,
  };
}
