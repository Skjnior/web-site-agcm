# Formulaires et Notifications - Documentation

## 📋 Vue d'ensemble

Tous les formulaires publics du site sont **complètement liés et implémentés** pour que les admins/président reçoivent des notifications en temps réel.

## ✅ Formulaires Implémentés

### 1. Formulaire d'Adhésion
- **Route API** : `POST /api/public/adhesion`
- **Base de données** : Table `demandes_adhesion`
- **Notification** : Tous les admins/président reçoivent une notification in-app
- **Page admin** : `/admin/demandes/adhesions`
- **Actions admin** : Approuver / Refuser

### 2. Formulaire de Partenariat
- **Route API** : `POST /api/public/partenariat`
- **Base de données** : Table `demandes_partenariat`
- **Notification** : Tous les admins/président reçoivent une notification in-app
- **Page admin** : `/admin/demandes/partenariats`
- **Actions admin** : Gérer les demandes

### 3. Formulaire de Don
- **Route API** : `POST /api/public/don`
- **Base de données** : Table `donation_intents`
- **Notification** : Tous les admins/président reçoivent une notification in-app
- **Page admin** : `/admin/demandes/dons`
- **Actions admin** : Gérer les intentions de don

### 4. Formulaire de Contact
- **Route API** : `POST /api/public/contact`
- **Base de données** : Table `messages_contact`
- **Notification** : Tous les admins/président reçoivent une notification in-app
- **Page admin** : `/admin/contacts`
- **Actions admin** : Voir et répondre aux messages

## 🔔 Système de Notifications

### Fonctionnement

1. **Soumission du formulaire** → L'utilisateur remplit et soumet un formulaire
2. **Enregistrement en BDD** → Les données sont sauvegardées dans la table correspondante
3. **Notification automatique** → Tous les admins et super admins reçoivent une notification in-app
4. **Affichage dans l'interface** → Les admins voient la notification dans leur header (badge)
5. **Gestion via pages admin** → Les admins peuvent voir et gérer toutes les demandes

### Helper de Notification

```typescript
// src/lib/admin-notifications.ts
notifyAdminsForNewDemand(
  type: 'DEMANDE_ADHESION' | 'DEMANDE_PARTENARIAT' | 'DEMANDE_DON' | 'MESSAGE_CONTACT',
  entityId: string,
  message: string
)
```

Cette fonction :
- Récupère tous les utilisateurs avec rôle `ADMIN` ou `SUPER_ADMIN`
- Crée une notification in-app pour chacun
- Ne fait pas échouer la requête si la notification échoue (gestion d'erreur gracieuse)

### Types de Notifications

Les types suivants sont ajoutés au système :
- `DEMANDE_ADHESION` - Nouvelle demande d'adhésion
- `DEMANDE_PARTENARIAT` - Nouvelle demande de partenariat
- `DEMANDE_DON` - Nouvelle intention de don
- `MESSAGE_CONTACT` - Nouveau message de contact

## 📍 Emplacements des Formulaires

### Landing Page (`AGCMLanding.tsx`)
- **Modal Adhésion** : Bouton "Adhérer maintenant"
- **Modal Partenariat** : Bouton "Devenir partenaire"
- **Modal Contact** : Bouton "Nous contacter"

### Page Contact (`/contact`)
- **ContactForm** : Formulaire complet de contact

## 🎯 Flux Complet

### Exemple : Demande d'Adhésion

1. **Visiteur** remplit le formulaire d'adhésion sur la landing page
2. **Frontend** envoie `POST /api/public/adhesion` avec les données
3. **Backend** :
   - Valide les données (Zod)
   - Crée l'enregistrement dans `demandes_adhesion`
   - Appelle `notifyAdminsForNewDemand()`
4. **Notification** :
   - Tous les admins reçoivent une notification in-app
   - Badge de notification apparaît dans le header
5. **Admin** :
   - Voit la notification dans `/app/notifications`
   - Accède à `/admin/demandes/adhesions`
   - Peut approuver ou refuser la demande

## 📊 Pages Admin

### `/admin/demandes/adhesions`
- Liste paginée des demandes d'adhésion
- Filtres : recherche, statut (EN_ATTENTE, APPROUVEE, REFUSEE)
- Actions : Approuver / Refuser

### `/admin/demandes/partenariats`
- Liste paginée des demandes de partenariat
- Filtres : recherche, statut
- Actions : Gérer les demandes

### `/admin/demandes/dons`
- Liste paginée des intentions de don
- Filtres : recherche, statut
- Actions : Gérer les dons

### `/admin/contacts`
- Liste paginée des messages de contact
- Filtres : recherche, statut
- Actions : Voir et répondre

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Soumettez un formulaire** depuis la landing page
2. **Connectez-vous en tant qu'admin**
3. **Vérifiez la notification** dans le header (badge)
4. **Accédez à la page admin** correspondante
5. **Vérifiez que la demande apparaît** dans la liste

## 🔧 Configuration

Aucune configuration supplémentaire n'est nécessaire. Les notifications fonctionnent automatiquement dès qu'un formulaire est soumis.

## 📝 Notes

- Les notifications sont **in-app uniquement** (pas d'email pour l'instant)
- Tous les admins et super admins reçoivent les notifications
- Les notifications sont persistées en base de données
- Les notifications peuvent être marquées comme lues
- Les notifications apparaissent dans le header avec un badge de compteur



