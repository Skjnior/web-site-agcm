voici ce que tu dois faire # CAHIER DES CHARGES COMPLET — PLATEFORME AGCM
Version avancée – Gouvernance, collaboration et transparence

Association des Jeunes Guinéens de la Charente-Maritime

## 0) Principes non négociables

1. **Aucun visiteur ne peut créer de compte**
2. **Seul SUPER_ADMIN crée les comptes** et affecte les postes
3. **Le bureau fonctionne par mandat** : tout est lié à un `Mandat`
4. **Archivage automatique** des activités d’un responsable inactif / fin mandat
5. **Toute publication destinée aux membres (salon public) ou au site public** doit être **approuvée par le Président** avant diffusion
6. Le Président **voit tout** (lecture) mais **ne supprime/modifie pas** le travail des autres (sauf ses propres contenus).
7. **SUPER_ADMIN** = droits complets (modif/suppression même archivés + logs + votes détaillés)

---

# 1) Acteurs et espaces

## 1.1 Acteurs

* **Visiteur (Public)** : non connecté
* **Membre** : connecté, non-bureau
* **Membre du bureau (poste actif)** : connecté avec poste + permissions
* **Président (poste + admin)** : valide les publications, supervise (lecture globale)
* **SUPER_ADMIN** : gestion comptes, postes, mandats, archivage, suppression, logs, votes détaillés

---

## 1.2 Espaces

### A) Site Public (visiteur)

* Bureau actuel
* Projets
* Actualités & Publications (approuvées)
* Partages (approuvés)
* Événements (publics)
* Partenaires
* Adhérer (demande)
* Devenir partenaire (demande)
* Faire un don (infos + contact)
* Contact

### B) Salon public (membres connectés)

* Fil d’actualité interne “ce qui se passe dans l’asso”
* Publications/activités par secteur (approuvées par président)
* Commentaires + avis ⭐ (si autorisé)
* Chat général association

### C) Salon privé bureau (bureau actifs)

* Fil interne (toutes activités de bureau, même non validées pour public)
* Discussions confidentielles
* Chat bureau
* Avis/commentaires entre bureau

### D) Dashboard par poste

* Chaque poste a son espace de gestion (CRUD sur ses activités)

---

# 2) Gouvernance : Mandat, Postes, Affectations

## 2.1 Mandat

### Entité : `Mandat`

* id
* titre (ex : Mandat 2025–2027)
* date_debut
* date_fin
* statut (ACTIF, EXPIRE, ARCHIVE)
* document_pv (URL/fichier)
* createdAt

**Règle** : un seul mandat ACTIF à la fois.

---

## 2.2 Poste (fonction bureau)

### Entité : `Poste`

* id
* nom
* description
* est_bureau (bool) → si true = accès salon privé
* est_actif (bool)
* createdBy (super_admin)
* createdAt

**Règle** : le SUPER_ADMIN peut ajouter un poste à tout moment.

---

## 2.3 Affectation à un poste (par mandat)

### Entité : `AffectationPoste`

* id
* mandat_id
* poste_id
* membre_id
* date_debut
* date_fin
* statut (ACTIF, INACTIF, ARCHIVE)
* raison_inactivation (nullable mais obligatoire si INACTIF)
* createdBy (super_admin)

### Effets automatiques

* si ACTIF → accès dashboard du poste + salon bureau (si poste.est_bureau)
* si INACTIF → perte accès bureau, contenus marqués ARCHIVE, raison visible

---

# 3) Comptes : création, activation, interdictions

## 3.1 Entité : `User`

* id
* email
* mot_de_passe_hash
* role_systeme (SUPER_ADMIN, ADMIN, MEMBER)
* is_active (bool)
* last_login
* createdAt

## 3.2 Entité : `Member`

* id
* user_id (1–1)
* prénom, nom
* téléphone
* ville, pays
* photo
* bio
* date_adhesion
* statut_membre (ACTIF, SUSPENDU, RADIE)
* createdAt

### Règles clés

* **Visiteur** : ne peut pas créer `User`
* **SUPER_ADMIN** : crée `User` + `Member`
* **Président (ADMIN)** : traite des demandes mais ne crée pas de compte (si tu veux strict)

---

# 4) Bureau actuel visible sur le site public

## 4.1 Logique d’affichage

La page “Bureau actuel” affiche :

* toutes les `AffectationPoste` où :

  * mandat = ACTIF
  * statut = ACTIF
  * poste.est_bureau = true

### Ce que le visiteur voit

* Poste, nom, photo (optionnel), mini-bio, période de mandat

### Ce qui se passe si une affectation devient INACTIF

* Disparait du “Bureau actuel”
* Apparait dans “Archives du bureau”
* Mention : “Inactif — raison : … — date”

---

# 5) Adhésion / Partenariat / Contact / Don (visiteur)

## 5.1 Adhérer

### Entité : `DemandeAdhesion`

* id
* prénom, nom
* email, téléphone
* ville/pays
* message motivation
* statut (EN_ATTENTE, APPROUVEE, REFUSEE)
* processedBy (admin/president)
* processedAt

**Ce que voit qui :**

* Visiteur : confirmation “demande envoyée”
* Président/Admin : liste + détail + décision
* SUPER_ADMIN : création compte si APPROUVEE

**Interdiction :**

* Si quelqu’un non autorisé tente `/register` → page 404 ou redirection “contact”.

---

## 5.2 Devenir partenaire

### Entité : `DemandePartenariat`

* id
* organisation
* contact_nom
* email, téléphone
* type_partenariat
* message
* statut (EN_ATTENTE, APPROUVEE, REFUSEE)
* processedBy / processedAt

Si approuvée → création `Partner`.

### Entité : `Partner`

* id
* nom
* logo
* description
* site_url
* type (Institution, Entreprise, Association…)
* statut (ACTIF, INACTIF)
* visibilite_site (bool)

---

## 5.3 Contact administration

### Entité : `MessageContact`

* id
* nom
* email
* sujet
* message
* destinataire_poste_id (optionnel)
* statut (NOUVEAU, EN_COURS, TRAITE, ARCHIVE)
* assignedTo (poste ou user)
* createdAt

**Qui voit :**

* Président/Admin/SuperAdmin
* Si assigné à un poste → le responsable concerné peut répondre (dans l’admin)

---

## 5.4 Faire un don (sans paiement en ligne)

Tu veux : **afficher uniquement infos et contact**.

### Page Don (public)

Contenu recommandé :

* Texte : “Soutenir l’AGCM”
* 3 options :

  1. Don financier
  2. Don matériel
  3. Soutien/logistique
* Bloc “Comment faire ?”

  * Téléphone
  * Email
  * Adresse (si besoin)
  * Horaires / disponibilité
* Bouton “Je souhaite faire un don” → ouvre un formulaire

### Formulaire “Intention de don”

### Entité : `DonationIntent`

* id
* type (FINANCIER, MATERIEL, AUTRE)
* montant_estime (optionnel)
* description
* nom (optionnel)
* email/téléphone
* statut (NOUVEAU, CONTACTE, CONFIRME, CLASSE_SANS_SUITE)
* createdAt
* handledBy (tresorier/directeur_finances)

**Qui voit :**

* Trésorier + Directeur finances + Président + SuperAdmin

---

# 6) Projets / Subventions / Aides

## 6.1 Projet

### Entité : `Projet`

* id, titre, slug
* objectif
* description
* actions (texte ou liste)
* statut (BROUILLON, EN_COURS, TERMINE, SUSPENDU, ANNULE)
* visibilite_site (bool)
* responsable_poste_id
* mandat_id
* createdBy (poste ou user)
* createdAt

### Média projet

### Entité : `ProjetMedia`

* id
* projet_id
* type (IMAGE, DOCUMENT)
* url
* ordre

### Partenaires liés au projet

### Entité : `ProjetPartner`

* projet_id
* partner_id

**Affichage public d’une page projet :**

* Objectifs
* Actions
* Photos
* Partenaires
* **Statut** (remplace “résultats”)

---

## 6.2 Subventions / Aides

### Entité : `Subvention`

* id
* projet_id (optionnel)
* organisme
* type (SUBVENTION, AIDE, DON)
* montant
* statut (DEMANDEE, ACCORDEE, REFUSEE, VERSEE)
* dates (demande/decision/versement)
* documents (convention, reçu…)
* responsable_financier_poste_id
* createdAt

**Visibilité :**

* Public : éventuellement un résumé “partenaires & soutiens” (si activé)
* Interne : détails visibles finances + président + super admin

---

# 7) Publications & Partages : APPROBATION PRESIDENT obligatoire

C’est le point central que tu demandes.

## 7.1 Types de contenus

* **Publication interne** (activité du bureau)
* **Actualité public** (site)
* **Partage externe** (lien)

On unifie avec un système de “contenu” + workflow.

---

## 7.2 Entité : `Content`

Contenu unique qui peut aller :

* salon privé bureau
* salon public membres
* site public

Champs :

* id
* type (ACTIVITE, ACTUALITE, PARTAGE, ANNONCE)
* titre
* contenu (texte riche)
* lien_externe (si PARTAGE)
* image_principale
* tags
* auteur_poste_id
* mandat_id
* visibilite_cible (PRIVE_BUREAU / PUBLIC_MEMBRES / PUBLIC_SITE)
* statut_workflow :

  * BROUILLON
  * SOUMIS_APPROBATION
  * APPROUVE
  * REJETE
  * PUBLIE
  * ARCHIVE
* approvedBy (président user_id)
* approvedAt
* rejectionReason (optionnel)

### Règle d’or

* Si `visibilite_cible` = PUBLIC_MEMBRES ou PUBLIC_SITE
  ⇒ **obligation** : statut_workflow doit passer par **APPROUVE par le Président** avant publication.

---

## 7.3 Workflow pas à pas (très clair)

### Cas A : un membre du bureau crée un contenu

1. Il crée `Content` en BROUILLON
2. Il clique “Soumettre au Président”
3. statut = SOUMIS_APPROBATION

**Qui voit à ce moment :**

* Auteur : voit
* Bureau privé : voit (si contenu destiné bureau ou en validation)
* Président : voit dans “boîte d’approbation”
* Membres + visiteurs : ne voient pas

---

### Cas B : Président approuve

4. Président clique “Approuver”
5. statut = APPROUVE
6. Système publie automatiquement :

* si cible = PUBLIC_MEMBRES → visible salon public membres
* si cible = PUBLIC_SITE → visible sur site public
* si cible = PRIVE_BUREAU → pas besoin d’approbation (option), mais tu peux l’imposer aussi si tu veux

**Ce que les autres voient :**

* Bureau : notification “Contenu approuvé”
* Membres : voient le contenu + peuvent commenter/étoiles (si autorisé)
* Visiteurs : voient le contenu sur le site (si PUBLIC_SITE)

---

### Cas C : Président rejette

4. Président clique “Rejeter” + raison obligatoire
5. statut = REJETE

**Effets :**

* Auteur voit la raison, peut modifier et resoumettre
* Bureau privé peut voir le rejet (option)
* Public ne voit rien

---

# 8) Salons + avis étoiles + commentaires

## 8.1 Entité : `Salon`

* id
* type (BUREAU_PRIVE, PUBLIC_MEMBRES)
* mandat_id (obligatoire pour bureau privé)
* createdAt

## 8.2 Entité : `Comment`

* id
* content_id
* auteur_user_id
* texte
* createdAt
* is_deleted (soft delete par admin)

## 8.3 Entité : `Rating`

* id
* content_id
* auteur_user_id
* note (1..5)
* createdAt

**Règles de modération :**

* Président/Admin peut masquer commentaire
* SuperAdmin peut supprimer définitivement
* Membre simple : ne peut supprimer que ses propres commentaires (option)

---

# 9) Evénements (public & interne) + galeries

## 9.1 Entité : `Event`

* id, titre, slug, description
* date_debut, date_fin
* lieu
* statut (PASSE, EN_COURS, A_VENIR)
* affiche_site (bool)
* createdBy_poste_id
* mandat_id

## 9.2 Entité : `EventMedia`

* event_id
* image_principale (bool)
* url
* ordre

**Affichage public :**

* tri en 3 sections : Passés / En cours / À venir
* carte + image principale + galerie sur détail

---

# 10) Archivage : changement de poste / inactivation

## 10.1 Quand un membre du bureau devient INACTIF

Action : SUPER_ADMIN uniquement

* set affectation.statut = INACTIF
* raison obligatoire

**Effets :**

* Contenus de ce poste dans ce mandat :

  * passent en ARCHIVE (badge)
* l’utilisateur perd accès salon privé bureau
* reste membre simple si son compte membre est actif

**Visibilité :**

* Bureau : voit “X inactif + raison”
* Membres : peuvent voir “X n’est plus actif : raison …” (page bureau / salon public)
* Visiteurs : voient uniquement la mise à jour du bureau actuel (pas forcément la raison, à toi de choisir)

---

# 11) Permissions détaillées (qui peut quoi)

## 11.1 SUPER_ADMIN

* tout : comptes, postes, mandats, contenus, suppression, logs, votes détaillés

## 11.2 PRESIDENT (ADMIN)

* approuver / rejeter contenus destinés salon public / site public
* gérer demandes (adhésion/partenariat/contact)
* créer contenus (comme auteur)
* modérer commentaires (masquer)
* voir toutes activités bureau (lecture)

## 11.3 MEMBRE DU BUREAU (poste actif)

* CRUD sur ses contenus & activités
* soumettre à validation président
* voir et commenter les activités des autres au salon privé bureau
* accéder au chat bureau

## 11.4 MEMBRE SIMPLE

* voir salon public
* commenter / noter (si autorisé)
* profil

## 11.5 VISITEUR

* lire contenu public
* envoyer demandes (adhésion, partenariat, don-intention, contact)
* ne peut pas accéder aux espaces privés

---

# 12) Relations entre entités (schéma logique)

* `User` 1—1 `Member`
* `Mandat` 1—N `AffectationPoste`
* `Poste` 1—N `AffectationPoste`
* `Member` 1—N `AffectationPoste`
* `Mandat` 1—N `Content`
* `Poste` 1—N `Content` (auteur)
* `Content` 1—N `Comment`
* `Content` 1—N `Rating`
* `Projet` N—N `Partner` via `ProjetPartner`
* `Projet` 1—N `ProjetMedia`
* `Event` 1—N `EventMedia`
* `Projet` 1—N `Subvention` (optionnel)
* `DemandeAdhesion` (standalone)
* `DemandePartenariat` (standalone → Partner)
* `DonationIntent` (standalone)
* `MessageContact` (standalone)

---

# 13) Sécurité / anti-actions non autorisées

* Pas de route `/register`
* Middleware :

  * si user non connecté → blocage pages membres
  * si pas affecté poste actif → blocage salon bureau
  * si pas ADMIN/PRESIDENT → blocage “Approvals”
  * si pas SUPER_ADMIN → blocage gestion postes/mandats/comptes
* Tentatives non autorisées :

  * loggées dans `AuditLog`
  * réponse 403 + redirection

---

# 14) Audit Log (obligatoire)

### Entité : `AuditLog`

* id
* user_id
* action (CREATE/UPDATE/DELETE/APPROVE/REJECT/ASSIGN/INACTIVATE)
* entity_type
* entity_id
* before_json
* after_json
* createdAt











# SUITE

1) Réponse courte et claire

👉 OUI, Next.js + PostgreSQL est un très bon stack pour ce projet, robuste, scalable et professionnel.
👉 Ce stack est mieux que la majorité des alternatives pour :

gouvernance associative

rôles complexes

workflows de validation

historique / archivage / mandats

contenu public + espaces privés

2) Pourquoi Next.js est très adapté à TON projet

Ton projet n’est pas un simple site vitrine.
C’est une plateforme de gouvernance + collaboration + publication.

2.1 Ce que ton projet exige techniquement

Ton cahier de charges implique :

plusieurs espaces utilisateurs (visiteur / membre / bureau / président / super admin)

permissions fines

workflows d’approbation

salons publics / privés

historique par mandat

contenu public SEO

admin puissant

évolutivité (phase 2, 3, 4)

👉 Next.js coche toutes les cases.

2.2 Avantages concrets de Next.js pour AGCM
✅ Site public + SEO

Pages publiques (projets, événements, bureau actuel)

Rendu serveur (SSR) ou statique (SSG)

Très bon référencement Google

👉 Idéal pour visibilité de l’association.

✅ Espaces privés sécurisés

App Router + Middleware

Protection des routes par rôle

Navigation conditionnelle selon poste / mandat

👉 Parfait pour :

salon bureau

dashboards par fonction

espace président / admin

✅ Workflows complexes

Ton système :

création → soumission → approbation → publication → archivage

👉 Next.js + API routes permet :

logique métier côté serveur

validation sécurisée

contrôle strict des actions

✅ Scalabilité

Aujourd’hui :

AGCM
Demain :

autres associations

plus de membres

plus de projets

plus de données

Next.js peut gérer :

100 membres

10 000 membres

multi-mandats

multi-années

✅ Écosystème énorme

Auth (NextAuth)

Emails

Upload fichiers

Temps réel (chat)

Tests

Déploiement simple

3) Pourquoi PostgreSQL est le BON choix

Ton modèle de données est :

riche

relationnel

structuré

historique

sensible (finances, mandats, votes)

👉 PostgreSQL est parfait pour ça.

3.1 Ce que ton projet demande côté base de données

Tu as :

User ↔ Member (1–1)

Mandat ↔ AffectationPoste

Poste ↔ Content

Content ↔ Approval

Projet ↔ Partenaires

Votes ↔ Mandats

Archivage

AuditLog

👉 Ça demande :

relations fortes

contraintes

transactions

intégrité référentielle

👉 PostgreSQL excelle là-dessus.

3.2 Avantages clés de PostgreSQL
✅ Intégrité des données

clés étrangères

contraintes

transactions ACID

Très important pour :

votes

mandats

finances

suppressions limitées

✅ Requêtes complexes

Exemples réels de ton projet :

“tous les contenus approuvés du mandat actif”

“tous les anciens responsables + raisons”

“projets visibles par visiteurs”

“activité par poste et par mandat”

👉 PostgreSQL est très performant là-dessus.

✅ Évolutivité

milliers → millions de lignes

index avancés

JSONB (pour logs, historiques)

4) Comparaison rapide avec d’autres stacks
4.1 Next.js + PostgreSQL vs Laravel + MySQL

Laravel est bon, mais :

plus lent côté rendu public

moins fluide pour SPA moderne

moins SEO-friendly par défaut

👉 Next.js gagne pour visibilité & UX.

4.2 Next.js + MongoDB ❌ (pas recommandé ici)

MongoDB est mauvais choix pour ton projet car :

trop de relations

logique mandat/poste compliquée

risques d’incohérences

votes & finances = dangereux en NoSQL

👉 PostgreSQL est clairement supérieur ici.

4.3 CMS (WordPress, Strapi seul) ❌

permissions trop limitées

workflows difficiles

archivage & mandats compliqués

sécurité plus fragile

5) Stack RECOMMANDÉE (version pro)

👉 Voilà ce que je recommande sans hésitation :

Frontend & Backend

Next.js (App Router)

TypeScript

Auth & sécurité

NextAuth (JWT + Credentials)

Middleware Next.js

RBAC (roles + postes)

Base de données

PostgreSQL

Prisma ORM

Temps réel (chat)

Pusher / Ably / Socket.io (phase 2)

Emails

Resend / SMTP

Fichiers

Phase 1 : stockage local

Phase 2 : Vercel Blob / S3

Déploiement

Vercel (frontend + API)

PostgreSQL managé (Neon / Supabase)







#1️⃣ MODÈLE DE DONNÉES COMPLET (PRISMA – LOGIQUE MÉTIER)

⚠️ Je ne mets pas ici le code Prisma brut ligne par ligne pour ne pas noyer,
mais le modèle conceptuel exhaustif, que ton dev pourra traduire à 100 % en Prisma sans ambiguïté.

1.1 Authentification & membres
User

id

email (unique)

passwordHash

roleSysteme (SUPER_ADMIN | ADMIN | MEMBER)

isActive

createdAt

lastLogin

Member

id

userId (1–1 User)

prenom

nom

telephone

ville

pays

photoUrl

bio

statutMembre (ACTIF | SUSPENDU | RADIE)

dateAdhesion

👉 Un User sans Member n’existe pas
👉 Un Member peut exister sans poste de bureau

1.2 Gouvernance : mandats & postes
Mandat

id

titre (ex: Mandat 2025–2027)

dateDebut

dateFin

statut (ACTIF | EXPIRE | ARCHIVE)

pvDocumentUrl

Poste

id

nom

description

estBureau (bool)

estActif (bool)

createdAt

AffectationPoste

id

mandatId

posteId

memberId

statut (ACTIF | INACTIF | ARCHIVE)

dateDebut

dateFin

raisonInactivation

createdBy (super admin)

👉 Clé du système
Tout ce qui suit est lié à AffectationPoste + Mandat

1.3 Contenus & publications (avec validation président)
Content

id

type (ACTIVITE | ACTUALITE | PARTAGE | ANNONCE)

titre

contenu (rich text)

lienExterne (nullable)

imagePrincipale

visibiliteCible (PRIVE_BUREAU | PUBLIC_MEMBRES | PUBLIC_SITE)

statutWorkflow (BROUILLON | SOUMIS | APPROUVE | REJETE | PUBLIE | ARCHIVE)

auteurPosteId

mandatId

approvedBy (userId président)

approvedAt

rejectionReason

createdAt

Comment

id

contentId

auteurUserId

texte

isDeleted

createdAt

Rating

id

contentId

auteurUserId

note (1–5)

createdAt

1.4 Projets, aides & partenaires
Projet

id

titre

slug

objectif

description

actions

statut (BROUILLON | EN_COURS | TERMINE | SUSPENDU | ANNULE)

visibiliteSite

responsablePosteId

mandatId

createdAt

ProjetMedia

id

projetId

type (IMAGE | DOCUMENT)

url

ordre

Partner

id

nom

logo

description

siteUrl

type

statut

visibiliteSite

ProjetPartner

projetId

partnerId

Subvention

id

projetId (nullable)

organisme

type (SUBVENTION | AIDE | DON)

montant

statut (DEMANDEE | ACCORDEE | REFUSEE | VERSEE)

documentsUrl

responsableFinancierPosteId

1.5 Événements
Event

id

titre

slug

description

dateDebut

dateFin

lieu

statut (PASSE | EN_COURS | A_VENIR)

afficheSite

createdByPosteId

mandatId

EventMedia

id

eventId

url

isPrincipale

ordre

1.6 Formulaires visiteurs
DemandeAdhesion

id

prenom

nom

email

telephone

message

statut

processedBy

processedAt

DemandePartenariat

id

organisation

contactNom

email

message

statut

DonationIntent

id

type

montantEstime

description

contact

statut

handledBy

MessageContact

id

nom

email

sujet

message

statut

assignedToPosteId

1.7 Sécurité & audit
AuditLog

id

userId

action

entityType

entityId

beforeData

afterData

createdAt

#2️⃣ MATRICE DES PERMISSIONS (CLAIRE ET STRICTE)
Action	Visiteur	Membre	Bureau	Président (Admin)	Super Admin
Voir site public	✅	✅	✅	✅	✅
Créer compte	❌	❌	❌	❌	✅
Créer contenu	❌	❌	✅	✅	✅
Publier site	❌	❌	❌	✅ (approbation)	✅
Approuver contenu	❌	❌	❌	✅	✅
Supprimer contenu archivé	❌	❌	❌	❌	✅
Accéder salon bureau	❌	❌	✅	✅	✅
Voir votes détaillés	❌	❌	❌	❌	✅
Gérer postes & mandats	❌	❌	❌	❌	✅
#3️⃣ LISTE DES PAGES & ROUTES (NEXT.JS)
3.1 Site public

/

/bureau-actuel

/projets

/projets/[slug]

/evenements

/actualites

/partenaires

/adhesion

/partenariat

/don

/contact

3.2 Espace membre

/app

/app/salon-public

/app/profil

/app/messages

3.3 Espace bureau

/bureau

/bureau/salon-prive

/bureau/activites

/bureau/projets

/bureau/evenements

3.4 Président / Admin

/admin/approbations

/admin/demandes

/admin/contacts

/admin/statistiques

3.5 Super Admin

/super-admin/users

/super-admin/postes

/super-admin/mandats

/super-admin/affectations

/super-admin/audit-logs











# 4️⃣ WORKFLOW UI (PAS À PAS – TRÈS CONCRET)
4.1 Publication standard (bureau → public)

Responsable crée contenu → BROUILLON

Clique “Soumettre au président”

Président reçoit notification

Président :

✅ Approuve → visible salon public / site

❌ Rejette → raison obligatoire

Commentaires & étoiles activés selon réglage

4.2 Changement de poste

Super Admin met affectation → INACTIF

Raison affichée

Contenus → ARCHIVÉS

Accès salon bureau retiré

Membre reste actif côté public

4.3 Tentative non autorisée

Middleware bloque

403 + redirection

Log dans AuditLog                                               



#5️⃣ Schéma Prisma complet (code)

Fichier : prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

//
// ENUMS
//
enum RoleSysteme {
  SUPER_ADMIN
  ADMIN
  MEMBER
}

enum StatutMembre {
  ACTIF
  SUSPENDU
  RADIE
}

enum StatutMandat {
  ACTIF
  EXPIRE
  ARCHIVE
}

enum StatutAffectation {
  ACTIF
  INACTIF
  ARCHIVE
}

enum ContentType {
  ACTIVITE
  ACTUALITE
  PARTAGE
  ANNONCE
}

enum VisibiliteCible {
  PRIVE_BUREAU
  PUBLIC_MEMBRES
  PUBLIC_SITE
}

enum StatutWorkflow {
  BROUILLON
  SOUMIS
  APPROUVE
  REJETE
  PUBLIE
  ARCHIVE
}

enum ProjetStatut {
  BROUILLON
  EN_COURS
  TERMINE
  SUSPENDU
  ANNULE
}

enum ProjetMediaType {
  IMAGE
  DOCUMENT
}

enum EventStatut {
  PASSE
  EN_COURS
  A_VENIR
}

enum DemandeStatut {
  EN_ATTENTE
  APPROUVEE
  REFUSEE
}

enum DonationIntentType {
  FINANCIER
  MATERIEL
  AUTRE
}

enum DonationIntentStatut {
  NOUVEAU
  CONTACTE
  CONFIRME
  CLASSE_SANS_SUITE
}

enum ContactStatut {
  NOUVEAU
  EN_COURS
  TRAITE
  ARCHIVE
}

enum SubventionType {
  SUBVENTION
  AIDE
  DON
}

enum SubventionStatut {
  DEMANDEE
  ACCORDEE
  REFUSEE
  VERSEE
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  APPROVE
  REJECT
  SUBMIT
  ASSIGN
  INACTIVATE
  ARCHIVE
}

//
// CORE: Users & Members
//
model User {
  id           String      @id @default(cuid())
  email        String      @unique
  passwordHash String?
  roleSysteme  RoleSysteme @default(MEMBER)
  isActive     Boolean     @default(true)
  lastLogin    DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  member       Member?

  // approvals
  approvedContents Content[] @relation("ContentApprovedBy")

  // comments/ratings/messages
  comments     Comment[]
  ratings      Rating[]
  bureauMessages BureauMessage[]

  // audit logs
  auditLogs    AuditLog[]
}

model Member {
  id           String       @id @default(cuid())
  userId       String       @unique
  prenom       String
  nom          String
  telephone    String?
  ville        String?
  pays         String?
  photoUrl     String?
  bio          String?
  statutMembre StatutMembre @default(ACTIF)
  dateAdhesion DateTime     @default(now())
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  affectations AffectationPoste[]

  @@index([nom, prenom])
}

//
// Gouvernance: Mandat, Poste, Affectation
//
model Mandat {
  id           String       @id @default(cuid())
  titre        String
  dateDebut    DateTime
  dateFin      DateTime
  statut       StatutMandat @default(ACTIF)
  pvDocumentUrl String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  affectations AffectationPoste[]
  contents     Content[]
  projets      Projet[]
  events       Event[]

  @@index([statut])
}

model Poste {
  id          String   @id @default(cuid())
  nom         String   @unique
  description String?
  estBureau   Boolean  @default(true)
  estActif    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  affectations AffectationPoste[]
  authoredContents Content[]
  projetsResponsable Projet[] @relation("ProjetResponsablePoste")
  eventsCreated Event[] @relation("EventCreatedByPoste")

  // financier responsibility
  subventionsFinancier Subvention[] @relation("SubventionFinancierPoste")
}

model AffectationPoste {
  id                String          @id @default(cuid())
  mandatId           String
  posteId            String
  memberId           String
  statut             StatutAffectation @default(ACTIF)
  dateDebut          DateTime
  dateFin            DateTime?
  raisonInactivation String?
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  mandat   Mandat @relation(fields: [mandatId], references: [id], onDelete: Restrict)
  poste    Poste  @relation(fields: [posteId], references: [id], onDelete: Restrict)
  member   Member @relation(fields: [memberId], references: [id], onDelete: Restrict)

  @@index([mandatId, statut])
  @@index([posteId, statut])
  @@unique([mandatId, posteId, memberId])
}

//
// CONTENT: publications/activités/partages + approval President
//
model Content {
  id              String         @id @default(cuid())
  type            ContentType
  titre           String
  contenu         String?
  lienExterne     String?
  imagePrincipale String?
  tags            String[]       @default([])
  visibiliteCible VisibiliteCible
  statutWorkflow  StatutWorkflow @default(BROUILLON)

  auteurPosteId   String
  mandatId        String

  // approval by president (User)
  approvedById    String?
  approvedAt      DateTime?
  rejectionReason String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  auteurPoste Poste  @relation(fields: [auteurPosteId], references: [id], onDelete: Restrict)
  mandat      Mandat @relation(fields: [mandatId], references: [id], onDelete: Restrict)

  approvedBy  User?  @relation("ContentApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull)

  comments    Comment[]
  ratings     Rating[]

  @@index([mandatId, visibiliteCible, statutWorkflow])
  @@index([type, statutWorkflow])
}

model Comment {
  id          String   @id @default(cuid())
  contentId   String
  auteurUserId String
  texte       String
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  content Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  auteur  User    @relation(fields: [auteurUserId], references: [id], onDelete: Restrict)

  @@index([contentId, createdAt])
}

model Rating {
  id          String   @id @default(cuid())
  contentId   String
  auteurUserId String
  note        Int
  createdAt   DateTime @default(now())

  content Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  auteur  User    @relation(fields: [auteurUserId], references: [id], onDelete: Restrict)

  @@unique([contentId, auteurUserId])
  @@index([contentId])
}

//
// Projets / Partenaires / Subventions
//
model Projet {
  id              String       @id @default(cuid())
  titre           String
  slug            String       @unique
  objectif        String
  description     String
  actions         String?
  statut          ProjetStatut @default(BROUILLON)
  visibiliteSite  Boolean      @default(false)

  responsablePosteId String
  mandatId        String

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  responsablePoste Poste  @relation("ProjetResponsablePoste", fields: [responsablePosteId], references: [id], onDelete: Restrict)
  mandat          Mandat @relation(fields: [mandatId], references: [id], onDelete: Restrict)

  medias          ProjetMedia[]
  partenaires     ProjetPartner[]
  subventions     Subvention[]

  @@index([mandatId, statut, visibiliteSite])
}

model ProjetMedia {
  id        String         @id @default(cuid())
  projetId  String
  type      ProjetMediaType
  url       String
  ordre     Int            @default(0)
  createdAt DateTime       @default(now())

  projet Projet @relation(fields: [projetId], references: [id], onDelete: Cascade)

  @@index([projetId, ordre])
}

model Partner {
  id            String   @id @default(cuid())
  nom           String
  logo          String?
  description   String?
  siteUrl       String?
  type          String?
  statut        String   @default("ACTIF")
  visibiliteSite Boolean @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  projets ProjetPartner[]

  @@index([visibiliteSite])
}

model ProjetPartner {
  projetId  String
  partnerId String
  createdAt DateTime @default(now())

  projet  Projet  @relation(fields: [projetId], references: [id], onDelete: Cascade)
  partner Partner @relation(fields: [partnerId], references: [id], onDelete: Cascade)

  @@id([projetId, partnerId])
}

model Subvention {
  id          String          @id @default(cuid())
  projetId    String?
  organisme   String
  type        SubventionType
  montant     Decimal         @db.Decimal(18, 2)
  statut      SubventionStatut @default(DEMANDEE)
  documentsUrl String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  responsableFinancierPosteId String

  projet Projet? @relation(fields: [projetId], references: [id], onDelete: SetNull)
  responsableFinancierPoste Poste @relation("SubventionFinancierPoste", fields: [responsableFinancierPosteId], references: [id], onDelete: Restrict)

  @@index([statut, type])
}

//
// Evénements + médias
//
model Event {
  id          String      @id @default(cuid())
  titre       String
  slug        String      @unique
  description String
  dateDebut   DateTime
  dateFin     DateTime?
  lieu        String?
  statut      EventStatut @default(A_VENIR)
  afficheSite Boolean     @default(false)

  createdByPosteId String
  mandatId     String

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdByPoste Poste  @relation("EventCreatedByPoste", fields: [createdByPosteId], references: [id], onDelete: Restrict)
  mandat      Mandat @relation(fields: [mandatId], references: [id], onDelete: Restrict)

  medias      EventMedia[]

  @@index([afficheSite, statut, dateDebut])
}

model EventMedia {
  id         String   @id @default(cuid())
  eventId    String
  url        String
  isPrincipale Boolean @default(false)
  ordre      Int      @default(0)
  createdAt  DateTime @default(now())

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId, ordre])
}

//
// Formulaires visiteurs
//
model DemandeAdhesion {
  id          String       @id @default(cuid())
  prenom      String
  nom         String
  email       String
  telephone   String?
  ville       String?
  pays        String?
  message     String?
  statut      DemandeStatut @default(EN_ATTENTE)

  processedById String?
  processedAt   DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  processedBy User? @relation(fields: [processedById], references: [id], onDelete: SetNull)

  @@index([statut, createdAt])
}

model DemandePartenariat {
  id           String        @id @default(cuid())
  organisation String
  contactNom   String?
  email        String
  telephone    String?
  typePartenariat String?
  message      String?
  statut       DemandeStatut @default(EN_ATTENTE)

  processedById String?
  processedAt   DateTime?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  processedBy  User? @relation(fields: [processedById], references: [id], onDelete: SetNull)

  @@index([statut, createdAt])
}

model DonationIntent {
  id           String              @id @default(cuid())
  type         DonationIntentType
  montantEstime Decimal?           @db.Decimal(18, 2)
  description  String?
  nom          String?
  email        String?
  telephone    String?
  statut       DonationIntentStatut @default(NOUVEAU)

  handledByPosteId String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  handledByPoste Poste? @relation(fields: [handledByPosteId], references: [id], onDelete: SetNull)

  @@index([statut, createdAt])
}

model MessageContact {
  id           String       @id @default(cuid())
  nom          String
  email        String
  sujet        String
  message      String
  statut       ContactStatut @default(NOUVEAU)

  destinatairePosteId String?
  assignedToPosteId   String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  destinatairePoste Poste? @relation("DestinatairePoste", fields: [destinatairePosteId], references: [id], onDelete: SetNull)
  assignedToPoste   Poste? @relation("AssignedToPoste", fields: [assignedToPosteId], references: [id], onDelete: SetNull)

  @@index([statut, createdAt])
}

//
// Chat bureau / association (simple, extensible)
//
model BureauMessage {
  id         String   @id @default(cuid())
  scope      VisibiliteCible // PRIVE_BUREAU ou PUBLIC_MEMBRES (on n'utilise pas PUBLIC_SITE)
  auteurUserId String
  mandatId   String?
  texte      String
  createdAt  DateTime @default(now())

  auteur User @relation(fields: [auteurUserId], references: [id], onDelete: Restrict)
  mandat Mandat? @relation(fields: [mandatId], references: [id], onDelete: SetNull)

  @@index([scope, createdAt])
}

//
// Audit
//
model AuditLog {
  id         String      @id @default(cuid())
  userId     String
  action     AuditAction
  entityType String
  entityId   String
  beforeData Json?
  afterData  Json?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([entityType, entityId, createdAt])
}

Notes importantes (implémentation)

approvedById = président (user) qui valide.

Les contenus PUBLIC_MEMBRES / PUBLIC_SITE ne doivent jamais passer en PUBLIE sans APPROUVE.

BureauMessage.scope permet 2 chats :

PRIVE_BUREAU (bureau actif)

PUBLIC_MEMBRES (tous membres)

Partner.statut est en string pour rester flexible, tu peux le convertir en enum si tu veux.

#6️⃣ API Routes (CRUD + permissions) — Next.js App Router

Convention : routes sous src/app/api/.../route.ts
Auth : getServerSession() + middleware RBAC
Chaque endpoint a : Qui peut appeler + Ce que ça fait + Ce que les autres voient

Helpers à créer (obligatoires)

requireAuth() : session obligatoire

requireRole(RoleSysteme...)

getMandatActif()

getAffectationActive(userId, mandatId) → pour savoir si bureau actif et quel poste

canSubmitContent(auteurPosteId, userId) (poste actif obligatoire)

canApprove(session) (ADMIN ou SUPER_ADMIN, et ADMIN doit être président)

6.1 Public (visiteurs) — sans login
Adhésion
POST /api/public/adhesion

Visiteur envoie une DemandeAdhesion

Effet : notification email (admin/president)

Réponse : “reçu”

Partenariat
POST /api/public/partenariat

Visiteur envoie une DemandePartenariat

Contact
POST /api/public/contact

Visiteur envoie MessageContact

Don (intention)
POST /api/public/don

Visiteur envoie DonationIntent (pas de paiement)

Assignation auto (option) : Trésorier / Directeur finances

6.2 Super Admin — comptes / mandats / postes / affectations
Users
GET /api/super-admin/users
POST /api/super-admin/users
PATCH /api/super-admin/users/:id
DELETE /api/super-admin/users/:id

Autorisé : SUPER_ADMIN

Effets visibles :

Si user désactivé (isActive=false) → l’utilisateur ne peut plus se connecter.

Mandats
GET /api/super-admin/mandats
POST /api/super-admin/mandats
PATCH /api/super-admin/mandats/:id

SUPER_ADMIN

Règle : un seul mandat ACTIF

Si on active un mandat → les autres passent EXPIRE ou ARCHIVE

Postes
GET /api/super-admin/postes
POST /api/super-admin/postes
PATCH /api/super-admin/postes/:id
DELETE /api/super-admin/postes/:id (optionnel si tu veux interdire)

SUPER_ADMIN

Quand un poste est créé :

Il devient disponible pour affectation

Les dashboards s’affichent dynamiquement selon la table Poste

Affectations
GET /api/super-admin/affectations?mandatId=...
POST /api/super-admin/affectations

Crée une affectation poste à un membre sur un mandat

PATCH /api/super-admin/affectations/:id/inactiver

Body : { raisonInactivation: string, dateFin?: Date }

Met statut INACTIF

Archive automatiquement les contenus liés (voir endpoint ci-dessous)

POST /api/super-admin/affectations/:id/archiver-contenus

Passe les Content de auteurPosteId + mandatId en ARCHIVE

Effets visibles :

Bureau & membres : voient l’état “inactif” + raison (affichage UI)

Site public : “Bureau actuel” mis à jour automatiquement

6.3 Admin/Président — approbations & modération
Boîte d’approbation (président)
GET /api/admin/approbations?status=SOUMIS

ADMIN (président) ou SUPER_ADMIN

PATCH /api/admin/approbations/:contentId/approve

Set statutWorkflow=APPROUVE, approvedById, approvedAt

Puis publication : soit tu mets PUBLIE direct, soit tu gardes APPROUVE et un job “publie” (je te conseille direct PUBLIE)

PATCH /api/admin/approbations/:contentId/reject

Body : { rejectionReason: string }

Set REJETE

Ce que les autres voient :

Auteur reçoit une notif (dans app) + email optionnel

Le public voit seulement après PUBLIE

Demand es (adhésion/partenariat/don/contact)
GET /api/admin/demandes/adhesions
PATCH /api/admin/demandes/adhesions/:id

Admin peut APPROUVEE/REFUSEE

Si APPROUVEE → SUPER_ADMIN crée le compte

Même logique pour :

/api/admin/demandes/partenariats

/api/admin/demandes/dons

/api/admin/contacts

6.4 Bureau — contenus / projets / événements
Contenus
POST /api/bureau/contents

Crée un Content en BROUILLON

Vérifie : user a une affectation ACTIF sur mandat actif

PATCH /api/bureau/contents/:id

Modifie tant que pas ARCHIVE

Si le contenu est déjà SOUMIS/APPROUVE/PUBLIE, tu limites les champs modifiables

POST /api/bureau/contents/:id/submit

Passe statutWorkflow=SOUMIS

Obligatoire si visibilite ≠ PRIVE_BUREAU

Visibilité :

Salon privé bureau : tous les membres bureau voient (y compris SOUMIS)

Salon public / site : uniquement après approbation + publication

Projets
POST /api/bureau/projets
PATCH /api/bureau/projets/:id
POST /api/bureau/projets/:id/media
POST /api/bureau/projets/:id/submit-site

Pareil que content si tu veux forcer validation président avant visibilité site :

option 1 : projets aussi passent par Content d’approbation

option 2 : champ visibiliteSite nécessite approbation président via endpoint
Je recommande option 2 :

PATCH /api/admin/projets/:id/approve-visibility

ADMIN (président) valide le visibiliteSite=true

Événements

Même logique :

bureau crée

président valide l’affichage sur le site (afficheSite=true)
Endpoints :

POST /api/bureau/evenements

PATCH /api/bureau/evenements/:id

POST /api/bureau/evenements/:id/submit-site

PATCH /api/admin/evenements/:id/approve-afficheSite

6.5 Commentaires / étoiles
POST /api/app/contents/:id/comment

Membre connecté (MEMBER, ADMIN, bureau, etc.)

Crée Comment

POST /api/app/contents/:id/rating

1..5

upsert sur Rating (unique contentId+auteurUserId)

PATCH /api/admin/comments/:id/hide

ADMIN (président) ou SUPER_ADMIN : isDeleted=true

6.6 Chat
GET /api/app/chat?scope=PUBLIC_MEMBRES

Tous membres connectés

POST /api/app/chat

Envoie BureauMessage avec scope

Règles :

si scope = PRIVE_BUREAU → seulement bureau actif

si scope = PUBLIC_MEMBRES → tout membre actif

6.7 Site public (lecture) — endpoints publics de listing

Tu peux faire du SSR directement, mais si tu veux une API :

GET /api/public/bureau-actuel

GET /api/public/projets?visible=true

GET /api/public/projets/:slug

GET /api/public/evenements?afficheSite=true

GET /api/public/actualites (Contents PUBLIE + PUBLIC_SITE)

Règles “Qui voit quoi” (ultra clair)
Quand un responsable crée un contenu

Visible immédiatement : auteur + salon privé bureau

Invisible : salon public + site public

Action requise : “Soumettre au président”

Quand le président approuve

Passe APPROUVE puis PUBLIE

Visible selon cible :

PUBLIC_MEMBRES → salon public

PUBLIC_SITE → site public

Tout le monde peut commenter/noter selon permissions

Si un non autorisé tente de créer/modifier

Middleware bloque → 403 + redirection

AuditLog créé (action = UPDATE/CREATE + entityType)     




#Ce que je te conseille (structure de dossiers)

src/lib/auth.ts (getSession, requireRole)

src/lib/rbac.ts (fonctions canX)

src/lib/mandat.ts (getMandatActif)

src/lib/audit.ts (logAction)
 
src/lib/validators/* (zod)  
