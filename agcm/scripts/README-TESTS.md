# Tests des rôles AGCM

## Comptes de test (seed)

Voir **`docs/COMPTES_BUREAU_SEED.md`** (9 postes du règlement + mot de passe unique).

Résumé : mot de passe **`AGCM-Bureau-Test-2026!`** — Président **`president@seed.agcm.local`** (SUPER_ADMIN) ; autres postes en **`*.@seed.agcm.local`** (MEMBER avec bureau). Les adhérents du registre PDF n’ont pas de login ; pour un MEMBRE « simple », voir **`docs/GUIDE_TEST_ROLES_UTILISATEURS.md`** (Étape 3) ou **`npm run seed:legacy-600`**.

## Script de test RBAC

```bash
npx tsx scripts/test-roles.ts
```

Vérifie les fonctions `isBureauActif`, `canAccessSalonBureau`, `getAffectationActive` pour chaque rôle.

## Tests unitaires

```bash
npm test
```

## Tests manuels (navigateur)

1. Démarrer le serveur : `npm run dev`
2. Se connecter avec les comptes du fichier `COMPTES_BUREAU_SEED.md`
3. Vérifier :
   - **Président (SUPER_ADMIN)** : `/admin`, approbations, super-admin
   - **Autres titulaires de poste** : `/bureau` selon affectation active
   - **MEMBRE sans bureau** : pas dans le seed par défaut (voir guide Étape 3 ou seed legacy)
