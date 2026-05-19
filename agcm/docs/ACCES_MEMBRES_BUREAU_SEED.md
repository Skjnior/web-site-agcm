# Accès membres du bureau — comptes **seed / tests** (@seed.agcm.local)

Ce document synthétise les **9 comptes** créés par le seed Prisma (`prisma/bureau-reglement-seed.ts`, `prisma/seed.ts`).  
Ce ne sont pas les adresses e-mail officielles de l’association : ce domaine **`@seed.agcm.local`** sert à la **qualification** et aux **réinitialisations locales**.

| Pour la prod (création / mot de passe) | Voir **`docs/COMPTES_BUREAU_SEED.md`** et **`npm run db:seed-bureau-prod`** avec `BUREAU_PASSWORD`. |

---

## Connexion au site

- **URL :** même origine que le site (ex. `https://votre-domaine` ou `http://localhost:3000`)
- **Page :** **`/connexion`**

---

## Mot de passe (seed standard)

Après **`npx prisma db seed`** (ou jeu équivalent défini dans `BUREAU_SEED_PASSWORD`), le mot de passe **par défaut** est :

**`AGCM-Bureau-Test-2026!`**

(il est défini dans `prisma/bureau-reglement-seed.ts`).

En **production**, si vous utilisez **`npm run db:reset-bureau-passwords`** ou **`db:seed-bureau-prod`** avec votre propre valeur, ce mot de passe ne s’applique plus ; ne communiquez alors jamais ce secret par Git ou e-mail ouvert — voir **`docs/COMPTES_BUREAU_SEED.md`**.

---

## Liste des accès (9 postes du règlement intérieur)

| Fonction | Email (seed) | Rôle système |
|----------|---------------|---------------|
| Président | president@seed.agcm.local | SUPER_ADMIN |
| Secrétaire administratif | secretaire.administratif@seed.agcm.local | MEMBER |
| Secrétaire chargé à la formation et directeur des finances | formation.finance@seed.agcm.local | MEMBER |
| Trésorier | tresorier@seed.agcm.local | MEMBER |
| Secrétaire chargé à l’organisation | organisation@seed.agcm.local | MEMBER |
| Secrétaire chargé à l’information et à la communication | communication@seed.agcm.local | MEMBER |
| Secrétaire chargé aux affaires sociales et à l’intégration | affaires.sociales@seed.agcm.local | MEMBER |
| Secrétaire chargé à la sécurité | securite@seed.agcm.local | MEMBER |
| Secrétaire chargé aux sports, à la culture et à l’environnement | sports.culture.environnement@seed.agcm.local | MEMBER |

---

## Où ils arrivent après connexion

| Profil | Landing principale |
|--------|----------------------|
| **Président** (SUPER_ADMIN) | **`/admin`** |
| **Autres membres bureau** (MEMBER avec poste bureau actif sur mandat) | **`/bureau`** |

Référence détaillée des comportements et tests étape par étape : **`docs/GUIDE_TEST_ROLES_UTILISATEURS.md`**.

---

## Périmètre applicatif par compte (modules bureau)

Réalité métier codée dans **`src/lib/bureau-poste-perimetre.ts`** (sidebar + blocages).

| Partie avant `@seed.agcm.local` | Synthèse des modules utilisables en bureau |
|--------------------------------|-----------------------------------------------|
| **president** | SUPER_ADMIN : administration complète (+ registre côté admin si configuré). |
| **formation.finance** | Jeu complet côté **MEMBER** bureau : contenus, projets, événements, traces, **paiements** / registre, chat, notifications. |
| **tresorier** | Contenus, traces, **paiements**/registre, chat ; **pas** projets ni événements (menu). |
| **secretaire.administratif** | Contenus, traces, chat ; **pas** projets / événements / registre paiements. |
| **communication**, **affaires.sociales** | Contenus, **événements**, traces, chat ; **pas** projets ni registre paiements. |
| **organisation**, **securite** | **Projets**, **événements**, traces, chat ; **pas** contenus ni registre paiements. |
| **sports.culture.environnement** | Contenus, projets, événements, traces, chat ; **pas** registre paiements. |

**Registre cotisations — écran bureau :**

- **`formation.finance`** et **`tresorier`** : **`/bureau/registre-cotisations`**
- **Président** (SUPER_ADMIN) : équivalent généralement **`/admin/registre-cotisations`** (voir guide).

---

## Fiches liées dans le repo

| Document | Usage |
|----------|-------|
| `docs/COMPTES_BUREAU_SEED.md` | Détail mots de passe, prod, registre PDF |
| `docs/GUIDE_TEST_ROLES_UTILISATEURS.md` | Procédures de test et matrice exhaustive |
| `prisma/bureau-reglement-seed.ts` | Liste canonique emails + définition postes |

---

_Last update : aligné sur le seed du dépôt — à réaligner après tout changement de `BUREAU_SEED_ACCOUNTS`._
