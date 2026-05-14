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

### Carte de couverture — les 9 comptes seed

Tous les emails sont listés dans **`docs/COMPTES_BUREAU_SEED.md`**. La vérité des **modules** appliqués par l’app est **`src/lib/bureau-poste-perimetre.ts`** (filtrage sidebar + `assertBureauModuleOrRedirect`).

| Email seed | Rôle | Résumé des modules bureau | Référence dans ce guide |
|------------|------|---------------------------|-------------------------|
| `president@seed.agcm.local` | **SUPER_ADMIN** | Accès **admin** (+ registre admin, approbations, etc.) | **Étape 1** |
| `secretaire.administratif@seed.agcm.local` | MEMBER | Contenus, traces, chat, notifications — **pas** projets / événements / registre | Pas d’étape nominative : vérifier menu + URLs directes interdites comme pour les autres étapes « bureau » |
| `formation.finance@seed.agcm.local` | MEMBER | **Tous** les modules bureau MEMBER : contenus, projets, événements, traces, **paiements**, chat, notifications | **Étape 2** (complément) + section **Registre cotisations** |
| `tresorier@seed.agcm.local` | MEMBER | Contenus, traces, **paiements**, chat, notifications — **pas** projets / événements | **Étape 2** |
| `organisation@seed.agcm.local` | MEMBER | Projets, événements, traces, chat, notifications — **pas** contenus / registre | Même logique que **Étape 2quater** (équivalent périmètre « sécurité ») |
| `communication@seed.agcm.local` | MEMBER | Contenus, événements, traces, chat, notifications — **pas** projets / registre | **Étape 2bis** |
| `affaires.sociales@seed.agcm.local` | MEMBER | Idem communication (jeu de modules identique) | **Étape 2ter** |
| `securite@seed.agcm.local` | MEMBER | Projets, événements, traces, chat, notifications — **pas** contenus / registre | **Étape 2quater** |
| `sports.culture.environnement@seed.agcm.local` | MEMBER | Contenus, projets, événements, traces, chat, notifications — **pas** registre | **Étape 2quinquies** |

Le **Président** est le seul compte seed traité comme **super-admin** avec une étape dédiée (**Étape 1**) ; les **huit** autres postes sont des **MEMBER** bureau avec périmètres différents — ce tableau assure la même traçabilité « qui tester où » que pour le président.

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

## Étape 2 — Trésorier (`tresorier@seed.agcm.local`)

Compte **MEMBER** avec **paiements** (registre cotisations bureau) mais **sans** module **projets** ni **événements** — voir `src/lib/bureau-poste-perimetre.ts`.

1. Connexion **`tresorier@seed.agcm.local`** / `AGCM-Bureau-Test-2026!`.
2. Aller sur **`/dashboard`**.

| Attendu | Détail |
|---------|--------|
| Redirection | Vers **`/bureau`** si affectation bureau **ACTIF** sur mandat actif |
| Menu bureau visible | **Contenus**, **Traces**, **Registre cotisations**, **Notifications**, salon **privé bureau** |
| **Pas** dans le menu | **Projets**, **Événements** |
| `/bureau/projets` ou `/bureau/evenements` (URL directe) | Redirection vers **`/bureau`** |
| `/bureau/registre-cotisations` | Accès OK (cf. section **Registre cotisations / absences**) |
| `/admin` | Pas d’accès **ADMIN** / **SUPER_ADMIN** |

**Complément — formation & finances** (`formation.finance@seed.agcm.local`) : seul compte MEMBER seed avec **tous** les modules bureau (**contenus**, **projets**, **événements**, **traces**, **paiements**, **chat**, **notifications**). Utilisez-le pour valider un périmètre « large » **et** le registre cotisations, comme le trésorier mais **avec** projets et événements (voir **carte de couverture** ci-dessus).

**Complément — secrétaire administratif** (`secretaire.administratif@seed.agcm.local`) : **contenus** et **traces** uniquement parmi les entrées métier (pas projets, pas événements, pas registre) ; vérifier les redirections sur URLs interdites comme pour les autres étapes bureau.

---

## Étape 2bis — Secrétaire communication (`communication@seed.agcm.local`)

Compte **MEMBER** avec poste bureau **« Secrétaire chargé à l’information et à la communication »** (voir `src/lib/bureau-poste-perimetre.ts`).

1. Connexion **`communication@seed.agcm.local`** / `AGCM-Bureau-Test-2026!`.
2. **`/dashboard`** → redirection attendue vers **`/bureau`**.

| Attendu | Détail |
|---------|--------|
| Menu bureau visible | **Contenus**, **Événements**, **Traces**, **Notifications**, salon **privé bureau** |
| **Pas** dans le menu | **Projets**, **Registre cotisations** (module réservé formation-finances / trésorier / président admin) |
| `/bureau/projets` ou `/bureau/registre-cotisations` (URL directe) | Redirection vers **`/bureau`** (pas d’accès au module) |
| `/bureau/evenements` | Liste OK ; **clic sur une ligne** ou menu ⋮ **« Voir »** → fiche **`/bureau/evenements/[id]`** (lecture seule) ; **« Page publique »** si l’événement est affiché sur le site |
| `/bureau/contents` | Gestion des contenus selon le flux habituel du bureau |

Pour comparer avec un poste qui **a** les projets : utiliser **`organisation@seed.agcm.local`** ou **`sports.culture.environnement@seed.agcm.local`**.

---

## Étape 2ter — Affaires sociales et intégration (`affaires.sociales@seed.agcm.local`)

Compte **MEMBER** avec poste **« Secrétaire chargé aux affaires sociales et à l’intégration »** (`src/lib/bureau-poste-perimetre.ts`).

1. Connexion **`affaires.sociales@seed.agcm.local`** / `AGCM-Bureau-Test-2026!`.
2. **`/dashboard`** → redirection attendue vers **`/bureau`**.

| Attendu | Détail |
|---------|--------|
| Modules bureau (même jeu que communication) | **Événements**, **Contenus**, **Traces**, **Notifications**, salon **privé bureau** |
| **Pas** dans le menu | **Projets**, **Registre cotisations** |
| `/bureau/projets` ou `/bureau/registre-cotisations` (URL directe) | Redirection vers **`/bureau`** |
| Focus métier (référence seed) | Événements sociaux, accueil et intégration des adhérents — à valider fonctionnellement sur **`/bureau/evenements`** et **`/bureau/contents`** |

Pour tester **projets** sans communication/contenus comme axe principal : **`organisation@seed.agcm.local`** (projets + événements, **sans** entrée **Contenus** dans le périmètre).

---

## Étape 2quater — Sécurité (`securite@seed.agcm.local`)

Compte **MEMBER** avec poste **« Secrétaire chargé à la sécurité »** (`src/lib/bureau-poste-perimetre.ts`).

1. Connexion **`securite@seed.agcm.local`** / `AGCM-Bureau-Test-2026!`.
2. **`/dashboard`** → redirection attendue vers **`/bureau`**.

| Attendu | Détail |
|---------|--------|
| Menu bureau visible | **Événements**, **Projets**, **Traces**, **Notifications**, salon **privé bureau** |
| **Pas** dans le menu | **Contenus**, **Registre cotisations** |
| `/bureau/contents` ou `/bureau/registre-cotisations` (URL directe) | Redirection vers **`/bureau`** |
| `/bureau/evenements` | Liste OK ; **clic sur une ligne** ou ⋮ **« Voir »** → **`/bureau/evenements/[id]`** |
| `/bureau/projets` | Liste OK ; **clic sur une ligne** ou ⋮ **« Voir »** → **`/bureau/projets/[id]`** |
| Focus métier (référence seed) | Sécurité des activités, risques, logistique sensible — à valider sur **projets** / **événements** créés depuis ce poste |

Périmètre **modules** identique à **`organisation@seed.agcm.local`** (projets + événements, sans contenus ni paiements) ; seul le libellé de poste et la fiche métier seed diffèrent.

---

## Étape 2quinquies — Sports, culture et environnement (`sports.culture.environnement@seed.agcm.local`)

Compte **MEMBER** avec poste **« Secrétaire chargé aux sports, à la culture et à l'environnement »** (`src/lib/bureau-poste-perimetre.ts`).

1. Connexion **`sports.culture.environnement@seed.agcm.local`** / `AGCM-Bureau-Test-2026!`.
2. **`/dashboard`** → redirection attendue vers **`/bureau`**.

| Attendu | Détail |
|---------|--------|
| Menu bureau visible | **Contenus**, **Projets**, **Événements**, **Traces**, **Notifications**, salon **privé bureau** |
| **Pas** dans le menu | **Registre cotisations** (module **paiements** réservé formation-finances / trésorier / président admin) |
| `/bureau/registre-cotisations` (URL directe) | Redirection vers **`/bureau`** |
| `/bureau/evenements` | Liste OK ; **clic sur une ligne** ou ⋮ **« Voir »** → **`/bureau/evenements/[id]`** |
| `/bureau/projets` | Liste OK ; **clic sur une ligne** ou ⋮ **« Voir »** → **`/bureau/projets/[id]`** |
| `/bureau/contents` | Gestion des contenus selon le flux habituel du bureau |
| Focus métier (référence seed) | Activités sportives, culturelles et sensibilisation environnementale |

**Différence clé avec `formation.finance@seed.agcm.local`** : même trio **contenus + projets + événements**, mais **sans** accès **paiements** / registre cotisations.

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
