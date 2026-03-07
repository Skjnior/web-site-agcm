// lib/image-upload.ts
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, basename } from 'path';
import { existsSync } from 'fs';
import { fileTypeFromBuffer } from 'file-type';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'images');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// S'assurer que le dossier existe
export async function ensureImageUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveUploadedImage(file: File): Promise<{
  imageUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}> {
  await ensureImageUploadDir();

  // Vérifier que c'est une image (première vérification basée sur MIME type)
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // Convertir le File en Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Vérifier la taille
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`L'image est trop volumineuse. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  // Vérifier le type réel du fichier avec magic bytes (protection contre MIME type falsifié)
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
    throw new Error('Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP, GIF');
  }

  // Valider l'extension du nom de fichier
  const originalExtension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(`.${originalExtension}`)) {
    throw new Error('Extension de fichier non autorisée');
  }

  // Générer un nom de fichier unique avec extension sécurisée
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  // Utiliser l'extension du type détecté plutôt que celle du nom de fichier
  const safeExtension = fileType.ext || 'jpg';
  const fileName = `${timestamp}-${randomStr}.${safeExtension}`;
  
  // Sécuriser le chemin pour éviter path traversal
  const safeFileName = basename(fileName);
  const filePath = resolve(UPLOAD_DIR, safeFileName);
  
  // Vérifier que le chemin résolu est bien dans le dossier autorisé
  const resolvedUploadDir = resolve(UPLOAD_DIR);
  if (!filePath.startsWith(resolvedUploadDir)) {
    throw new Error('Chemin de fichier invalide');
  }

  // Sauvegarder le fichier
  await writeFile(filePath, buffer);

  // Retourner l'URL relative (accessible via /uploads/images/filename)
  const imageUrl = `/uploads/images/${safeFileName}`;

  return {
    imageUrl,
    fileName: file.name,
    fileSize: buffer.length,
    mimeType: fileType.mime, // Utiliser le MIME type détecté plutôt que celui fourni
  };
}

