// src/lib/validators/projet.ts
// Validators Zod pour les projets

import { z } from 'zod';

export const projetCreateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  objectif: z.string().min(1, 'L\'objectif est requis'),
  description: z.string().min(1, 'La description est requise'),
  actions: z.string().optional(),
  statut: z.enum(['BROUILLON', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE']).optional().default('BROUILLON'),
  visibiliteSite: z.boolean().optional().default(false),
});

export const projetUpdateSchema = projetCreateSchema.partial();

export const projetMediaSchema = z.object({
  type: z.enum(['IMAGE', 'DOCUMENT']),
  url: z.string().url('URL invalide'),
  ordre: z.number().int().optional().default(0),
});

export type ProjetCreateInput = z.infer<typeof projetCreateSchema>;
export type ProjetUpdateInput = z.infer<typeof projetUpdateSchema>;
export type ProjetMediaInput = z.infer<typeof projetMediaSchema>;



