# Comptes de test — bureau exécutif (seed Prisma)

Après `npm run seed` (ou `npx tsx prisma/seed.ts`), le **mot de passe unique** pour **tous** les comptes générés est :

**`AGCM-Bureau-Test-2026!`**

**Avant le seed**, appliquez les migrations sur la base cible (sinon erreur Prisma `P2022` / colonne manquante sur `members`) :

```bash
cd agcm
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

Si **`migrate deploy`** renvoie **P3015** (« migration.sql introuvable »), vérifiez qu’aucun dossier sous `prisma/migrations/` n’est vide ou mal nommé (par ex. un dossier créé par erreur avec un nom du type `$(date +%Y%m%d%H%M%S)_…` sans fichier `migration.sql`). Supprimez ce dossier ou restaurez le fichier, puis relancez `migrate deploy`.

Assurez-vous que **`DATABASE_URL`** dans `.env` pointe vers cette même base (le schéma Prisma utilise `DATABASE_URL`).

## Les 9 postes du règlement intérieur (art. 8)

| Poste | Email | Rôle système |
|--------|--------|--------------|
| Président | president@seed.agcm.local | SUPER_ADMIN |
| Secrétaire administratif | secretaire.administratif@seed.agcm.local | MEMBER |
| Secrétaire chargé à la formation et directeur des finances | formation.finance@seed.agcm.local | MEMBER |
| Trésorier | tresorier@seed.agcm.local | MEMBER |
| Secrétaire chargé à l'organisation | organisation@seed.agcm.local | MEMBER |
| Secrétaire chargé à l'information et à la communication | communication@seed.agcm.local | MEMBER |
| Secrétaire chargé aux affaires sociales et à l'intégration | affaires.sociales@seed.agcm.local | MEMBER |
| Secrétaire chargé à la sécurité | securite@seed.agcm.local | MEMBER |
| Secrétaire chargé aux sports, à la culture et à l'environnement | sports.culture.environnement@seed.agcm.local | MEMBER |

Seul le **Président** a le rôle **SUPER_ADMIN** dans ce jeu de données (accès super-admin + approbations). Les autres titulaires de poste ont **MEMBER** mais une **affectation ACTIF** sur un poste **bureau** : ils accèdent à l’espace bureau (contenus, projets, etc.) selon le RBAC.

## Utilisateurs de démonstration (hors bureau)

- `user10@agcm.gn` … `user600@agcm.gn` — même mot de passe `AGCM-Bureau-Test-2026!`, rôle **MEMBER**, sans poste actif sur le mandat en cours (sauf coïncidence dans d’anciennes bases).

## Source des intitulés

Les noms et fiches descriptive des postes sont définis dans `prisma/bureau-reglement-seed.ts`, alignés sur le *Projet de règlement intérieur* AGCM (9 fonctions au bureau exécutif). Le poste **« Secrétaire chargé à la formation et directeur des finances »** remplace l’ancien libellé seul « Directeur des finances ».

## Implémentation logicielle vs. fiches de poste

L’application applique des **règles génériques** (bureau / admin / super-admin), pas un module différent par poste (ex. pas d’écran « trésorerie » dédié au seul Trésorier). Les responsabilités du règlement servent de **référence métier** ; la répartition fine des écrans peut évoluer selon les besoins.
