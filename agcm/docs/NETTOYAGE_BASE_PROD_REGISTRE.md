# Nettoyer la base : uniquement registre PDF + bureau

## Objectif

Sur la base **en ligne** (celle configurée dans Vercel via `DATABASE_URL`), ne garder essentiellement :

1. Les **adhérents issus du PDF / import registre** (`registre-pdf-*@import.agcm.local`) ;
2. Les **membres du bureau** encore **affectés** sur des postes `estBureau` du **mandat ACTIF** ;
3. Les comptes **SUPER_ADMIN** et **ADMIN** (et leur fiche `Member` si elle existe).

Le script **`prisma/trim-to-registre-pdf-and-bureau.ts`** ne touche pas au contenu public (actualités, `site_public_pages`, projets événements, etc.). Il supprime les fiches **`members`** (et les affectations liées aux membres supprimés).

## Obligation : même base que le site prod

Les pages du site interrogent **PostgreSQL uniquement via `DATABASE_URL` du runtime** (Vercel / serveur où tourne Next.js). Pour que les chiffres et listes reflètent la réalité « en ligne », il ne faut pas lancer les scripts avec le `.env` local par erreur.

1. Dans le terminal : utilisez **`DATABASE_URL='…'` explicitement**, copie depuis le dashboard Vercel / Prisma Postgres.
2. Faites d’abord un **dry-run** (voir ci-dessous) et vérifiez les compteurs avant `TRIM_EXECUTE=1`.

## Commandes

```bash
cd agcm

# 1. Simulation — aucune écriture
DATABASE_URL='postgresql://VOTRE_BASE_EN_LIGNE' npm run db:trim-to-registre-bureau

# 2. Après lecture des lignes imprimées, exécution réelle
DATABASE_URL='postgresql://VOTRE_BASE_EN_LIGNE' TRIM_EXECUTE=1 npm run db:trim-to-registre-bureau
```

Si des lignes de registre manquent après coup :

```bash
DATABASE_URL='…' npm run db:import-registre
```

## Rôles côté appli (déjà prévu dans le code)

- **SUPER_ADMIN** : contrôle élargi (routes `requireSuperAdmin`, panneaux admin voir liste selon mise en œuvre) ;
- **ADMIN** et **SUPER_ADMIN** ensemble sur de nombreuses routes admin (`requireAdmin`) ;
- **Membres du bureau** (MEMBER + poste bureau actif) : CRUD métier sous **`/bureau`** avec **filtre par périmètre du poste** (`requireBureauModule`, `bureau-poste-perimetre.ts`). Le super-admin n’est généralement **pas limité au même périmètre** sur l’interface admin dédiée.

Une fois la base prod nettoyée et **déployée** avec cette même URL, tout le site utilise ces données : aucune divergence « local » tant que votre serveur n’utilise pas une autre `DATABASE_URL`.

## Ce qu’il ne faut pas faire

- Lancer **`npm run seed:fresh`** ou **`seed:legacy-600`** contre la prod (recréerait masses de données fictives).
- Réutiliser le schéma `DATABASE_URL` local sans le vérifier (`echo` prudent ou variable d’env unique pour cette session uniquement).
