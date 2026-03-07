🎯 Ce qu'une association comme l'AGCM a VRAIMENT besoin
✅ À GARDER — Indispensable
Fonctionnalité	Pourquoi
Site public (landing, bureau actuel, événements, actualités, projets)	Vitrine de l'asso — essentiel
Formulaires visiteurs (adhésion, contact, partenariat)	Pour recruter et communiquer
Auth (login/logout)	Base de tout
Dashboard par poste (CRUD activités bureau)	Cœur du projet
Workflow approbation Président	Gouvernance — c'est la valeur ajoutée principale
Salon privé bureau (+ chat bureau uniquement)	✅ Ton idée est bonne, un seul chat suffit
Mandats / Postes / Affectations	Core governance
Super Admin (création comptes, mandats)	Obligatoire
Archivage automatique (inactivation membre)	Logique métier importante
Audit log simplifié	Traçabilité minimum
❌ À RETIRER — Trop complexe, peu utile au quotidien
Fonctionnalité	Pourquoi retirer
Chat membres public	WhatsApp/Messenger remplace ça, inutile d'en développer un maison
Messages directs (DirectMessage)	Même raison — email suffit
Système de vote ✅/❌	Trop complexe à gérer. Un Google Form est souvent suffisant
Notation ⭐ (ratings)	Gadget — aucune asso ne l'utilise vraiment
Subventions (entité complète)	Très niche — un fichier Excel fait le boulot au début
Citations du Président	Gadget décoratif
Notifications temps réel	Très complexe à développer et maintenir. Les emails suffisent
Donation Intent (formulaire don)	Une simple page "Comment nous soutenir" avec coordonnées suffit
Rate limiting Upstash Redis	Coût + complexité. Les protections Next.js de base suffisent pour une petite asso
🟡 À SIMPLIFIER (garder mais version légère)
Fonctionnalité	Comment simplifier
Salon public membres	Garder comme "fil d'actualité" en lecture seule (contenus approuvés), sans commentaires
Commentaires	Retirer complètement ou garder uniquement dans le salon bureau
Upload fichiers	Garder pour les ressources uniquement, pas besoin de Vercel Blob tout de suite
Tests	Laisser les tests en place, juste ne pas en ajouter de nouveaux pour l'instant
📦 Le projet recentré ressemble à ça
Visiteur  →  Site public (landing, événements, actualités, projets, bureau, adhésion, contact)
Membre    →  Login → Profil + Fil d'actualité approuvé (lecture)
Bureau    →  Dashboard poste + Créer/Soumettre activités + Chat bureau privé
Président →  Approuver/Rejeter contenus + Voir tout (lecture)
SuperAdmin → Créer comptes + Mandats + Postes + Affectations + Audit logs
C'est propre, cohérent, et faisable seule avec une IA. 🎯

Pour résumer les suppressions concrètes dans le code :

Supprimer les modèles Prisma : Rating, PresidentCitation, DirectMessage, Vote, VoteResponse, Subvention (ou laisser en DB mais ne pas développer l'UI)
Supprimer les routes /api/app/chat?scope=PUBLIC_MEMBRES et garder uniquement PRIVE_BUREAU
Désactiver le module BureauMessage pour PUBLIC_MEMBRES
Retirer Upstash Redis de la config
Tu veux qu'on commence par faire ces suppressions/simplifications dans le code ?

