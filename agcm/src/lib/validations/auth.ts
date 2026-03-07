// src/lib/validations/auth.ts
import { z } from 'zod';

// Schéma de connexion
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Schéma d'inscription
export const registerSchema = z.object({
  // Compte
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string(),
  
  // Profil
  prenom: z
    .string()
    .min(2, 'Prénom requis (minimum 2 caractères)'),
  nom: z
    .string()
    .min(2, 'Nom requis (minimum 2 caractères)'),
  telephone: z
    .string()
    .min(1, 'Numéro de téléphone requis')
    .refine(
      (val) => {
        // Enlever tous les espaces, tirets, points et autres caractères non numériques sauf +
        const cleaned = val.replace(/[\s\-\.\(\)]/g, '');
        // Accepter les formats : +224XXXXXXXXX, 224XXXXXXXXX, 0XXXXXXXXX, ou juste les chiffres
        return /^(\+?224|0)?[0-9]{8,9}$/.test(cleaned) || /^\+?[0-9]{9,15}$/.test(cleaned);
      },
      { message: 'Format de numéro invalide. Exemples acceptés : +224 612 34 56 78, 0612345678, 612345678' }
    ),
  ville: z.string().optional(),
  profession: z.string().optional(),
  entreprise: z.string().optional(),
  memberType: z.enum(['ETUDIANT', 'PROFESSIONNEL', 'HONORAIRE']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;