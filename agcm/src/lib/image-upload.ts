// lib/image-upload.ts
// Images : Vercel Blob si BLOB_READ_WRITE_TOKEN est défini, sinon fichiers dans public/uploads/images/
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, basename } from 'path';
import { existsSync } from 'fs';
import { fileTypeFromBuffer } from 'file-type';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const LOCAL_IMAGES_DIR = join(process.cwd(), 'public', 'uploads', 'images');

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function ensureLocalImagesDir() {
  if (!existsSync(LOCAL_IMAGES_DIR)) {
    await mkdir(LOCAL_IMAGES_DIR, { recursive: true });
  }
}

export async function saveUploadedImage(file: File): Promise<{
  imageUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`L'image est trop volumineuse. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
    throw new Error('Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP, GIF');
  }

  const originalExtension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(`.${originalExtension}`)) {
    throw new Error('Extension de fichier non autorisée');
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const safeExtension = fileType.ext || 'jpg';
  const uniqueFileName = `${timestamp}-${randomStr}.${safeExtension}`;

  if (hasBlobToken()) {
    const blobPath = `uploads/images/${uniqueFileName}`;
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: fileType.mime,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      imageUrl: blob.url,
      fileName: file.name,
      fileSize: buffer.length,
      mimeType: fileType.mime,
    };
  }

  await ensureLocalImagesDir();

  const safeFileName = basename(uniqueFileName);
  const filePath = resolve(LOCAL_IMAGES_DIR, safeFileName);
  const resolvedDir = resolve(LOCAL_IMAGES_DIR);
  if (!filePath.startsWith(resolvedDir)) {
    throw new Error('Chemin de fichier invalide');
  }

  await writeFile(filePath, buffer);

  return {
    imageUrl: `/uploads/images/${safeFileName}`,
    fileName: file.name,
    fileSize: buffer.length,
    mimeType: fileType.mime,
  };
}
