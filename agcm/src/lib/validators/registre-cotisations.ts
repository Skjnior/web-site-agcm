import { z } from 'zod';

export const registreCotisationPatchSchema = z.object({
  dateReference: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date attendue au format YYYY-MM-DD'),
  situationText: z.string().max(20000).optional(),
  absencesText: z.union([z.string().max(20000), z.null()]).optional(),
});
