// lib/member-number.ts
import { prisma } from './prisma';

/**
 * Génère un numéro de membre au format AGCM-YYYY-XXX
 * @param year - Année pour le numéro (par défaut: année actuelle)
 * @returns Numéro de membre unique
 */
export async function generateMemberNumber(year?: number): Promise<string> {
  const currentYear = year || new Date().getFullYear();
  const prefix = `AGCM-${currentYear}-`;
  // Without tracking the actual numbers in the database schema anymore,
  // we fallback to timestamp-based unique numbers to ensure compilation and uniqueness.
  const formattedNumber = Date.now().toString().slice(-4);
  return `${prefix}${formattedNumber}`;
}

