// src/lib/validators/content.ts
// Validators Zod pour les contenus

import { z } from 'zod';

import { bureauPublicUrlSchema } from '@/lib/bureau-media-url';

/** Pièce jointe pour les contenus / actualités (image ou PDF, etc.) */
export const contentAttachmentSchema = z.object({
  url: bureauPublicUrlSchema,
  kind: z.enum(['IMAGE', 'DOCUMENT']),
  label: z.string().max(200).optional(),
});

export const contentCreateSchema = z.object({
  type: z.enum(['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE']),
  titre: z.string().min(1, 'Le titre est requis').max(200, 'Le titre est trop long'),
  contenu: z.string().optional(),
  lienExterne: z.string().url('URL invalide').optional().or(z.literal('')),
  imagePrincipale: z.string()
    .refine((val) => !val || val === '' || val.startsWith('http') || val.startsWith('/uploads/'), 'URL ou chemin local invalide')
    .optional()
    .or(z.literal('')),
  attachments: z.array(contentAttachmentSchema).max(20).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  visibiliteCible: z.enum(['PRIVE_BUREAU', 'PUBLIC_SITE']),
});

export const contentUpdateSchema = contentCreateSchema.partial().extend({
  titre: z.string().min(1).max(200).optional(),
});

export const contentSubmitSchema = z.object({
  // Pas de body nécessaire, juste l'ID dans l'URL
});

export type ContentCreateInput = z.infer<typeof contentCreateSchema>;
export type ContentUpdateInput = z.infer<typeof contentUpdateSchema>;



