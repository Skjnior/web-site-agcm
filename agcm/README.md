# AGCM - Association des Guinéens de Charente-Maritime

Plateforme web complète pour l'Association des Guinéens de Charente-Maritime (AGCM), permettant la gestion des membres, des événements, des projets humanitaires, et la communication avec la communauté.

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [API Routes](#api-routes)
- [Déploiement](#déploiement)

## 🎯 À propos

L'AGCM est une association à but non lucratif qui fédère et accompagne les Guinéens de Charente-Maritime. Cette plateforme web permet de :

- Gérer les membres et leurs adhésions
- Organiser et promouvoir les événements
- Suivre les projets humanitaires en Guinée
- Faciliter la communication interne et externe
- Administrer le bureau exécutif et les mandats
- Publier des actualités et des ressources

## ✨ Fonctionnalités

### 🌐 Site Public

- **Page d'accueil moderne** avec sections dynamiques :
  - Statistiques de l'association
  - Actualités (5 plus récentes)
  - Événements (5 par catégorie : À venir, En cours, Passés)
  - Projets en Guinée
  - Bureau exécutif (défilement 2 par 2)
  - Galerie photos (8 images max avec modal)
  - FAQ interactive

- **Formulaires publics** :
  - Demande d'adhésion
  - Contact
  - Demande de partenariat
  - Don

- **Pages publiques** :
  - À propos de l'association
  - PV de réunion
  - Liste des événements
  - Liste des formations

### 🔐 Espace Membre

- **Dashboard personnel** :
  - Profil membre
  - Mes événements
  - Mes formations
  - Paiements et cotisations

- **Interactions** :
  - Commentaires sur les contenus
  - Notations
  - Chat interne
  - Notifications
  - Votes et sondages

### 👨‍💼 Espace Bureau

- **Gestion de contenu** :
  - Création et publication d'actualités
  - Gestion des projets
  - Organisation des événements
  - Soumission pour approbation

- **Communication** :
  - Messages du bureau
  - Votes internes
  - Gestion des commentaires

### 🛡️ Espace Admin

- **Gestion des membres** :
  - Validation des demandes d'adhésion
  - Attribution de numéros de membre
  - Suspension/réactivation
  - Gestion des rôles

- **Modération** :
  - Approbation/rejet de contenus
  - Gestion des commentaires
  - Validation des projets et événements

- **Gestion des demandes** :
  - Demandes d'adhésion
  - Demandes de partenariat
  - Dons
  - Messages de contact

### 🔧 Espace Super Admin

- **Gestion complète** :
  - Utilisateurs et rôles
  - Mandats et postes
  - Affectations du bureau
  - Logs d'audit

## 🛠️ Technologies

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** (composants accessibles)
- **Lucide React** (icônes)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth v5** (authentification JWT)
- **Zod** (validation)

### Services
- **Resend** (emails)
- **Upstash Redis** (rate limiting)
- **DOMPurify** (sécurité XSS)

### Outils
- **Jest** (tests)
- **ESLint** (linting)

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### Étapes

1. **Cloner le projet** (si applicable)
```bash
cd agcm
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**

Créer un fichier `.env` à la racine :
```env
DATABASE_URL="postgresql://kaba:toor@localhost:5432/agcm?sslmode=prefer"
NEXTAUTH_SECRET="votre_secret_aleatoire"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_FROM="AGCM <noreply@agcm.gn>"
RESEND_API_KEY="votre_cle_resend"
UPSTASH_REDIS_REST_URL="votre_url_redis"
UPSTASH_REDIS_REST_TOKEN="votre_token_redis"
```

4. **Initialiser la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Peupler la base avec des données de test
npm run seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
agcm/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── seed.ts                # Script de seeding
│   └── add-public-data.ts     # Script pour données publiques
├── public/
│   ├── Image/
│   │   └── logo.jpg           # Logo de l'association
│   └── ...
├── src/
│   ├── app/                   # Pages Next.js (App Router)
│   │   ├── (auth)/            # Pages d'authentification
│   │   ├── api/               # Routes API
│   │   │   ├── public/       # API publiques
│   │   │   ├── admin/        # API admin
│   │   │   ├── bureau/       # API bureau
│   │   │   ├── app/          # API membres
│   │   │   └── super-admin/  # API super admin
│   │   ├── admin/             # Pages admin
│   │   ├── bureau/            # Pages bureau
│   │   ├── app/               # Pages membres
│   │   └── super-admin/       # Pages super admin
│   ├── components/            # Composants React
│   │   ├── ui/                # Composants UI réutilisables
│   │   ├── AGCMLanding.tsx    # Page d'accueil
│   │   ├── ActualitesSection.tsx
│   │   ├── EvenementsSection.tsx
│   │   ├── BureauSection.tsx
│   │   └── ...
│   ├── lib/                   # Utilitaires
│   │   ├── prisma.ts          # Client Prisma
│   │   ├── auth.ts            # Configuration NextAuth
│   │   ├── rbac.ts            # Contrôle d'accès
│   │   ├── pagination.ts      # Helpers pagination
│   │   └── ...
│   └── hooks/                 # Hooks React personnalisés
├── .env                       # Variables d'environnement
├── .env.local                 # Variables locales (non versionné)
├── next.config.ts             # Configuration Next.js
├── tailwind.config.ts         # Configuration Tailwind
└── package.json
```

## 🗄️ Base de données

### Modèles principaux

- **User** : Utilisateurs du système
- **Member** : Membres de l'association
- **Mandat** : Mandats du bureau exécutif
- **Poste** : Postes du bureau
- **AffectationPoste** : Affectations membres → postes
- **Content** : Contenus (actualités, articles)
- **Projet** : Projets humanitaires
- **Event** : Événements
- **Comment** : Commentaires
- **Rating** : Notes/évaluations
- **Notification** : Notifications utilisateurs
- **Vote** : Votes internes
- **AuditLog** : Logs d'audit

### Maintenance (registre / démo)

Si la base contient encore des comptes `user<n>@agcm.gn` issus du seed legacy : simuler puis exécuter le nettoyage.

```bash
# Pointez DATABASE_URL vers la base ciblée ; dry-run par défaut
DATABASE_URL='…' npm run db:trim-demo-members

DATABASE_URL='…' TRIM_EXECUTE=1 npm run db:trim-demo-members
```

Réimporter le PDF si besoin : `DATABASE_URL='…' npm run db:import-registre`.  
Sur `/bureau/registre-cotisations`, la portée **Registre PDF uniquement** (API `scope=pdf`, défaut) filtre les adhérents `@import.agcm.local` ; **Tout l’annuaire** correspond à `scope=all`.

### Relations

Le schéma Prisma définit 24 tables avec des relations complexes pour gérer :
- La gouvernance (mandats, postes, affectations)
- Le contenu (workflow d'approbation)
- Les interactions (commentaires, votes, notifications)
- L'audit (traçabilité des actions)

## 🔌 API Routes

### Routes publiques (`/api/public/`)
- `GET /api/public/actualites` - Liste des actualités
- `GET /api/public/evenements` - Liste des événements
- `GET /api/public/projets` - Liste des projets
- `GET /api/public/bureau-actuel` - Bureau exécutif actuel
- `GET /api/public/stats` - Statistiques
- `POST /api/public/adhesion` - Demande d'adhésion
- `POST /api/public/contact` - Formulaire de contact
- `POST /api/public/partenariat` - Demande de partenariat
- `POST /api/public/don` - Don

### Routes authentifiées

Voir la documentation complète dans `ARCHITECTURE.md`

## 🎨 Design

### Couleurs

Le design utilise les couleurs du drapeau guinéen :
- **Rouge** : `#dc2626` (red-600)
- **Jaune** : `#eab308` (yellow-500)
- **Vert** : `#16a34a` (green-600)

### Composants UI

- Système de design cohérent avec Tailwind CSS
- Composants accessibles (Radix UI)
- Responsive design (mobile-first)
- Animations fluides
- Modals et overlays

## 📊 Fonctionnalités avancées

### Pagination
Toutes les listes utilisent une pagination standardisée avec :
- Paramètres `page` et `limit`
- Réponse formatée avec métadonnées
- Performance optimisée

### Filtres
Système de filtres réutilisable :
- Filtres texte (recherche)
- Filtres sélection (dropdown)
- Filtres date
- Filtres booléens
- Synchronisation avec URL

### Sécurité
- Authentification JWT (NextAuth)
- Rate limiting (Upstash Redis)
- Validation des entrées (Zod)
- Sanitization HTML (DOMPurify)
- Headers de sécurité (CSP, HSTS)
- Audit logging

### Performance
- Optimisation des requêtes (évite N+1)
- Pagination pour grandes listes
- Images optimisées (Next.js Image)
- Lazy loading
- Transactions Prisma pour cohérence

## 🚢 Déploiement

### Build de production

```bash
npm run build
npm start
```

### Variables d'environnement requises

- `DATABASE_URL` - URL de connexion PostgreSQL
- `NEXTAUTH_SECRET` - Secret pour JWT
- `NEXTAUTH_URL` - URL publique de l'application
- `EMAIL_FROM` - Adresse email d'envoi
- `RESEND_API_KEY` - Clé API Resend
- `UPSTASH_REDIS_REST_URL` - URL Redis
- `UPSTASH_REDIS_REST_TOKEN` - Token Redis

### Migration de base de données

```bash
npx prisma migrate deploy
```

## 📝 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
npm run seed         # Peupler la base de données
npm test             # Tests Jest
```

## 🔒 Permissions et rôles

### Rôles système
- `SUPER_ADMIN` : Accès complet
- `ADMIN` : Gestion administrative
- `BUREAU` : Membres du bureau
- `MEMBRE` : Membres actifs
- `VISITEUR` : Accès public

### Matrice de permissions

Voir `ARCHITECTURE.md` pour la matrice complète des permissions.

## 📚 Documentation supplémentaire

- `ARCHITECTURE.md` - Architecture détaillée
- `ENV_VARIABLES.md` - Variables d'environnement
- `prisma/schema.prisma` - Schéma de base de données

## 👥 Contribution

Ce projet est développé pour l'Association des Guinéens de Charente-Maritime.

## 📄 Licence

Propriétaire - Association des Guinéens de Charente-Maritime

---

**Développé avec ❤️ pour la communauté guinéenne de Charente-Maritime**
