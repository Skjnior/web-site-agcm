# 🔍 Système d'Audit - AGCM

## Vue d'ensemble

Le système d'audit garantit la **traçabilité complète** de toutes les actions importantes sur la plateforme. Chaque action est enregistrée avec :
- Qui a fait l'action
- Quand elle a été faite
- Quoi a été modifié (avant/après)
- Pourquoi (si applicable)

## 📊 Types d'actions auditées

### 🔐 Super Admin
- ✅ Création/modification/suppression d'utilisateurs
- ✅ Création/modification/archivage de mandats
- ✅ Création/modification/suppression de postes
- ✅ Affectations de membres à des postes
- ✅ Inactivation d'affectations (avec raison)
- ✅ Modification/suppression de contenus (même archivés)
- ✅ Publication directe de contenus

### 👑 Admin / Président
- ✅ Approbation/rejet de contenus
- ✅ Traitement des demandes (adhésion, partenariat, dons)
- ✅ Création de votes
- ✅ Modification de commentaires (masquer)

### 🏛️ Bureau
- ✅ Création de contenus
- ✅ Soumission de contenus pour approbation
- ✅ Création de projets
- ✅ Création d'événements
- ✅ Soumission projets/événements au site

### 👤 Membres
- ✅ Commentaires
- ✅ Notes/évaluations
- ✅ Participation aux votes

## 🔍 Consultation des logs

### Super Admin
- ✅ Accès à **tous** les logs d'audit
- ✅ Filtres par :
  - Type d'action (CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.)
  - Type d'entité (User, Content, Projet, Event, etc.)
  - Utilisateur
  - Date
- ✅ Export possible des logs

### Admin / Président
- ❌ Ne peut **pas** accéder aux logs d'audit
- ✅ Peut voir les notifications de ses actions

### Bureau / Membres
- ❌ Ne peuvent **pas** accéder aux logs d'audit
- ✅ Peuvent voir leurs propres notifications

## 📝 Format des logs

Chaque log contient :
```json
{
  "id": "clx...",
  "userId": "clx...",
  "action": "APPROVE",
  "entityType": "Content",
  "entityId": "clx...",
  "beforeData": { ... },
  "afterData": { ... },
  "createdAt": "2025-01-15T10:30:00Z",
  "user": {
    "id": "clx...",
    "email": "president@agcm.fr"
  }
}
```

## 🎯 Cas d'usage

### Vérifier qui a approuvé un contenu
```typescript
const logs = await getAuditLogs('Content', contentId);
const approval = logs.find(log => log.action === 'APPROVE');
```

### Vérifier l'historique d'un utilisateur
```typescript
const userLogs = await getUserAuditLogs(userId);
```

### Vérifier toutes les modifications d'un projet
```typescript
const projectLogs = await getAuditLogs('Projet', projetId);
```

## 🔒 Sécurité

- ✅ Les logs sont **immutables** (ne peuvent pas être modifiés)
- ✅ Seul le Super Admin peut les consulter
- ✅ Les logs sont conservés indéfiniment
- ✅ Les données sensibles (mots de passe) ne sont jamais loggées

## 📈 Performance

- ✅ Les logs sont indexés pour des recherches rapides
- ✅ Pagination sur les listes de logs
- ✅ Filtres optimisés au niveau base de données

## 🚨 Alertes importantes

Certaines actions critiques déclenchent des notifications :
- Création d'un vote → Tous les membres
- Approbation/rejet de contenu → Auteur
- Inactivation d'affectation → Membre concerné
- Création de compte → Utilisateur



