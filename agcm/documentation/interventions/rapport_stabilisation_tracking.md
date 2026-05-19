# Rapport Technique d'Intervention - 29/30 Avril 2026

Ce rapport détaille les difficultés rencontrées et les améliorations apportées au projet AGCM.

---

## 1. Migration du Système de Tracking (Audit des visites)

### LE QUOI ?
C'est le système qui permet de savoir qui visite le site, quelle page est consultée, et de stocker ces informations (IP, Localisation, Historique) dans la base de données pour l'administration.

### LE COMMENT ?
Initialement, ce système était dans le `middleware.ts`. Nous l'avons déplacé dans un composant Client (`PageViewTracker.tsx`) car le middleware de Next.js sur Vercel a des restrictions de sécurité qui empêchaient de récupérer l'IP correctement ou d'écrire dans la base de données. 
*   **Fonctionnement** : Le navigateur envoie une requête discrète à une API interne (`/api/internal/page-view`) dès qu'une page est chargée. L'API récupère l'IP via les headers de Vercel et enregistre le tout.

### L'ENVIRONNEMENT ?
Travail effectué sur l'**Environnement de Développement (Local)** puis déployé sur l'**Environnement de Production (Vercel)**.

---

## 2. Résolution des Erreurs de Build (Stabilité)

### LE QUOI ?
Vercel refusait de construire le site (erreur "Build Failed"). Les deux causes étaient l'absence de `Suspense` pour les paramètres d'URL et des erreurs de typage TypeScript.

### LE COMMENT ?
*   **Suspense** : Nous avons entouré le tracker de visites avec `<Suspense>` dans `layout.tsx`. Cela permet à Next.js de générer les pages statiques (comme la 404) même si le tracker attend des infos du navigateur.
*   **TypeScript** : Nous avons corrigé les imports (SmartImage) et les types de composants (Badge) pour que le compilateur ne bloque plus le déploiement.

### L'ENVIRONNEMENT ?
Intervention sur le code source dans le **Dépôt Git (Branche develop)** pour une exécution sur les serveurs de **Build de Vercel**.

---

## 3. Restauration des Données (Connectivité DB)

### LE QUOI ?
Après le build, le site était en ligne mais "vide" (pas d'actualités, pas de membres). La base de données ne répondait pas.

### LE COMMENT ?
*   **Variables d'environnement** : Vercel utilisait un nom de variable automatique (`agcm_db_DATABASE_URL`) alors que le code cherchait `DATABASE_URL`. Nous avons créé un alias correct dans les paramètres Vercel.
*   **Migration** : Nous avons utilisé un script JavaScript personnalisé (`scripts/migrate-data.js`) pour copier les 10 000+ lignes de données de votre ordinateur vers le serveur distant, car les outils standards (`pg_dump`) avaient des versions incompatibles.

### L'ENVIRONNEMENT ?
Action directe sur le **Tableau de Bord Vercel** et synchronisation entre la **Base de Données Locale (PostgreSQL 18)** et la **Base de Données Production (Prisma/Postgres)**.

---

## 4. Amélioration de l'Interface Admin (Logs)

### LE QUOI ?
Une interface permettant de voir le détail d'une visite avec une carte géographique et le parcours de navigation de l'utilisateur.

### LE COMMENT ?
Nous avons ajouté une section "Historique de navigation" dans la page de détail d'une visite. Elle interroge l'API pour trouver toutes les autres pages consultées par la même personne (même IP ou même ID utilisateur) et les affiche sous forme de cartes chronologiques.

### L'ENVIRONNEMENT ?
Développement de composants **React (Next.js App Router)** intégrés dans la section **Admin** du projet.

---

## 5. Correction de l'Invisibilité des Listes Déroulantes (Bureau)

### LE QUOI ?
Correction d'un bug visuel sur le formulaire de création de contenu (`/bureau/contents/nouveau`) où les options de la liste "Type de contenu" étaient invisibles.

### LE COMMENT ?
Le problème venait d'une classe CSS `text-slate-900` appliquée sur les éléments de la liste (`SelectItem`). Dans un thème sombre, cette couleur noire rendait le texte illisible sur le fond foncé.
*   **Action** : Suppression de la couleur forcée et ajout d'un style cohérent (`bg-slate-800` et `text-slate-100`) sur le conteneur `SelectContent` pour garantir une visibilité parfaite.

### L'ENVIRONNEMENT ?
Modification effectuée sur le composant **Front-end (React)** en local.

---

## 6. Correction de l'Upload d'Images (Bureau)

### LE QUOI ?
Correction d'un blocage lors de l'envoi d'images dans le formulaire de nouveau contenu pour les membres du Bureau.

### LE COMMENT ?
*   **Sécurité** : La route API d'upload était restreinte aux comptes `ADMIN`. Nous avons élargi cette permission aux membres actifs du Bureau (`isBureauActif`).
*   **Infrastructure** : Création du dossier `public/uploads/images` en local pour permettre le stockage des fichiers.

### L'ENVIRONNEMENT ?
Modification du **Système de Permissions (RBAC)** et de l'**API d'Upload** en local.

---

## 7. Amélioration de la Navigation Dashboard (Bureau)

### LE QUOI ?
Transformation des cartes de statistiques du tableau de bord du Bureau (`/bureau`) en liens interactifs pour un accès rapide aux listes filtrées.

### LE COMMENT ?
*   **Interactivité** : Chaque carte (Mes activités, Publiées, En attente, Projets) a été entourée d'un composant `Link`.
*   **Filtrage Dynamique** : Les liens utilisent des paramètres d'URL (ex: `?status=PUBLIE`) pour filtrer automatiquement la page de destination.
*   **UX/Design** : Ajout d'animations CSS (`hover:scale-105`, `transition-shadow`) pour donner un retour visuel immédiat à l'utilisateur lorsqu'il survole une carte.

### L'ENVIRONNEMENT ?
Modification du **Composant Page Dashboard (React/Next.js)** en local.

---

## 8. Nettoyage de Contenu (Base de Données)

### LE QUOI ?
Correction d'un problème d'affichage sur l'activité "Réunion pour l'élection du nouveau président" où des balises HTML (`<p>`, `<strong>`) apparaissaient en clair sur le site.

### LE COMMENT ?
*   **Analyse** : Le contenu avait été enregistré avec du code HTML brut et une répétition de la phrase.
*   **Action** : Exécution d'un script de nettoyage de base de données pour remettre le texte au format texte brut ("plain text") et supprimer les doublons.

### L'ENVIRONNEMENT ?
Intervention directe sur la **Base de Données (Prisma)** via un script Node.js.

---

## 9. Intégration de la Visioconférence (Salon Bureau)

### LE QUOI ?
Transformation du Salon Bureau en un espace collaboratif hybride (Chat + Vidéo intégrée).

### LE COMMENT ?
*   **Intégration IFrame** : Utilisation de l'API externe de **Jitsi Meet** pour incruster la vidéo directement dans la page.
*   **Mode Split-Screen** : Mise en place d'un affichage intelligent. Lorsqu'une visio est active, l'écran se divise pour montrer la vidéo à gauche et le chat à droite.
*   **Synchronisation** : Chargement dynamique du script Jitsi via `next/script` pour optimiser les performances.
*   **Expérience Utilisateur** : Plus besoin de changer d'onglet. Les participants sont visibles instantanément dans l'interface AGCM.

### L'ENVIRONNEMENT ?
Modification profonde du composant **ChatInterface (React)** et du layout de la section **Chat**.
