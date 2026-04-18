# Guide de test — accès par type d’utilisateur (AGCM)

Branche de travail : **`develop`** (à jour avec `origin` avant les tests).

## Prérequis

1. **Base locale** avec seed exécuté au moins une fois :
   ```bash
   cd agcm
   npx prisma db seed
   ```
2. **Variables** dans `agcm/.env` : `agcm_db_DATABASE_URL` (ou équivalent), `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`
3. Lancer l’app :
   ```bash
   npm run dev
   ```
4. Ouvrir : **http://localhost:3000**

**Mot de passe seed (tous les comptes de test)** : `password123`

---

## Comptes de référence (issus de `prisma/seed.ts`)

| Rôle | Email | Comportement attendu après connexion |
|------|--------|--------------------------------------|
| **SUPER_ADMIN** | `user1@agcm.gn` | Redirection vers **`/admin`** + entrées sidebar Super Admin |
| **ADMIN** (Président / équipe) | `user2@agcm.gn` à `user6@agcm.gn` | Redirection vers **`/admin`** (sans Utilisateurs / Mandats / Postes / Affectations / Logs si non super admin — ici user2 est ADMIN) |
| **MEMBRE avec poste bureau actif** | `user7@agcm.gn` (index 6, parmi les 15 premières affectations « bureau actuel ») | **`/dashboard`** → **`/bureau`** (espace bureau) |
| **MEMBRE sans poste bureau actif** | `user16@agcm.gn` (premier index hors des 15 affectations « bureau actuel ») | **`/dashboard`** → **`/app/dashboard`** (espace membre classique) |

> Astuce : à chaque changement de compte, utiliser **Déconnexion** dans le menu ou une **fenêtre de navigation privée** pour éviter le cache de session.

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

## Étape 1 — SUPER_ADMIN (`user1@agcm.gn`)

1. Connexion sur **`/connexion`** avec `user1@agcm.gn` / `password123`.
2. **Attendu** : redirection vers **`/admin`**.

| À tester | Détail |
|----------|--------|
| Sidebar | Présence des liens **Utilisateurs**, **Mandats**, **Postes**, **Affectations**, **Logs système** (réservés Super Admin) |
| `/admin/users` | Liste / création utilisateurs (API `super-admin`) |
| `/admin/mandats`, `/admin/postes`, `/admin/affectations` | Accès pages |
| `/admin/logs` | Logs d’audit |
| `/admin/approbations` | Approbations contenus |
| Déconnexion | Retour site public, plus d’accès `/admin` sans login |

---

## Étape 2 — ADMIN (`user2@agcm.gn`)

1. Déconnexion, puis connexion avec **`user2@agcm.gn`** / `password123`.
2. **Attendu** : redirection vers **`/admin`**.

| À tester | Détail |
|----------|--------|
| Sidebar | **Pas** (ou pas d’usage métier) des liens réservés Super Admin si l’UI les masque pour `ADMIN` — vérifier que **Utilisateurs / Mandats / Postes / Affectations / Logs** ne sont **pas** pour un simple ADMIN (selon `AdminSidebar`, seul `SUPER_ADMIN` les voit) |
| `/admin/approbations`, `/admin/demandes`, `/admin/membres`, `/admin/actualites` | Accès métier président / admin |
| API | Les routes `/api/admin/*` répondent **200** ; `/api/super-admin/*` doivent répondre **403** si testées sans être SUPER_ADMIN |

---

## Étape 3 — MEMBRE avec bureau (`user7@agcm.gn`)

1. Déconnexion, connexion **`user7@agcm.gn`** / `password123`.
2. Aller sur **`/dashboard`** (ou lien « Mon espace »).

| Attendu | Détail |
|---------|--------|
| Redirection | Vers **`/bureau`** (utilisateur avec affectation **ACTIF** sur poste **bureau** pour le mandat actif) |
| `/bureau` | Tableau de bord bureau |
| Sous-routes typiques | `/bureau/contents`, `/bureau/evenements`, `/bureau/projets` selon menus |
| `/app/chat` | Chat membres (si prévu dans la navigation) |
| **Ne doit pas** ouvrir `/admin` sans rôle admin | Middleware redirige membre vers dashboard |

---

## Étape 4 — MEMBRE simple (`user16@agcm.gn`)

1. Déconnexion, connexion **`user16@agcm.gn`** / `password123`.
2. Aller sur **`/dashboard`**.

| Attendu | Détail |
|---------|--------|
| Redirection | Vers **`/app/dashboard`** (pas de poste bureau actif au sens `isBureauActif`) |
| Profil / activités | Pages `/app/dashboard`, `/app/dashboard/mes-activites`, `/app/dashboard/profil` si présentes |
| `/bureau` | Soit refus, soit redirection — **pas** le même accès que user7 |
| Votes / notifications | `/app/votes`, `/app/notifications` si dans le menu |

---

## Synthèse des URLs clés

| URL | Qui y accède typiquement |
|-----|---------------------------|
| `/` | Tous |
| `/connexion` | Tous |
| `/dashboard` | Connectés — **routeur** vers `/admin`, `/bureau` ou `/app/dashboard` |
| `/admin` | `ADMIN`, `SUPER_ADMIN` |
| `/bureau` | Membres avec poste bureau actif (+ souvent admins selon implémentation) |
| `/app/dashboard` | Membres **sans** redirection admin/bureau |

---

## Si quelque chose ne colle pas

- **Toujours redirigé vers `/connexion`** : session absente → vérifier `NEXTAUTH_SECRET`, cookies, URL exacte (`localhost` vs `127.0.0.1`).
- **Comportement incohérent** : relancer le seed sur une base de test **ou** vérifier en base les champs `User.roleSysteme` et `AffectationPoste` pour l’utilisateur testé.
- **403 sur API** : normal si le rôle ne correspond pas à la route (`super-admin` vs `admin`).

---

*Document généré pour tests manuels sur la branche `develop`. À mettre à jour si le seed ou les routes changent.*
