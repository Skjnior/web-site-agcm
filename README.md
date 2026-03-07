# AGCM - Association des Guinéens de Charente-Maritime

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)](https://www.postgresql.org/)

Plateforme web complète pour l'**Association des Guinéens de Charente-Maritime (AGCM)** : gestion des membres, événements, projets humanitaires, bureau exécutif et communication communautaire.

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Démarrage rapide](#-démarrage-rapide)
- [Structure du projet](#-structure-du-projet)
- [Documentation](#-documentation)
- [Technologies](#-technologies)

---

## 🎯 À propos

L'AGCM fédère et accompagne les Guinéens de Charente-Maritime. Cette plateforme permet de :

- **Gérer les membres** et leurs adhésions
- **Organiser les événements** et formations
- **Suivre les projets** humanitaires en Guinée
- **Administrer le bureau exécutif** (mandats, postes, affectations)
- **Publier actualités** et ressources
- **Traiter les demandes** (adhésion, partenariat, dons, contact)

---

## ✨ Fonctionnalités

| Espace | Description |
|--------|-------------|
| **Site public** | Page d'accueil, actualités, événements, projets, formulaires (adhésion, contact, partenariat, don) |
| **Espace membre** | Dashboard, profil, mes événements, commentaires, votes, notifications |
| **Espace bureau** | Création de contenus, projets, événements, soumission pour approbation |
| **Espace admin** | Validation des demandes, approbation des contenus, gestion des membres |
| **Super Admin** | Utilisateurs, mandats, postes, affectations, logs d'audit |

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** ou **yarn**

### Installation

```bash
cd agcm
npm install
npx prisma generate
```

### Configuration

Créer un fichier `.env` dans le dossier `agcm/` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/agcm?sslmode=prefer"
NEXTAUTH_SECRET="votre_secret_aleatoire_minimum_32_caracteres"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_FROM="AGCM <noreply@votredomaine.com>"
RESEND_API_KEY="re_xxxx"
```

### Base de données

```bash
# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Données de test
npm run seed
```

### Après déploiement (base vide)

Pour peupler la base de production avec les données initiales :

```bash
cd agcm
# Utiliser la DATABASE_URL de production (Vercel, .env.production, etc.)
npx prisma db seed
# ou
npm run seed
```

**Important** : Le seed efface toutes les données avant d'insérer. Ne l'exécuter qu'une seule fois sur une base vide.

### Lancement

```bash
npm run dev
```

Le site est accessible sur **http://localhost:3000**

### Comptes de test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | user1@agcm.gn | password123 |
| Admin | user2@agcm.gn | password123 |
| Membre | user7@agcm.gn | password123 |

---

## 📁 Structure du projet

```
agcm-project/
├── agcm/                    # Application Next.js principale
│   ├── prisma/              # Schéma DB, migrations, seed
│   ├── public/              # Assets statiques
│   ├── src/
│   │   ├── app/             # Pages et API (App Router)
│   │   ├── components/      # Composants React
│   │   ├── lib/             # Utilitaires, auth, Prisma
│   │   └── hooks/           # Hooks personnalisés
│   ├── middleware.ts        # Protection des routes
│   └── next.config.ts
├── docs/                    # Documents du projet
├── README.md                # Ce fichier
└── DOCUMENTATION_TECHNIQUE.md  # Documentation technique complète
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**DOCUMENTATION_TECHNIQUE.md**](DOCUMENTATION_TECHNIQUE.md) | Architecture, API, base de données, sécurité, déploiement |
| [agcm/README.md](agcm/README.md) | Documentation détaillée de l'application |
| [agcm/ARCHITECTURE.md](agcm/ARCHITECTURE.md) | Architecture et workflow |
| [agcm/PERMISSIONS.md](agcm/PERMISSIONS.md) | Matrice des permissions par rôle |

---

## 🛠 Technologies

| Catégorie | Stack |
|-----------|-------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI |
| **Backend** | Next.js API Routes, Prisma ORM, PostgreSQL |
| **Auth** | NextAuth v5 (JWT) |
| **Validation** | Zod |
| **Emails** | Resend |
| **Tests** | Jest, Testing Library |

---

## 📝 Scripts

```bash
npm run dev          # Serveur de développement (Turbopack)
npm run build        # Build de production
npm run start        # Serveur de production
npm run seed         # Peupler la base de données
npm test             # Lancer les tests
```

---

## 📄 Licence

Propriétaire - Association des Guinéens de Charente-Maritime

---

*Développé pour la communauté guinéenne de Charente-Maritime*
