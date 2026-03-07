// src/lib/validators/content.ts
// Validators Zod pour les contenus

import { z } from 'zod';

export const contentCreateSchema = z.object({
  type: z.enum(['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE']),
  titre: z.string().min(1, 'Le titre est requis').max(200, 'Le titre est trop long'),
  contenu: z.string().optional(),
  lienExterne: z.string().url('URL invalide').optional().or(z.literal('')),
  imagePrincipale: z.string().url('URL invalide').optional().or(z.literal('')),
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



