import { format } from 'date-fns';

/** Valeur pour un champ HTML `datetime-local` (sans fuseau, interprétation locale navigateur côté formulaire). */
export function dateToDatetimeLocalValue(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}
