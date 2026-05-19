import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  loadRegistrePdfParsedRows,
  parseRegistrePdfExtract,
  type RegistrePdfParsedRow,
} from './registre-pdf-parser';

/**
 * Importe le registre « dettes + absences » (PDF) en membres + lignes de cotisation.
 * Sans effacer les données existantes (upsert par email technique).
 *
 *   npm run db:import-registre
 *   REGISTRE_PDF_PATH="../docs/ajcm dettes +absences avril 26.pdf" npm run db:import-registre
 *   DRY_RUN=1 npm run db:import-registre
 */

const prisma = new PrismaClient();

const DEFAULT_PDF = path.resolve(
  __dirname,
  '../../docs/ajcm dettes +absences avril 26.pdf',
);

const DATE_REFERENCE = new Date(
  process.env.REGISTRE_DATE?.trim() || '2026-04-17T00:00:00.000Z',
);

function extractPdfWithPdftotext(pdfPath: string): string {
  const tmp = path.join(__dirname, 'data', '.registre-import-tmp.txt');
  try {
    execSync(`pdftotext -layout "${pdfPath}" "${tmp}"`, { stdio: 'pipe' });
    return fs.readFileSync(tmp, 'utf8');
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

function loadRows(): RegistrePdfParsedRow[] {
  const extractPath = process.env.REGISTRE_EXTRACT_PATH?.trim();
  if (extractPath) {
    return loadRegistrePdfParsedRows(extractPath);
  }

  const pdfPath = path.resolve(process.env.REGISTRE_PDF_PATH?.trim() || DEFAULT_PDF);
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF introuvable : ${pdfPath}`);
    console.error('   Définissez REGISTRE_PDF_PATH ou placez le fichier dans docs/.');
    process.exit(1);
  }

  console.log(`📄 Extraction : ${pdfPath}`);
  const content = extractPdfWithPdftotext(pdfPath);
  const outExtract = path.join(__dirname, 'data', 'registre-pdf-extract.txt');
  fs.writeFileSync(outExtract, content, 'utf8');
  console.log(`   Copie texte → ${outExtract}\n`);
  return parseRegistrePdfExtract(content);
}

async function main() {
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
  const rows = loadRows();

  if (rows.length === 0) {
    console.error('❌ Aucune ligne parsée. Vérifiez le PDF ou REGISTRE_EXTRACT_PATH.');
    process.exit(1);
  }

  const dateLabel = DATE_REFERENCE.toISOString().slice(0, 10);
  console.log(`📋 Import registre — ${rows.length} lignes — date ${dateLabel}`);
  if (dryRun) console.log('   (mode DRY_RUN : aucune écriture en base)\n');

  let createdMembers = 0;
  let updatedMembers = 0;
  let registreUpserts = 0;

  for (const row of rows) {
    const email = `registre-pdf-${row.lignePdf}@import.agcm.local`;
    const situation =
      row.situationText.trim() ||
      '(Pas de détail situation dans l’extrait ; voir PDF ou compléter dans le registre.)';
    const absences = row.absencesText?.trim() || null;

    if (dryRun) {
      if (row.lignePdf <= 3 || row.lignePdf >= rows.length - 1) {
        console.log(
          `   [dry] #${row.lignePdf} ${row.nom} ${row.prenom} | ${row.telephone ?? '—'} | sit: ${situation.slice(0, 40)}… | abs: ${absences ?? '—'}`,
        );
      }
      continue;
    }

    const existing = await prisma.member.findUnique({ where: { email } });
    const member = await prisma.member.upsert({
      where: { email },
      create: {
        email,
        nom: row.nom.slice(0, 120),
        prenom: row.prenom.slice(0, 120),
        telephone: row.telephone,
        ville: 'La Rochelle',
        pays: 'France',
        statutMembre: 'ACTIF',
        userId: null,
        dateAdhesion: new Date(2024, 0, 1),
      },
      update: {
        nom: row.nom.slice(0, 120),
        prenom: row.prenom.slice(0, 120),
        telephone: row.telephone,
        ville: 'La Rochelle',
        pays: 'France',
      },
    });

    if (existing) updatedMembers++;
    else createdMembers++;

    await prisma.memberRegistreCotisation.upsert({
      where: {
        memberId_dateReference: {
          memberId: member.id,
          dateReference: DATE_REFERENCE,
        },
      },
      create: {
        memberId: member.id,
        dateReference: DATE_REFERENCE,
        situationText: situation.slice(0, 8000),
        absencesText: absences ? absences.slice(0, 8000) : null,
      },
      update: {
        situationText: situation.slice(0, 8000),
        absencesText: absences ? absences.slice(0, 8000) : null,
      },
    });
    registreUpserts++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) {
    console.log(`✅ ${rows.length} lignes seraient importées (relancez sans DRY_RUN).`);
  } else {
    console.log(`✅ Import terminé`);
    console.log(`   Membres créés : ${createdMembers}`);
    console.log(`   Membres mis à jour : ${updatedMembers}`);
    console.log(`   Lignes registre (${dateLabel}) : ${registreUpserts}`);
    console.log('\n   Bureau → Paiements / Registre cotisations');
    console.log(`   Compte : formation.finance@seed.agcm.local ou tresorier@seed.agcm.local`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
