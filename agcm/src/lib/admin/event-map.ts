import type { EventStatut } from '@prisma/client';

const VALID_STATUTS: EventStatut[] = ['A_VENIR', 'EN_COURS', 'PASSE'];

/** Anciennes valeurs UI → enum Prisma */
export function normalizeEventStatut(raw: unknown): EventStatut {
  if (typeof raw !== 'string') return 'A_VENIR';
  if (VALID_STATUTS.includes(raw as EventStatut)) return raw as EventStatut;
  const legacy: Record<string, EventStatut> = {
    PLANIFIE: 'A_VENIR',
    TERMINE: 'PASSE',
    ANNULE: 'PASSE',
  };
  return legacy[raw] ?? 'A_VENIR';
}

export function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTimeLocal(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
