// src/lib/validators/event.ts
// Validators Zod pour les événements

import { z } from 'zod';

export const eventCreateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().min(1, 'La description est requise'),
  dateDebut: z.string().transform((str) => new Date(str)),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
  lieu: z.string().max(200).optional(),
  afficheSite: z.boolean().optional().default(false),
});

export const eventUpdateSchema = eventCreateSchema.partial().extend({
  dateDebut: z.string().transform((str) => new Date(str)).optional(),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
});

export const eventMediaSchema = z.object({
  url: z.string().url('URL invalide'),
  isPrincipale: z.boolean().optional().default(false),
  ordre: z.number().int().optional().default(0),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type EventMediaInput = z.infer<typeof eventMediaSchema>;



