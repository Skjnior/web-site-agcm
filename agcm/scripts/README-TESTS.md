# Tests des rôles AGCM

## Comptes de test (seed)

Voir **`docs/COMPTES_BUREAU_SEED.md`** (9 postes du règlement + mot de passe unique).

Résumé : mot de passe **`AGCM-Bureau-Test-2026!`** — Président **`president@seed.agcm.local`** (SUPER_ADMIN) ; autres postes en **`*.@seed.agcm.local`** (MEMBER avec bureau) ; démo **`user10@agcm.gn`**.

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
   - **user10@agcm.gn** : espace membre sans bureau actif
