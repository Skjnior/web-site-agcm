import { z } from 'zod';

/** URL publique (blob, absolu) ou fichier servi depuis public/uploads */
export const bureauPublicUrlSchema = z
  .string()
  .min(1)
  .refine((u) => u.startsWith('http') || u.startsWith('/uploads/'), 'URL ou chemin invalide');
