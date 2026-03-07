// src/lib/validators/demandes.ts
// Validators Zod pour les formulaires visiteurs

import { z } from 'zod';

export const adhesionSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis').max(100),
  nom: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  ville: z.string().max(100).optional(),
  pays: z.string().max(100).optional(),
  message: z.string().max(1000, 'Le message est trop long').optional(),
});

export const partenariatSchema = z.object({
  organisation: z.string().min(1, 'Le nom de l\'organisation est requis').max(200),
  contactNom: z.string().max(100).optional(),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  typePartenariat: z.string().max(100).optional(),
  message: z.string().max(2000, 'Le message est trop long').optional(),
});

export const donationIntentSchema = z.object({
  type: z.enum(['FINANCIER', 'MATERIEL', 'AUTRE']),
  montantEstime: z.number().positive('Le montant doit être positif').optional(),
  description: z.string().max(1000, 'La description est trop longue').optional(),
  nom: z.string().max(100).optional(),
  email: z.string().email('Email invalide').optional(),
  telephone: z.string().optional(),
});

export const contactSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide'),
  sujet: z.string().min(1, 'Le sujet est requis').max(200),
  message: z.string().min(1, 'Le message est requis').max(2000, 'Le message est trop long'),
  destinatairePosteId: z.string().optional(),
});

export type AdhesionInput = z.infer<typeof adhesionSchema>;
export type PartenariatInput = z.infer<typeof partenariatSchema>;
export type DonationIntentInput = z.infer<typeof donationIntentSchema>;
export type ContactInput = z.infer<typeof contactSchema>;



