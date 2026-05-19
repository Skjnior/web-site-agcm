/** Textes et coordonnées figés pour le modèle carte type carte plastique AGCM (recto / verso). */

export const CARTE_REFERENCE_CONTACT_EMAIL = 'association.ajgcm@gmail.com';

export const CARTE_REFERENCE_PHONE_DISPLAY = '+33 07 66 37 43 46';

/** Lien cliquable / QR secondaire */
export const CARTE_REFERENCE_PHONE_TEL = 'tel:+33766374346';

export const CARTE_REFERENCE_LOSS_MESSAGE =
  'Cette carte est la propriété de AGCM, en cas de perte prière de nous contacter';

export const CARTE_REFERENCE_STAMP_LINES = [
  'ASSOCIATION des Jeunes Guinéens',
  'de la Charente-Maritime',
  '11 rue Camille Desmoulins — 17000 La Rochelle',
  `Mail : ${CARTE_REFERENCE_CONTACT_EMAIL}`,
] as const;
