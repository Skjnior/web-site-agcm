// src/lib/validators/comment.ts
// Validator Zod pour les commentaires (bureau uniquement)

import { z } from 'zod';

export const commentCreateSchema = z.object({
  texte: z.string().min(1, 'Le commentaire ne peut pas être vide').max(1000, 'Commentaire trop long'),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
