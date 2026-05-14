# Guide de test — accès par type d’utilisateur (AGCM)

Branche de travail : **`develop`** (à jour avec `origin` avant les tests).

## Prérequis

1. **Variables** : dans `agcm/.env`, Prisma lit surtout **`DATABASE_URL`** (URL PostgreSQL). Si vous n’utilisez qu’`agcm_db_DATABASE_URL`, dupliquez-la ou faites pointer `DATABASE_URL` vers la même valeur, sinon le CLI et l’appli peuvent ne pas cibler la même base.
2. **Migrations appliquées avant le seed** (indispensable — sinon erreur du type *column … does not exist* / message trompeur avec `colonne`) :
   ```bash
   cd agcm
   npx prisma migrate deploy
   npx prisma generate
   ```
3. **Seed** :
   ```bash
   npx prisma db seed
   ```
4. **Auth** : `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`
5. Lancer l’app :
   ```bash
   npm run dev
   ```
6. Ouvrir : **http://localhost:3000**

**Mot de passe seed (tous les comptes)** : `AGCM-Bureau-Test-2026!`

Liste détaillée des 9 comptes bureau : **`docs/COMPTES_BUREAU_SEED.md`**.

---

## Comptes de référence (issus de `prisma/seed.ts` + `bureau-reglement-seed.ts`)

| Rôle | Email | Comportement attendu après connexion |
|------|--------|--------------------------------------|
| **SUPER_ADMIN** (Président) | `president@seed.agcm.local` | Redirection vers **`/admin`** + entrées Super Admin ; peut approuver les contenus |
| **MEMBRE** avec poste bureau actif | Ex. `tresorier@seed.agcm.local`, `communication@seed.agcm.local`, etc. | **`/dashboard`** → **`/bureau`** (affectation **ACTIF**, poste **bureau**, mandat actif) |
| **MEMBRE** sans poste bureau actif | Ex. `user10@agcm.gn` | **`/dashboard`** → **`/app/dashboard`** |

> Le seed ne crée plus de rôles **ADMIN** « user2–user6 » : seul le Président porte **SUPER_ADMIN** pour couvrir validation + configuration. Pour tester un compte **ADMIN** pur, promouvoir manuellement un utilisateur en base ou via super-admin.

> Astuce : à chaque changement de compte, utiliser **Déconnexion** ou une **fenêtre privée**.

---

## Étape 0 — Visiteur (non connecté)

| Action | Vérification |
|--------|----------------|
| Ouvrir `/` | Page d’accueil, pas d’erreur |
| Parcourir `/actualites`, `/evenements`, `/contact` | Accès OK |
| Aller sur `/connexion` | Formulaire visible |
| Tenter `/register` ou `/inscription` | **403** ou message d’interdiction (cahier des charges) |
| Tenter `/admin` sans être connecté | Redirection vers **`/connexion`** |

---

## Étape 1 — SUPER_ADMIN / Président (`president@seed.agcm.local`)

1. Connexion sur **`/connexion`** avec `president@seed.agcm.local` / `AGCM-Bureau-Test-2026!`.
2. **Attendu** : redirection vers **`/admin`**.

| À tester | Détail |
|----------|--------|
| Sidebar | **Utilisateurs**, **Mandats**, **Postes**, **Affectations**, **Logs**, **Registre cotisations** |
| `/admin/users`, mandats, postes, affectations | Accès |
| `/admin/approbations` | Approbations contenus |
| `/admin/registre-cotisations` | Registre cotisations / absences (membre × date de situation), export CSV |
| Déconnexion | Retour site public |

---

## Registre cotisations / absences

- **Président** : **`/admin/registre-cotisations`**
- **Formation-finances ou Trésorier** : **`/bureau/registre-cotisations`** (menu « Registre cotisations »)

Après migration `member_registre_cotisations`, vérifier édition d’une ligne et export CSV.

---

## Étape 2 — MEMBRE avec bureau (ex. `tresorier@seed.agcm.local`)

1. Connexion **`tresorier@seed.agcm.local`** / `AGCM-Bureau-Test-2026!`.
2. Aller sur **`/dashboard`**.

| Attendu | Détail |
|---------|--------|
| Redirection | Vers **`/bureau`** si poste bureau **ACTIF** sur mandat actif |
| `/bureau` | Tableau de bord bureau |
| Sous-routes | `/bureau/contents`, `/bureau/evenements`, `/bureau/projets`, **`/bureau/registre-cotisations`** pour les postes avec module **paiements** (formation-finances, trésorier) |
| `/admin` | Refus ou redirection si pas **ADMIN** / **SUPER_ADMIN** |

---

## Étape 3 — MEMBRE simple (`user10@agcm.gn`)

1. Connexion **`user10@agcm.gn`** / `AGCM-Bureau-Test-2026!`.
2. Aller sur **`/dashboard`**.

| Attendu | Détail |
|---------|--------|
| Redirection | Vers **`/app/dashboard`** (pas d’affectation bureau **ACTIF** sur le mandat en cours) |
| `/bureau` | Pas le même accès que les titulaires de poste |

---

## Synthèse des URLs clés

| URL | Qui y accède typiquement |
|-----|---------------------------|
| `/` | Tous |
| `/connexion` | Tous |
| `/dashboard` | Connectés — routeur vers `/admin`, `/bureau` ou `/app/dashboard` |
| `/admin` | `ADMIN`, `SUPER_ADMIN` |
| `/bureau` | Membres avec poste bureau actif |
| `/app/dashboard` | Membres sans redirection admin/bureau |

---

## Si quelque chose ne colle pas

- **Seed qui échoue avec `P2022` / « colonne » inexistante** : la table `members` n’a pas le même schéma que `schema.prisma`. Exécuter `npx prisma migrate deploy` puis relancer le seed. Vérifier que **`DATABASE_URL`** pointe bien vers la base utilisée.
- **Toujours redirigé vers `/connexion`** : vérifier `NEXTAUTH_SECRET`, cookies, `localhost` vs `127.0.0.1`.
- **Comportement incohérent** : relancer le seed ; vérifier `User.roleSysteme` et `AffectationPoste.statut` / `mandatId`.
- **403 sur API** : rôle incompatible avec la route (`super-admin` vs `admin`).

---

*À mettre à jour si le seed ou les routes changent.*
