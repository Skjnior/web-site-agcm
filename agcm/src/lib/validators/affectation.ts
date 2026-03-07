// src/lib/validators/affectation.ts
// Validators Zod pour les affectations de postes

import { z } from 'zod';

export const affectationCreateSchema = z.object({
  mandatId: z.string().min(1, 'Le mandat est requis'),
  posteId: z.string().min(1, 'Le poste est requis'),
  memberId: z.string().min(1, 'Le membre est requis'),
  dateDebut: z.string().transform((str) => new Date(str)),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
});

export const affectationInactiverSchema = z.object({
  raisonInactivation: z.string().min(1, 'La raison est obligatoire').max(500),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
});

export type AffectationCreateInput = z.infer<typeof affectationCreateSchema>;
export type AffectationInactiverInput = z.infer<typeof affectationInactiverSchema>;



