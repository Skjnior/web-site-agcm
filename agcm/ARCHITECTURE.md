# Architecture AGCM - Documentation Complète

## 📋 Vue d'ensemble

Cette plateforme implémente le cahier des charges complet pour l'Association des Jeunes Guinéens de la Charente-Maritime (AGCM).

## 🗂️ Structure du Projet

### 1. Schéma de Base de Données (Prisma)

**Fichier**: `prisma/schema.prisma`

#### Entités principales :

- **User** : Comptes utilisateurs (SUPER_ADMIN, ADMIN, MEMBER)
- **Member** : Profils membres (1-1 avec User)
- **Mandat** : Périodes de gouvernance (ACTIF, EXPIRE, ARCHIVE)
- **Poste** : Fonctions du bureau (Président, Secrétaire, etc.)
- **AffectationPoste** : Attribution d'un poste à un membre pour un mandat
- **Content** : Publications/activités avec workflow d'approbation
- **Projet** : Projets de l'association
- **Event** : Événements
- **Comment** / **Rating** : Interactions sur les contenus
- **DemandeAdhesion** / **DemandePartenariat** / **DonationIntent** : Formulaires visiteurs
- **AuditLog** : Journal d'audit complet

### 2. Helpers & Utilitaires

#### `src/lib/mandat.ts`
- `getMandatActif()` : Récupère le mandat actif
- `isMandatActif(mandatId)` : Vérifie si un mandat est actif

#### `src/lib/rbac.ts` (Role-Based Access Control)
- `getAffectationActive(userId)` : Récupère l'affectation active d'un utilisateur
- `isBureauActif(userId)` : Vérifie si l'utilisateur est membre actif du bureau
- `canSubmitContent(userId, auteurPosteId?)` : Vérifie si l'utilisateur peut créer du contenu
- `canApprove(user)` : Vérifie si l'utilisateur peut approuver (Président/Admin)
- `canModifyContent(userId, contentId)` : Vérifie les permissions de modification
- `canDeleteContent(userId, contentId)` : Vérifie les permissions de suppression

#### `src/lib/require-auth.ts`
- `requireAuth()` : Vérifie l'authentification (retourne 401 si non connecté)
- `requireRole(...roles)` : Vérifie un rôle spécifique (retourne 403 si non autorisé)
- `requireSuperAdmin()` : Vérifie que l'utilisateur est SuperAdmin
- `requireAdmin()` : Vérifie que l'utilisateur est Admin ou SuperAdmin

#### `src/lib/audit.ts`
- `logAction(data)` : Enregistre une action dans l'audit log
- `getAuditLogs(entityType, entityId)` : Récupère les logs pour une entité
- `getUserAuditLogs(userId)` : Récupère les logs d'un utilisateur

### 3. Routes API

#### Public (visiteurs - pas d'authentification)

**`/api/public/adhesion`** (POST)
- Formulaire d'adhésion
- Crée une `DemandeAdhesion` avec statut `EN_ATTENTE`

#### Admin / Président

**`/api/admin/approbations`** (GET)
- Liste des contenus en attente d'approbation
- Query param: `?status=SOUMIS`

**`/api/admin/approbations/[contentId]/approve`** (PATCH)
- Approuve un contenu
- Passe le statut à `PUBLIE`
- Enregistre `approvedById` et `approvedAt`

**`/api/admin/approbations/[contentId]/reject`** (PATCH)
- Rejette un contenu
- Body: `{ rejectionReason: string }`
- Passe le statut à `REJETE`

#### Bureau (membres avec poste actif)

**`/api/bureau/contents`** (GET, POST)
- GET : Liste les contenus de l'utilisateur
- POST : Crée un contenu en `BROUILLON`
- Vérifie que l'utilisateur a un poste actif

**`/api/bureau/contents/[contentId]/submit`** (POST)
- Soumet un contenu au Président
- Passe le statut à `SOUMIS`
- Obligatoire si `visibiliteCible` ≠ `PRIVE_BUREAU`

#### Super Admin

**`/api/super-admin/affectations`** (GET, POST)
- GET : Liste les affectations (optionnel: `?mandatId=...`)
- POST : Crée une affectation poste → membre → mandat

**`/api/super-admin/affectations/[id]/inactiver`** (PATCH)
- Inactive une affectation
- Body: `{ raisonInactivation: string, dateFin?: Date }`
- **Effet automatique** : Archive tous les contenus du poste dans le mandat

## 🔐 Permissions Détaillées

### Visiteur
- ✅ Voir site public
- ✅ Soumettre formulaires (adhésion, partenariat, don, contact)
- ❌ Créer un compte
- ❌ Accéder aux espaces privés

### Membre
- ✅ Voir salon public (membres)
- ✅ Commenter / Noter les contenus approuvés
- ✅ Voir son profil
- ❌ Créer du contenu
- ❌ Accéder au salon bureau

### Membre du Bureau (poste actif)
- ✅ Créer du contenu (BROUILLON)
- ✅ Soumettre au Président
- ✅ Voir salon privé bureau
- ✅ Modifier ses propres contenus (si pas PUBLIE/ARCHIVE)
- ❌ Approuver du contenu
- ❌ Supprimer du contenu archivé

### Président (ADMIN)
- ✅ Approuver / Rejeter contenus
- ✅ Voir toutes les activités bureau (lecture)
- ✅ Modérer commentaires
- ✅ Gérer demandes (adhésion, partenariat, etc.)
- ❌ Supprimer contenu archivé
- ❌ Gérer postes/mandats

### Super Admin
- ✅ **Tout** : comptes, postes, mandats, affectations
- ✅ Supprimer contenu archivé
- ✅ Voir votes détaillés
- ✅ Voir tous les logs d'audit
- ✅ Inactiver affectations (avec archivage automatique)

## 🔄 Workflow d'Approval

### Création de contenu (Bureau)

1. Membre du bureau crée un `Content` en `BROUILLON`
2. Si `visibiliteCible` = `PUBLIC_MEMBRES` ou `PUBLIC_SITE` :
   - Doit cliquer "Soumettre au Président"
   - Statut passe à `SOUMIS`
3. Président voit dans `/api/admin/approbations?status=SOUMIS`
4. Président peut :
   - **Approuver** → Statut = `PUBLIE` → Visible selon `visibiliteCible`
   - **Rejeter** → Statut = `REJETE` + `rejectionReason` → Auteur peut modifier et resoumettre

### Contenu privé bureau

- Si `visibiliteCible` = `PRIVE_BUREAU` :
  - Pas besoin d'approbation
  - Visible immédiatement dans le salon privé bureau

## 📊 Archivage Automatique

### Quand une affectation devient INACTIF

**Action** : SuperAdmin appelle `/api/super-admin/affectations/[id]/inactiver`

**Effets automatiques** :
1. `AffectationPoste.statut` = `INACTIF`
2. `AffectationPoste.raisonInactivation` = raison fournie
3. **Tous les contenus** de ce `posteId` dans ce `mandatId` passent à `ARCHIVE`
4. L'utilisateur perd l'accès au salon bureau
5. Le bureau actuel (site public) se met à jour automatiquement

## 🛡️ Sécurité

### Middleware (à implémenter dans `middleware.ts`)

- Blocage des routes `/register` (404 ou redirection)
- Protection des routes `/api/bureau/*` : vérifie poste actif
- Protection des routes `/api/admin/*` : vérifie ADMIN ou SUPER_ADMIN
- Protection des routes `/api/super-admin/*` : vérifie SUPER_ADMIN
- Logging des tentatives non autorisées dans `AuditLog`

### Audit Log

Toutes les actions importantes sont loggées :
- CREATE, UPDATE, DELETE
- APPROVE, REJECT, SUBMIT
- ASSIGN, INACTIVATE, ARCHIVE

## 📝 Prochaines Étapes

### À implémenter :

1. **Validators Zod** (`src/lib/validators/`)
   - Schemas pour tous les formulaires
   - Validation côté serveur

2. **Middleware de sécurité** (`middleware.ts`)
   - Protection des routes
   - Redirections selon rôles

3. **Routes API supplémentaires** :
   - `/api/public/partenariat` (POST)
   - `/api/public/don` (POST)
   - `/api/public/contact` (POST)
   - `/api/admin/demandes/*` (GET, PATCH)
   - `/api/bureau/projets/*` (CRUD)
   - `/api/bureau/evenements/*` (CRUD)
   - `/api/app/contents/[id]/comment` (POST)
   - `/api/app/contents/[id]/rating` (POST)
   - `/api/app/chat` (GET, POST)
   - `/api/public/bureau-actuel` (GET)
   - `/api/public/projets` (GET)
   - `/api/public/evenements` (GET)
   - `/api/public/actualites` (GET)

4. **Pages Frontend** :
   - Site public (déjà fait : AGCMLanding)
   - Dashboard membre
   - Dashboard bureau
   - Admin approbations
   - Super Admin (gestion)

5. **Notifications** :
   - Email lors de soumission → Président
   - Email lors d'approbation/rejet → Auteur
   - Notifications in-app

## 🎯 Principes Non Négociables (Rappel)

1. ✅ Aucun visiteur ne peut créer de compte
2. ✅ Seul SUPER_ADMIN crée les comptes
3. ✅ Le bureau fonctionne par mandat
4. ✅ Archivage automatique des contenus lors d'inactivation
5. ✅ Toute publication PUBLIC_MEMBRES/PUBLIC_SITE doit être approuvée par le Président
6. ✅ Le Président voit tout mais ne supprime pas le travail des autres
7. ✅ SUPER_ADMIN = droits complets

---

**Version** : 1.0.0  
**Date** : 2025  
**Stack** : Next.js 15 + PostgreSQL + Prisma + NextAuth



