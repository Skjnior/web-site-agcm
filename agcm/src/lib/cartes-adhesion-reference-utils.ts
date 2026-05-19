import type { CarteAdhesionMemberDto } from '@/lib/cartes-adhesion-types';
import { CARTE_REFERENCE_CONTACT_EMAIL } from '@/lib/cartes-adhesion-reference-config';

/** Code affiché « AGCM 069 » — stable pour un même membre. */
export function agcmMemberNumericCode(memberId: string): string {
  let h = 0;
  for (let i = 0; i < memberId.length; i++) {
    h = (Math.imul(31, h) + memberId.charCodeAt(i)) | 0;
  }
  return String(Math.abs(h) % 1000).padStart(3, '0');
}

export function carteExpiryDecemberLabel(adhesionIso: string, yearsValid = 2): string {
  const d = new Date(adhesionIso);
  const y = Number.isFinite(d.getTime())
    ? d.getFullYear() + yearsValid
    : new Date().getFullYear() + yearsValid;
  return `Exp: décembre ${y}`;
}

export function buildCarteQrPayload(memberId: string): string {
  const envBase =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
        : '';
  if (envBase) return `${envBase}/?carte=${encodeURIComponent(memberId)}`;
  return `mailto:${CARTE_REFERENCE_CONTACT_EMAIL}?subject=${encodeURIComponent('Carte AGCM')}&body=${encodeURIComponent(`Réf. membre : ${memberId}`)}`;
}

/** Ligne « fonction » sous le nom (comme « Membre » sur la carte modèle). */
export function carteRoleLine(member: CarteAdhesionMemberDto): string {
  const poste = member.postesBureau?.trim();
  if (poste) {
    const first = poste.split(/[,;]/)[0]?.trim() ?? poste;
    return first.length > 32 ? `${first.slice(0, 30)}…` : first;
  }
  if (member.statutMembre === 'ACTIF') return 'Membre';
  if (member.statutMembre === 'SUSPENDU') return 'Membre suspendu';
  if (member.statutMembre === 'RADIE') return 'Membre radié';
  return 'Membre';
}
