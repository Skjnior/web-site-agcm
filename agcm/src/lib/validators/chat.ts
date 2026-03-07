// src/lib/validators/chat.ts
// Validator Zod pour le chat bureau privé

import { z } from 'zod';

export const chatMessageSchema = z.object({
  texte: z.string().min(1, 'Le message ne peut pas être vide').max(2000, 'Message trop long'),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
