// src/lib/mandat.ts
// Helpers pour gérer les mandats actifs

import { prisma } from './prisma';

/**
 * Récupère le mandat actif (statut = ACTIF)
 * @returns Le mandat actif ou null
 */
export async function getMandatActif() {
  return await prisma.mandat.findFirst({
    where: {
      statut: 'ACTIF',
    },
  });
}

/**
 * Vérifie si un mandat est actif
 * @param mandatId - ID du mandat à vérifier
 * @returns true si le mandat est actif
 */
export async function isMandatActif(mandatId: string): Promise<boolean> {
  const mandat = await prisma.mandat.findUnique({
    where: { id: mandatId },
    select: { statut: true },
  });
  return mandat?.statut === 'ACTIF';
}

/**
 * Récupère tous les mandats (pour admin)
 */
export async function getAllMandats() {
  return await prisma.mandat.findMany({
    orderBy: { dateDebut: 'desc' },
  });
}



