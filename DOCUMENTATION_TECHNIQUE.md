# Documentation technique - AGCM

Document de référence technique complet pour la plateforme AGCM (Association des Guinéens de Charente-Maritime).

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Base de données](#3-base-de-données)
4. [API REST](#4-api-rest)
5. [Authentification et autorisation](#5-authentification-et-autorisation)
6. [Sécurité](#6-sécurité)
7. [Configuration et variables d'environnement](#7-configuration-et-variables-denvironnement)
8. [Déploiement](#8-déploiement)
9. [Tests](#9-tests)

---

## 1. Vue d'ensemble

### 1.1 Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js | 15.x |
| UI | React | 19.x |
| Langage | TypeScript | 5.x |
| ORM | Prisma | 6.x |
| Base de données | PostgreSQL | 14+ |
| Authentification | NextAuth | v5 (beta) |
| Styling | Tailwind CSS | 3.x |
| Composants UI | Radix UI | - |
| Validation | Zod | 4.x |
| Emails | Resend | 6.x |

### 1.2 Principes architecturaux

- **App Router** : Utilisation exclusive du routeur App de Next.js
- **Server Components** par défaut, Client Components quand nécessaire
- **API Routes** : Routes API dans `src/app/api/`
- **RBAC** : Contrôle d'accès basé sur les rôles (Role-Based Access Control)
- **Audit** : Traçabilité des actions critiques via `AuditLog`

---

## 2. Architecture

### 2.1 Structure des dossiers

```
agcm/
├── prisma/
│   ├── schema.prisma       # Schéma de la base de données
│   ├── migrations/         # Migrations SQL
│   ├── seed.ts             # Script de peuplement
│   └── prisma.config.ts    # Configuration Prisma
├── public/                 # Fichiers statiques
├── src/
│   ├── app/                # App Router Next.js
│   │   ├── (auth)/         # Groupe : pages d'authentification
│   │   ├── (app)/          # Groupe : pages membres/bureau
│   │   ├── admin/          # Pages administration
│   │   ├── api/            # Routes API
│   │   │   ├── public/     # API publiques (sans auth)
│   │   │   ├── admin/      # API Admin/Président
│   │   │   ├── bureau/     # API Bureau
│   │   │   ├── app/        # API membres
│   │   │   └── super-admin/ # API Super Admin
│   │   └── ...
│   ├── components/         # Composants React
│   │   ├── ui/             # Composants UI réutilisables
│   │   ├── admin/          # Composants admin
│   │   ├── bureau/         # Composants bureau
│   │   └── ...
│   ├── lib/                # Bibliothèques et utilitaires
│   │   ├── prisma.ts       # Client Prisma singleton
│   │   ├── auth.ts         # Configuration NextAuth
│   │   ├── rbac.ts         # Contrôle d'accès
│   │   ├── audit.ts        # Logging d'audit
│   │   ├── mandat.ts       # Helpers mandats
│   │   └── validators/     # Schémas Zod
│   └── hooks/              # Hooks React
├── middleware.ts           # Protection des routes
└── next.config.ts
```

### 2.2 Flux de données

```
[Client] → [Middleware] → [Page/API Route] → [Prisma] → [PostgreSQL]
                ↓
         Vérification auth
         Headers sécurité
```

### 2.3 Workflow de publication de contenu

1. **Bureau** crée un contenu en statut `BROUILLON`
2. Si visibilité = `PUBLIC_MEMBRES` ou `PUBLIC_SITE` → **Soumission** au Président
3. Statut passe à `SOUMIS`
4. **Président/Admin** approuve ou rejette
5. Si approuvé → statut `PUBLIE` → visible selon la visibilité
6. Si rejeté → statut `REJETE` + motif → auteur peut modifier et resoumettre

### 2.4 Archivage automatique

Lorsqu'une **affectation** (membre → poste → mandat) est **inactivée** par le Super Admin :

- Tous les contenus de ce poste dans ce mandat passent à `ARCHIVE`
- L'utilisateur perd l'accès au salon bureau
- Le bureau actuel affiché sur le site public se met à jour

---

## 3. Base de données

### 3.1 Modèles principaux

| Modèle | Description |
|--------|-------------|
| **User** | Comptes utilisateurs (email, mot de passe, rôle) |
| **Member** | Profils membres (1-1 avec User) |
| **Mandat** | Période de gouvernance (ACTIF, EXPIRE, ARCHIVE) |
| **Poste** | Fonctions du bureau (Président, Secrétaire, etc.) |
| **AffectationPoste** | Attribution poste → membre → mandat |
| **Content** | Publications (actualités, articles) avec workflow |
| **Projet** | Projets humanitaires |
| **Event** | Événements |
| **Comment** | Commentaires sur les contenus |
| **DemandeAdhesion** | Demandes d'adhésion |
| **DemandePartenariat** | Demandes de partenariat |
| **DonationIntent** | Intentions de don |
| **MessageContact** | Messages du formulaire contact |
| **AuditLog** | Journal d'audit |

### 3.2 Enums importants

**RoleSysteme** : `SUPER_ADMIN` | `ADMIN` | `MEMBER`

**StatutWorkflow** : `BROUILLON` | `SOUMIS` | `PUBLIE` | `REJETE` | `ARCHIVE`

**VisibiliteCible** : `PRIVE_BUREAU` | `PUBLIC_MEMBRES` | `PUBLIC_SITE`

**StatutAffectation** : `ACTIF` | `INACTIF`

### 3.3 Relations clés

```
User 1──1 Member
Member *──* AffectationPoste *──* Poste
AffectationPoste *──1 Mandat
Content *──1 Poste (auteur), *──1 Mandat
Event *──1 Poste (créateur), *──1 Mandat
Projet *──1 Poste (responsable), *──1 Mandat
```

### 3.4 Commandes Prisma

```bash
npx prisma generate      # Générer le client
npx prisma migrate dev   # Créer/appliquer une migration
npx prisma migrate deploy # Appliquer en production
npx prisma db seed       # Exécuter le seed
npx prisma studio        # Interface graphique
```

---

## 4. API REST

### 4.1 Routes publiques (`/api/public/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/public/actualites` | Liste des actualités |
| GET | `/api/public/evenements` | Liste des événements |
| GET | `/api/public/projets` | Liste des projets |
| GET | `/api/public/projets/[slug]` | Détail d'un projet |
| GET | `/api/public/bureau-actuel` | Bureau exécutif actuel |
| GET | `/api/public/stats` | Statistiques du site |
| GET | `/api/public/president-messages` | Messages du président |
| POST | `/api/public/adhesion` | Demande d'adhésion |
| POST | `/api/public/contact` | Formulaire de contact |
| POST | `/api/public/partenariat` | Demande de partenariat |
| POST | `/api/public/don` | Intention de don |

### 4.2 Routes Admin (`/api/admin/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/membres` | Liste des membres |
| GET | `/api/admin/membres/stats` | Statistiques membres |
| PATCH | `/api/admin/membres/[id]` | Modifier un membre |
| DELETE | `/api/admin/membres/[id]` | Supprimer un membre |
| GET | `/api/admin/demandes/adhesions` | Demandes d'adhésion |
| PATCH | `/api/admin/demandes/adhesions/[id]` | Traiter une adhésion |
| GET | `/api/admin/demandes/partenariats` | Demandes de partenariat |
| PATCH | `/api/admin/demandes/partenariats/[id]` | Traiter un partenariat |
| GET | `/api/admin/demandes/dons` | Intentions de don |
| PATCH | `/api/admin/demandes/dons/[id]` | Traiter un don |
| GET | `/api/admin/evenements` | Liste des événements |
| POST | `/api/admin/evenements` | Créer un événement |
| PUT | `/api/admin/evenements/[id]` | Modifier un événement |
| DELETE | `/api/admin/evenements/[id]` | Supprimer un événement |
| PATCH | `/api/admin/evenements/[id]/approve-afficheSite` | Approuver affichage site |
| POST | `/api/admin/upload` | Upload de fichier |
| POST | `/api/admin/upload-image` | Upload d'image |

### 4.3 Routes Bureau (`/api/bureau/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/bureau/evenements` | Événements du bureau |
| POST | `/api/bureau/evenements` | Créer un événement |
| POST | `/api/bureau/evenements/[id]/submit-site` | Soumettre pour affichage site |
| GET | `/api/bureau/projets` | Projets du bureau |
| POST | `/api/bureau/projets` | Créer un projet |
| POST | `/api/bureau/projets/[id]/submit-site` | Soumettre pour affichage site |

### 4.4 Routes App (membres) (`/api/app/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| PATCH | `/api/app/profil` | Modifier son profil |
| GET | `/api/app/chat` | Messages du chat |
| POST | `/api/app/chat` | Envoyer un message |
| POST | `/api/app/contents/[contentId]/comment` | Commenter un contenu |

### 4.5 Routes Super Admin (`/api/super-admin/`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/super-admin/users` | Liste des utilisateurs |
| POST | `/api/super-admin/users` | Créer un utilisateur |
| GET | `/api/super-admin/users/[id]` | Détail utilisateur |
| PATCH | `/api/super-admin/users/[id]` | Modifier utilisateur |
| DELETE | `/api/super-admin/users/[id]` | Supprimer utilisateur |
| PATCH | `/api/super-admin/users/[id]/suspend` | Suspendre un compte |
| GET | `/api/super-admin/mandats` | Liste des mandats |
| POST | `/api/super-admin/mandats` | Créer un mandat |
| GET | `/api/super-admin/mandats/[id]` | Détail mandat |
| PATCH | `/api/super-admin/mandats/[id]` | Modifier mandat |
| DELETE | `/api/super-admin/mandats/[id]` | Supprimer mandat |
| GET | `/api/super-admin/postes` | Liste des postes |
| POST | `/api/super-admin/postes` | Créer un poste |
| GET | `/api/super-admin/postes/[id]` | Détail poste |
| PATCH | `/api/super-admin/postes/[id]` | Modifier poste |
| DELETE | `/api/super-admin/postes/[id]` | Supprimer poste |
| GET | `/api/super-admin/affectations` | Liste des affectations |
| POST | `/api/super-admin/affectations` | Créer une affectation |
| GET | `/api/super-admin/affectations/[id]` | Détail affectation |
| PATCH | `/api/super-admin/affectations/[id]` | Modifier affectation |
| DELETE | `/api/super-admin/affectations/[id]` | Supprimer affectation |
| PATCH | `/api/super-admin/affectations/[id]/activer` | Activer une affectation |
| PATCH | `/api/super-admin/affectations/[id]/inactiver` | Inactiver une affectation |
| GET | `/api/super-admin/contents` | Liste des contenus |
| GET | `/api/super-admin/contents/[id]` | Détail contenu |
| PATCH | `/api/super-admin/contents/[id]` | Modifier contenu |
| DELETE | `/api/super-admin/contents/[id]` | Supprimer contenu |
| GET | `/api/super-admin/audit-logs` | Logs d'audit |
| DELETE | `/api/super-admin/audit-logs/[id]` | Supprimer un log |
| GET | `/api/super-admin/bureau-actuel` | Bureau actuel (admin) |

### 4.6 Pagination

Les listes paginées utilisent les paramètres de requête :

- `page` : numéro de page (défaut : 1)
- `limit` : nombre d'éléments par page (défaut : 10 ou 20)

Format de réponse :

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 5. Authentification et autorisation

### 5.1 NextAuth

- **Provider** : Credentials (email + mot de passe)
- **Session** : JWT stocké en cookie
- **Callbacks** : Rôle et ID utilisateur inclus dans le token

### 5.2 Rôles système

| Rôle | Description |
|------|-------------|
| `SUPER_ADMIN` | Accès complet, gestion des comptes et de la gouvernance |
| `ADMIN` | Validation des contenus, gestion des demandes, pas de gestion des comptes |
| `MEMBER` | Accès membre, commentaires, votes |

### 5.3 Matrice de permissions (résumé)

| Action | SUPER_ADMIN | ADMIN | MEMBER |
|--------|-------------|-------|--------|
| Créer utilisateur | ✅ | ❌ | ❌ |
| Gérer mandats/postes | ✅ | ❌ | ❌ |
| Approuver contenu | ✅ | ✅* | ❌ |
| Créer contenu (bureau) | ✅ | ✅ | ❌ |
| Modifier contenu archivé | ✅ | ❌ | ❌ |
| Voir logs d'audit | ✅ | ❌ | ❌ |
| Accéder salon bureau | ✅ | ✅ | ❌ |

*Ne peut pas approuver son propre contenu

### 5.4 Helpers d'autorisation

- `requireAuth()` : Vérifie que l'utilisateur est connecté
- `requireRole(...roles)` : Vérifie le rôle
- `requireSuperAdmin()` : Accès Super Admin uniquement
- `requireAdmin()` : Admin ou Super Admin
- `isBureauActif(userId)` : Vérifie si l'utilisateur a un poste actif
- `canApprove(user)` : Vérifie si l'utilisateur peut approuver

---

## 6. Sécurité

### 6.1 Middleware

Le fichier `middleware.ts` :

- **Routes publiques** : `/`, `/bureau-actuel`, `/projets`, `/evenements`, `/actualites`, `/partenaires`, `/adhesion`, `/partenariat`, `/don`, `/contact`
- **API publiques** : `/api/public/*`, `/api/auth/*`
- **Blocage** : `/register`, `/inscription` (création de compte interdite aux visiteurs)
- **Protection** : Routes admin, bureau, dashboard selon le rôle
- **Headers** : X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, HSTS (production)

### 6.2 Bonnes pratiques

- **Validation** : Zod pour toutes les entrées
- **Sanitization** : DOMPurify pour le HTML
- **Mots de passe** : bcrypt pour le hashage
- **Audit** : `logAction()` pour les actions sensibles
- **Rate limiting** : (optionnel) Upstash Redis

### 6.3 Variables sensibles

Ne jamais commiter :

- `.env`, `.env.local`, `.env.*.local`
- Clés API (Resend, etc.)
- `NEXTAUTH_SECRET`

---

## 7. Configuration et variables d'environnement

### 7.1 Variables requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@localhost:5432/agcm` |
| `NEXTAUTH_SECRET` | Secret JWT (min 32 caractères) | Chaîne aléatoire |
| `NEXTAUTH_URL` | URL de l'application | `http://localhost:3000` |

### 7.2 Variables optionnelles

| Variable | Description |
|----------|-------------|
| `EMAIL_FROM` | Adresse d'envoi des emails |
| `RESEND_API_KEY` | Clé API Resend pour les emails |
| `UPSTASH_REDIS_REST_URL` | URL Redis (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis |

### 7.3 Fichiers de configuration

- `next.config.ts` : Configuration Next.js, Turbopack
- `tailwind.config.ts` : Thème et couleurs
- `prisma.config.ts` : Schéma, migrations, seed

---

## 8. Déploiement

### 8.1 Build de production

```bash
cd agcm
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

### 8.2 Variables d'environnement en production

Configurer sur la plateforme (Vercel, etc.) :

- `DATABASE_URL` : Base de données de production
- `NEXTAUTH_SECRET` : Secret fort et unique
- `NEXTAUTH_URL` : URL publique (ex: `https://agcm.example.com`)

### 8.3 Base de données

- Utiliser une base PostgreSQL managée (Neon, Supabase, etc.)
- Exécuter `prisma migrate deploy` avant le premier déploiement
- **Après le premier déploiement** : exécuter le seed manuellement pour les données initiales

### 8.4 Exécuter le seed après déploiement

Le seed n'est **pas** exécuté automatiquement lors du build (il effacerait les données à chaque déploiement). Pour peupler la base après le premier déploiement :

```bash
cd agcm
# Avec DATABASE_URL pointant vers la base de production
npx prisma db seed
# ou
npm run seed
```

**Sur Vercel** : utiliser le CLI ou un script local avec `DATABASE_URL` de production :

```bash
DATABASE_URL="postgresql://..." npx prisma db seed
```

**Attention** : Le seed actuel efface toutes les données avant d'insérer. Ne l'exécuter qu'une seule fois sur une base vide.

---

## 9. Tests

### 9.1 Lancer les tests

```bash
cd agcm
npm test
```

### 9.2 Structure des tests

```
__tests__/
├── api/           # Tests des routes API
├── lib/           # Tests des utilitaires (audit, pagination, rbac, etc.)
├── components/    # Tests des composants
└── validators/    # Tests des schémas Zod
```

### 9.3 Configuration Jest

- `jest.config.js` : Configuration principale
- `jest.setup.js` : Mocks (Prisma, etc.)

---

## Annexes

### A. Comptes de test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | user1@agcm.gn | password123 |
| Admin | user2@agcm.gn | password123 |
| Membre | user7@agcm.gn | password123 |

### B. Références

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://authjs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

*Document mis à jour : 2025*
