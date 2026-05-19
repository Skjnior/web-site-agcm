import { z } from 'zod';

const mediaUrlSchema = z
  .string()
  .min(1, 'URL requise')
  .refine((v) => v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'), {
    message: 'URL invalide',
  });

export const galerieImageCreateSchema = z.object({
  url: mediaUrlSchema,
  alt: z.string().max(500).optional().default(''),
  visibleSite: z.boolean().optional().default(false),
  ordre: z.number().int().min(0).optional(),
});

export const galerieImageUpdateSchema = z.object({
  url: mediaUrlSchema.optional(),
  alt: z.string().max(500).optional(),
  visibleSite: z.boolean().optional(),
  ordre: z.number().int().min(0).optional(),
});

export const partnerCreateSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(200),
  logo: mediaUrlSchema.optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  siteUrl: z.string().url().optional().nullable().or(z.literal('')),
  type: z.string().max(100).optional().nullable(),
  statut: z.enum(['ACTIF', 'INACTIF']).optional().default('ACTIF'),
  visibiliteSite: z.boolean().optional().default(true),
});

export const partnerUpdateSchema = partnerCreateSchema.partial();
