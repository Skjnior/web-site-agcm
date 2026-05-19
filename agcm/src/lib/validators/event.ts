// src/lib/validators/event.ts
// Validators Zod pour les événements

import { z } from 'zod';

import { bureauPublicUrlSchema } from '@/lib/bureau-media-url';

export const eventMediaItemSchema = z.object({
  url: bureauPublicUrlSchema,
  isPrincipale: z.boolean().optional().default(false),
  ordre: z.number().int().optional(),
});

export const eventCreateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().min(1, 'La description est requise'),
  dateDebut: z.string().transform((str) => new Date(str)),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
  lieu: z.string().max(200).optional(),
  afficheSite: z.boolean().optional().default(false),
  medias: z.array(eventMediaItemSchema).max(25).optional().default([]),
});

/** PATCH bureau / API : champs partiels, chaînes vides dates ignorées, dateFin vide → null */
export const eventUpdateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200).optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  dateDebut: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.union([z.string(), z.coerce.date()]).optional().transform((v) => {
      if (v === undefined) return undefined;
      return v instanceof Date ? v : new Date(String(v));
    })
  ),
  dateFin: z.preprocess(
    (v) => {
      if (v === '') return null;
      return v;
    },
    z
      .union([z.string(), z.coerce.date(), z.null()])
      .optional()
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null) return null;
        return v instanceof Date ? v : new Date(String(v));
      })
  ),
  lieu: z.string().max(200).optional().nullable(),
  afficheSite: z.boolean().optional(),
  medias: z.array(eventMediaItemSchema).max(25).optional(),
});

export const eventMediaSchema = z.object({
  url: bureauPublicUrlSchema,
  isPrincipale: z.boolean().optional().default(false),
  ordre: z.number().int().optional().default(0),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type EventMediaInput = z.infer<typeof eventMediaSchema>;



