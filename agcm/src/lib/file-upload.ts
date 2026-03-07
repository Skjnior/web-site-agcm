// lib/file-upload.ts
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, basename } from 'path';
import { existsSync } from 'fs';
import { fileTypeFromBuffer } from 'file-type';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'ressources');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
// Types de fichiers autorisés pour les ressources
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

// S'assurer que le dossier existe
export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveUploadedFile(file: File): Promise<{
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}> {
  await ensureUploadDir();

  // Convertir le File en Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Vérifier la taille
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Le fichier est trop volumineux. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  // Vérifier le type réel du fichier avec magic bytes
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
    throw new Error('Type de fichier non autorisé. Formats acceptés : PDF, Word, Excel, PowerPoint, TXT, CSV');
  }

  // Générer un nom de fichier unique avec extension sécurisée
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  // Utiliser l'extension du type détecté
  const safeExtension = fileType.ext || 'bin';
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

  // Retourner l'URL relative (accessible via /uploads/ressources/filename)
  const fileUrl = `/uploads/ressources/${safeFileName}`;

  return {
    fileUrl,
    fileName: file.name,
    fileSize: buffer.length,
    mimeType: fileType.mime, // Utiliser le MIME type détecté
  };
}

