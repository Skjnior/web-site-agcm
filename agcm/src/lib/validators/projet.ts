// src/lib/validators/projet.ts
// Validators Zod pour les projets

import { z } from 'zod';
import { bureauPublicUrlSchema } from '@/lib/bureau-media-url';

export const projetMediaRowSchema = z.object({
  url: bureauPublicUrlSchema,
  type: z.enum(['IMAGE', 'DOCUMENT']),
  ordre: z.number().int().optional(),
});

export const projetCreateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  objectif: z.string().min(1, 'L\'objectif est requis'),
  description: z.string().min(1, 'La description est requise'),
  actions: z.string().optional(),
  statut: z.enum(['BROUILLON', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE']).optional().default('BROUILLON'),
  visibiliteSite: z.boolean().optional().default(false),
  medias: z.array(projetMediaRowSchema).max(30).optional().default([]),
});

export const projetUpdateSchema = projetCreateSchema.partial();

/** Alias historique */
export const projetMediaSchema = projetMediaRowSchema;

export type ProjetCreateInput = z.infer<typeof projetCreateSchema>;
export type ProjetUpdateInput = z.infer<typeof projetUpdateSchema>;
export type ProjetMediaInput = z.infer<typeof projetMediaRowSchema>;
