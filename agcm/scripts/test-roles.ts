#!/usr/bin/env npx ts-node
/**
 * Script de test des rôles et permissions AGCM
 * Exécute les fonctions RBAC avec les utilisateurs du seed
 * Usage: npx ts-node --project tsconfig.json scripts/test-roles.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  isSuperAdmin,
  isAdmin,
  isBureauActif,
  canAccessSalonBureau,
  getAffectationActive,
} from '../src/lib/rbac';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== TEST DES RÔLES ET PERMISSIONS AGCM ===\n');

  // Récupérer les utilisateurs de test
  const superAdmin = await prisma.user.findFirst({
    where: { roleSysteme: 'SUPER_ADMIN' },
    include: { member: true },
  });
  const admin = await prisma.user.findFirst({
    where: { roleSysteme: 'ADMIN' },
    include: { member: true },
  });
  const members = await prisma.user.findMany({
    where: { roleSysteme: 'MEMBER' },
    include: { member: { include: { affectations: { include: { poste: true, mandat: true } } } } },
    take: 20,
  });

  if (!superAdmin) {
    console.error('❌ Aucun SUPER_ADMIN — exécutez : npx prisma db seed');
    process.exit(1);
  }

  if (!admin) {
    console.log('ℹ️  Aucun utilisateur ADMIN en base (seed actuel : Président = SUPER_ADMIN uniquement).\n');
  }

  // Identifier un membre bureau (affectation ACTIF sur mandat actif, poste bureau)
  const mandatActif = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
    orderBy: { dateDebut: 'desc' },
  });
  let memberBureau: typeof members[0] | null = null;
  let memberSimple: typeof members[0] | null = null;

  for (const m of members) {
    const aff = m.member?.affectations?.find(
      (a) => a.mandatId === mandatActif?.id && a.statut === 'ACTIF' && a.poste?.estBureau
    );
    if (aff && !memberBureau) memberBureau = m;
    if (!aff && !memberSimple) memberSimple = m;
    if (memberBureau && memberSimple) break;
  }

  // Premier membre sans affectation bureau ACTIF sur mandat actif (ex. user10@ après seed)
  const userSimple = await prisma.user.findUnique({
    where: { email: 'user10@agcm.gn' },
    include: { member: { include: { affectations: { include: { poste: true, mandat: true } } } } },
  });

  const tests: Array<{ name: string; user: typeof superAdmin | null; role: string }> = [
    { name: 'SUPER_ADMIN', user: superAdmin, role: 'SUPER_ADMIN' },
    ...(admin ? [{ name: 'ADMIN', user: admin, role: 'ADMIN' }] : []),
    { name: 'MEMBER BUREAU', user: memberBureau || members[0], role: 'MEMBER (bureau)' },
    { name: 'MEMBER SIMPLE', user: memberSimple || userSimple || members[9], role: 'MEMBER (simple)' },
  ];

  for (const { name, user } of tests) {
    if (!user) continue;
    console.log(`\n--- ${name} (${user.email}) ---`);

    console.log(`  isSuperAdmin: ${isSuperAdmin(user)}`);
    console.log(`  isAdmin: ${isAdmin(user)}`);

    const bureau = await isBureauActif(user.id);
    console.log(`  isBureauActif: ${bureau}`);

    const salon = await canAccessSalonBureau(user.id);
    console.log(`  canAccessSalonBureau: ${salon}`);

    const aff = await getAffectationActive(user.id);
    console.log(`  getAffectationActive: ${aff ? `${aff.poste.nom} (${aff.mandat.titre})` : 'null'}`);
  }

  // Récapitulatif des attentes
  console.log('\n=== RÉCAPITULATIF ATTENDU ===');
  console.log('SUPER_ADMIN: isAdmin=true, isBureauActif=selon affectation, salon=selon affectation');
  console.log('ADMIN: isAdmin=true, isBureauActif=selon affectation');
  console.log('MEMBER BUREAU: isBureauActif=true, canAccessSalonBureau=true');
  console.log('MEMBER SIMPLE: isBureauActif=false, canAccessSalonBureau=false');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
