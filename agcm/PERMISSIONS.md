# 🔐 Matrice des Permissions - AGCM

## Vue d'ensemble

Le système de permissions est structuré en **4 niveaux hiérarchiques** :

1. 🔐 **SUPER ADMIN** - Pouvoir absolu
2. 👑 **ADMIN / PRÉSIDENT** - Superviseur institutionnel
3. 🏛️ **MEMBRES DU BUREAU** - Responsables opérationnels
4. 👤 **MEMBRE SIMPLE** - Utilisateur de base

---

## 🔐 SUPER ADMIN - Administrateur système suprême

### ✅ Ce que le SUPER ADMIN peut faire

#### 🔑 Gestion du système
- ✅ Créer, modifier, désactiver, supprimer des comptes utilisateurs
- ✅ Activer / désactiver un compte (bloquer l'accès)
- ✅ Réinitialiser les mots de passe
- ✅ Définir les rôles système (SUPER_ADMIN, ADMIN, MEMBER)

#### 🏛️ Gouvernance
- ✅ Créer, modifier, archiver des mandats
- ✅ Activer un mandat (un seul actif à la fois)
- ✅ Créer, modifier, désactiver des postes du bureau
- ✅ Ajouter de nouveaux postes personnalisés à tout moment

#### 👥 Affectations
- ✅ Affecter un membre à un poste pour un mandat donné
- ✅ Mettre fin à une affectation (INACTIF)
- ✅ Obligation de renseigner la raison (fin de mandat, démission, révocation, etc.)
- ✅ Archiver automatiquement les activités liées

#### 📄 Contenus & publications
- ✅ Modifier ou supprimer n'importe quel contenu, même :
  - archivé
  - créé par un autre poste
- ✅ Publier / dépublier directement (sans validation)

#### 🗳️ Votes
- ✅ Créer, modifier, supprimer des votes
- ✅ Voir qui a voté quoi (détails individuels)
- ✅ Exporter les résultats détaillés
- ✅ Archiver les votes par mandat

#### 🔔 Notifications & audit
- ✅ Voir toutes les notifications
- ✅ Accéder à l'intégralité des logs d'audit
- ✅ Vérifier qui a fait quoi, quand et pourquoi

### ❌ Ce que le SUPER ADMIN ne doit PAS faire (règle morale)
- ❌ Interférer dans les décisions politiques internes
- ❌ Modifier le contenu pour orienter les votes (bonne pratique)
- 👉 Mais techniquement, il en a la possibilité.

### 👀 Ce que les autres voient
- Les utilisateurs voient ses actions sans voir son identité détaillée
- Les changements sont visibles via :
  - mises à jour du bureau
  - archivage
  - notifications système

---

## 👑 ADMIN / PRÉSIDENT - Superviseur institutionnel

### ✅ Ce que le PRÉSIDENT (ADMIN) peut faire

#### 📰 Validation des publications (RÔLE CLÉ)
- ✅ Voir tous les contenus soumis à validation
- ✅ Approuver ou rejeter :
  - publications
  - actualités
  - partages externes
  - contenus destinés au salon public ou site public
- ✅ Donner un motif de rejet obligatoire
- 👉 **Sans validation du Président, rien ne sort au public.**

#### 🏛️ Supervision du bureau
- ✅ Voir toutes les activités du bureau (lecture seule)
- ✅ Suivre l'avancement des projets
- ✅ Donner des avis ⭐ et commentaires
- ✅ Accéder au salon privé du bureau

#### 📋 Gestion administrative
- ✅ Consulter et traiter :
  - demandes d'adhésion
  - demandes de partenariat
  - messages de contact
  - intentions de don
- ✅ Pré-valider les demandes (sans créer de compte)

#### 🗳️ Votes
- ✅ Créer des votes internes
- ✅ Voir les statistiques globales (oui/non)
- ❌ **Ne peut pas voir qui a voté quoi**

#### 📰 Contenus propres
- ✅ Créer ses propres publications
- ✅ Publier des annonces présidentielles
- ✅ Communiquer au nom de l'association

### ❌ Ce que le PRÉSIDENT ne peut PAS faire
- ❌ Créer ou supprimer des comptes
- ❌ Créer ou supprimer des postes
- ❌ Modifier ou supprimer les contenus archivés des autres
- ❌ Voir le détail individuel des votes
- ❌ Modifier les logs d'audit
- ❌ Approuver son propre contenu (règle : juge et partie)

### 👀 Ce que les autres voient
- Les membres voient :
  - "Publication approuvée par le Président"
  - décisions visibles dans les salons
- Le bureau voit ses validations/rejets

---

## 🏛️ MEMBRES DU BUREAU - Responsables opérationnels

Chaque membre du bureau a :
- un poste
- un dashboard dédié
- des responsabilités sectorielles

### Règles communes à TOUS les membres du bureau

#### ✅ Peuvent faire
- ✅ Créer/modifier leurs contenus (avant publication)
- ✅ Soumettre leurs contenus pour validation président
- ✅ Commenter et noter les autres contenus
- ✅ Accéder au salon privé bureau
- ✅ Créer des projets et événements
- ✅ Voir les activités du bureau

#### ❌ Ne peuvent pas
- ❌ Publier directement sans validation président
- ❌ Supprimer les contenus archivés
- ❌ Modifier les contenus publiés
- ❌ Supprimer les contenus des autres
- ❌ Agir hors de leur secteur

### 3.1 Président (en tant que membre du bureau)
- Rôle déjà détaillé ci-dessus
- Peut aussi créer des activités comme les autres postes

### 3.2 Secrétaire Administratif
#### ✅ Peut faire
- ✅ Rédiger et publier :
  - PV de réunions
  - décisions administratives
  - convocations
- ✅ Gérer les documents officiels
- ✅ Créer des activités administratives

#### ❌ Ne peut pas
- ❌ Publier au public sans validation président
- ❌ Modifier activités archivées

### 3.3 Secrétaire à la Communication & Information
#### ✅ Peut faire
- ✅ Créer :
  - actualités
  - annonces
  - communiqués
  - partages médias
- ✅ Gérer images & contenus

#### ❌ Ne peut pas
- ❌ Publier directement sans validation président

### 3.4 Secrétaire à l'Organisation
#### ✅ Peut faire
- ✅ Créer et gérer :
  - événements
  - calendriers
  - plannings
- ✅ Publier des comptes rendus d'événements

#### ❌ Ne peut pas
- ❌ Afficher un événement sur le site sans validation président

### 3.5 Secrétaire aux Affaires Sociales & Intégration
#### ✅ Peut faire
- ✅ Gérer :
  - actions sociales
  - projets d'intégration
  - annonces solidaires
- ✅ Créer des projets sociaux

⚠️ **Règle** : Certains contenus peuvent être visibles uniquement au bureau (confidentialité)

### 3.6 Secrétaire Sports, Culture & Environnement
#### ✅ Peut faire
- ✅ Organiser :
  - activités sportives
  - événements culturels
  - projets environnementaux
- ✅ Publier galeries photos

### 3.7 Trésorier
#### ✅ Peut faire
- ✅ Gérer :
  - intentions de don
  - suivis financiers simples
- ✅ Voir les subventions
- ✅ Publier rapports financiers internes

#### ❌ Ne peut pas
- ❌ Modifier les projets
- ❌ Publier finances au public sans validation

### 3.8 Directeur des Finances
#### ✅ Peut faire
- ✅ Gérer :
  - subventions
  - budgets
  - rapports financiers avancés
- ✅ Superviser le Trésorier

### 3.9 Secrétaire à la Sécurité
#### ✅ Peut faire
- ✅ Gérer incidents
- ✅ Rapports de sécurité
- ✅ Alertes internes

---

## 👤 MEMBRE SIMPLE

### ✅ Peut faire
- ✅ Voir le salon public
- ✅ Voir les publications validées
- ✅ Commenter / noter
- ✅ Participer aux votes
- ✅ Voir le bureau actuel
- ✅ Voir ses propres informations

### ❌ Ne peut pas
- ❌ Accéder au salon privé bureau
- ❌ Créer des publications officielles
- ❌ Gérer projets / événements
- ❌ Voir les contenus non validés
- ❌ Voir les logs d'audit

---

## 🎯 Règle FONDAMENTALE du système

**Personne ne peut être juge et partie.**

- ✅ Celui qui crée ≠ celui qui valide
- ✅ Celui qui vote ≠ celui qui dépouille
- ✅ Celui qui archive ≠ celui qui décide

👉 C'est ce qui donne crédibilité, transparence et confiance à la plateforme.

---

## 📊 Matrice de permissions rapide

| Action | SUPER ADMIN | ADMIN/PRÉSIDENT | BUREAU | MEMBRE |
|--------|-------------|-----------------|--------|--------|
| Créer utilisateur | ✅ | ❌ | ❌ | ❌ |
| Gérer mandats/postes | ✅ | ❌ | ❌ | ❌ |
| Approuver contenu | ✅ | ✅* | ❌ | ❌ |
| Créer contenu | ✅ | ✅ | ✅ | ❌ |
| Publier directement | ✅ | ❌ | ❌ | ❌ |
| Modifier contenu archivé | ✅ | ❌ | ❌ | ❌ |
| Voir votes détaillés | ✅ | ❌ | ❌ | ❌ |
| Créer vote | ✅ | ✅ | ❌ | ❌ |
| Voter | ✅ | ✅ | ✅ | ✅ |
| Accéder salon bureau | ✅ | ✅ | ✅ | ❌ |
| Voir logs d'audit | ✅ | ❌ | ❌ | ❌ |

*Ne peut pas approuver son propre contenu

---

## 🔍 Audit & Traçabilité

Toutes les actions importantes sont enregistrées dans les logs d'audit :
- Création/modification/suppression d'entités
- Approbations/rejets
- Changements de statut
- Modifications de permissions

Seul le **SUPER ADMIN** peut consulter l'intégralité des logs.



