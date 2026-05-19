import fs from 'fs';
import path from 'path';

export type RegistrePdfParsedRow = {
  lignePdf: number;
  nom: string;
  prenom: string;
  telephone: string | null;
  /** Situation cotisation (texte après le téléphone). */
  situationText: string;
  /** Colonne absence du PDF (ex. « 3 mois », « demissionne »). */
  absencesText: string | null;
};

/** Numéro français 06/07 (10 chiffres) ou indicatifs internationaux usuels dans le PDF AGCM. */
const PHONE_RE =
  /\b(0[67](?:\s\d{2}){4}\b|224\s[\d\s]{8,}|212\s[\d\s]{8,}|241\s[\d\s]{6,}|351\s[\d\s]{8,}|34\s[\d\s]{8,})\b/;

/** Colonne « absence » en fin de ligne (PDF avril 2026). */
const ABSENCE_TAIL_RE =
  /\s+((?:\d+\s*mois|absence\s*\+\s*de\s*\d+\s+an[^\n]*|demissionne[^\n]*|exc\s*\d*\s*mois|N\s*A[^\n]*mois|plus\s+a\s+la\s+rochelle|inconnu))\s*$/i;

export function splitSituationAndAbsences(situationText: string): {
  situationText: string;
  absencesText: string | null;
} {
  const raw = situationText.trim();
  if (!raw) return { situationText: '', absencesText: null };
  const m = raw.match(ABSENCE_TAIL_RE);
  if (!m) return { situationText: raw, absencesText: null };
  const absencesText = m[1].trim();
  const situation = raw.slice(0, m.index).trim();
  return { situationText: situation, absencesText: absencesText || null };
}

function splitNomPrenom(namePart: string): { nom: string; prenom: string } {
  const t = namePart.trim().split(/\s+/).filter(Boolean);
  if (t.length === 0) return { nom: '—', prenom: '—' };
  const head = t[0];
  if (head.toLowerCase() === 'mme' || head.toLowerCase() === 'mr') {
    const nom = `${head} ${t[1] ?? ''}`.trim();
    const prenom = t.slice(2).join(' ') || '—';
    return { nom, prenom };
  }
  const nom = head.toUpperCase();
  const prenom = t.slice(1).join(' ') || '—';
  return { nom, prenom };
}

export function parseRegistrePdfExtract(content: string): RegistrePdfParsedRow[] {
  const rows: RegistrePdfParsedRow[] = [];
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, ' ').trim();
    if (!line || /^num\s+NOM/i.test(line)) continue;
    if (/^--\s*\d+\s+of\s+\d+\s+--/.test(line)) continue;

    const m = line.match(/^\s*(\d+)\s+(.+)$/);
    if (!m) continue;

    const lignePdf = parseInt(m[1], 10);
    if (Number.isNaN(lignePdf)) continue;

    const rest = m[2].trim();
    const pm = rest.match(PHONE_RE);

    let telephone: string | null = null;
    let namePart: string;
    let situationText: string;

    if (pm && pm.index !== undefined) {
      telephone = pm[1].replace(/\s+/g, ' ').trim();
      namePart = rest.slice(0, pm.index).trim();
      situationText = rest.slice(pm.index + pm[1].length).trim();
    } else {
      namePart = '';
      situationText = rest;
    }

    if (!namePart && situationText) {
      const sp = splitNomPrenom(situationText);
      rows.push({
        lignePdf,
        nom: sp.nom,
        prenom: sp.prenom,
        telephone: null,
        situationText: '',
        absencesText: null,
      });
      continue;
    }

    const { nom, prenom } = splitNomPrenom(namePart);
    const split = splitSituationAndAbsences(situationText);
    rows.push({
      lignePdf,
      nom,
      prenom,
      telephone,
      situationText: split.situationText,
      absencesText: split.absencesText,
    });
  }

  return rows;
}

export function loadRegistrePdfParsedRows(sourcePath?: string): RegistrePdfParsedRow[] {
  const p =
    sourcePath ??
    process.env.REGISTRE_EXTRACT_PATH ??
    path.join(__dirname, 'data', 'registre-pdf-extract.txt');
  const txt = fs.readFileSync(p, 'utf8');
  return parseRegistrePdfExtract(txt);
}
