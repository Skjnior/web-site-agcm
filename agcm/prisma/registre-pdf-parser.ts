import fs from 'fs';
import path from 'path';

export type RegistrePdfParsedRow = {
  lignePdf: number;
  nom: string;
  prenom: string;
  telephone: string | null;
  /** Situation cotisation / absences (texte après le téléphone, ou ligne complète si pas de tel). */
  situationText: string;
};

/** Numéro français 06/07 ou indicatifs internationaux usuels dans le PDF AGCM. */
const PHONE_RE =
  /\b(0[67](?:\s\d{2}){4,5}|224\s[\d\s]{8,}|212\s[\d\s]{8,}|241\s[\d\s]{6,}|351\s[\d\s]{8,}|34\s[\d\s]{8,})\b/;

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

    const m = line.match(/^(\d+)\s+(.+)$/);
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
      });
      continue;
    }

    const { nom, prenom } = splitNomPrenom(namePart);
    rows.push({ lignePdf, nom, prenom, telephone, situationText });
  }

  return rows;
}

export function loadRegistrePdfParsedRows(): RegistrePdfParsedRow[] {
  const p = path.join(__dirname, 'data', 'registre-pdf-extract.txt');
  const txt = fs.readFileSync(p, 'utf8');
  return parseRegistrePdfExtract(txt);
}
