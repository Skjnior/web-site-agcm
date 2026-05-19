# Comptes de test — bureau exécutif (seed Prisma)

Après `npm run seed:fresh`, le mot de passe par défaut du seed est **`AGCM-Bureau-Test-2026!`** (défini dans `prisma/bureau-reglement-seed.ts`).

Si les mots de passe ont été changés ou avant une mise en production, **réinitialisez** tous les comptes bureau :

```bash
# Nouveau mot de passe (recommandé en prod)
BUREAU_PASSWORD='VotreMotDePasseSecurise2026!' npm run db:reset-bureau-passwords
```

**Production** (remplacez `DATABASE_URL` par celle de Vercel) :

```bash
DATABASE_URL="postgresql://USER:PASS@hote:5432/agcm?sslmode=require" \
BUREAU_PASSWORD='VotreMotDePasseSecurise2026!' \
npm run db:reset-bureau-passwords
```

Ne commitez **jamais** `BUREAU_PASSWORD` dans Git. Transmettez-le aux membres du bureau par un canal privé.

Dans **`.env`**, si le mot de passe contient `#`, utilisez des **guillemets** : `BUREAU_PASSWORD="AGCM-Prod-2026#Bureau!"` (sinon `#` coupe le mot de passe).

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

Une **carte de couverture** (tous les comptes, modules réels, renvois aux étapes du guide de test) figure dans **`docs/GUIDE_TEST_ROLES_UTILISATEURS.md`** — section *Carte de couverture — les 9 comptes seed*.

Seul le **Président** a le rôle **SUPER_ADMIN** dans ce jeu de données (accès super-admin + approbations). Les autres titulaires de poste ont **MEMBER** mais une **affectation ACTIF** sur un poste **bureau** : ils accèdent à l’espace bureau selon le **périmètre par poste** (`src/lib/bureau-poste-perimetre.ts`). Exemple : **`communication@seed.agcm.local`** a **contenus**, **événements**, **traces**, **chat**, **notifications**, mais **pas** le module **projets** ni **paiements** (voir aussi `docs/GUIDE_TEST_ROLES_UTILISATEURS.md`, étape 2bis).

## Registre cotisations & absences

Les postes du bureau dont le périmètre inclut le module **`paiements`** (voir `src/lib/bureau-poste-perimetre.ts`) peuvent ouvrir **`/bureau/registre-cotisations`** :

- **Secrétaire chargé à la formation et directeur des finances** (`formation.finance@seed.agcm.local`)
- **Trésorier** (`tresorier@seed.agcm.local`)

Il s’agit du registre type Excel/PDF (situation des cotisations à une **date de référence**, absences aux réunions), avec export CSV. Les données sont stockées en base (`member_registre_cotisations`).

Le **Président** (`SUPER_ADMIN`) utilise **`/admin/registre-cotisations`** (même écran, même API).

## Masses de données « démo » (obsolète dans le seed par défaut)

Le script **`npm run seed`** charge désormais les **adhérents du registre PDF** (extraits du fichier associé, situation au **17 avril 2026**) et **ne crée plus** les 600 utilisateurs `user10@agcm.gn` … `user600@agcm.gn`.

Pour rejouer l’ancien jeu massif (600 entrées / table), utilisez :

```bash
npm run seed:legacy-600
```

(Voir `prisma/seed.legacy-600-bulk.ts`.)

Les membres issus du PDF ont un email technique **`registre-pdf-{numéro de ligne}@import.agcm.local`** (pas de compte de connexion ; gestion bureau / registre cotisations).

## Source des intitulés

Les noms et fiches descriptive des postes sont définis dans `prisma/bureau-reglement-seed.ts`, alignés sur le *Projet de règlement intérieur* AGCM (9 fonctions au bureau exécutif). Le poste **« Secrétaire chargé à la formation et directeur des finances »** remplace l’ancien libellé seul « Directeur des finances ».

## Implémentation logicielle vs. fiches de poste

L’application applique des **règles génériques** (bureau / admin / super-admin), pas un module différent par poste (ex. pas d’écran « trésorerie » dédié au seul Trésorier). Les responsabilités du règlement servent de **référence métier** ; la répartition fine des écrans peut évoluer selon les besoins.
