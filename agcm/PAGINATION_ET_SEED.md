# 📊 Pagination & Seed - Documentation

## ✅ Implémentation Complète

### 1. Système de Pagination Standardisé

**Fichier** : `src/lib/pagination.ts`

#### Fonctions disponibles :

- `parsePagination(request)` : Parse les paramètres `page` et `limit` depuis les query params
  - `page` : Numéro de page (défaut: 1, minimum: 1)
  - `limit` : Nombre d'éléments par page (défaut: 20, minimum: 1, maximum: 100)
  - Retourne : `{ page, limit, offset }`

- `createPaginationMeta(total, page, limit)` : Crée les métadonnées de pagination
  - Retourne : `{ page, limit, total, totalPages, hasNext, hasPrev }`

- `createPaginatedResponse(data, total, page, limit)` : Crée une réponse paginée standardisée
  - Retourne : `{ data: T[], pagination: PaginationMeta }`

#### Format de réponse standardisé :

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 600,
    "totalPages": 30,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2. Routes API avec Pagination

Toutes les routes GET qui retournent des listes utilisent maintenant la pagination :

#### Super Admin
- ✅ `GET /api/super-admin/users` - Liste des utilisateurs
- ✅ `GET /api/super-admin/mandats` - Liste des mandats
- ✅ `GET /api/super-admin/postes` - Liste des postes
- ✅ `GET /api/super-admin/affectations` - Liste des affectations
- ✅ `GET /api/super-admin/audit-logs` - Logs d'audit

#### Admin / Président
- ✅ `GET /api/admin/approbations` - Contenus en attente d'approbation
- ✅ `GET /api/admin/demandes/adhesions` - Demandes d'adhésion
- ✅ `GET /api/admin/demandes/partenariats` - Demandes de partenariat
- ✅ `GET /api/admin/demandes/dons` - Intentions de don
- ✅ `GET /api/admin/contacts` - Messages de contact

#### Bureau
- ✅ `GET /api/bureau/contents` - Contenus du bureau
- ✅ `GET /api/bureau/projets` - Projets du bureau
- ✅ `GET /api/bureau/evenements` - Événements du bureau

#### Public
- ✅ `GET /api/public/actualites` - Actualités publiques
- ✅ `GET /api/public/projets` - Projets publics
- ✅ `GET /api/public/evenements` - Événements publics

#### App / Membres
- ✅ `GET /api/app/chat` - Messages de chat

---

### 3. Script de Seed (600 entrées par table)

**Fichier** : `prisma/seed.ts`

#### Tables seedées :

1. **Mandats** : 3 mandats (2 expirés, 1 actif)
2. **Postes** : 10 postes du bureau
3. **Users + Members** : 600 utilisateurs et membres
4. **Affectations** : 600 affectations postes
5. **Contents** : 600 contenus (activités, actualités, partages, annonces)
6. **Comments** : 600 commentaires
7. **Ratings** : 600 notes (1-5 étoiles)
8. **Projets** : 600 projets
9. **ProjetMedia** : 600 médias projets
10. **Partners** : 600 partenaires
11. **ProjetPartners** : 600 relations projets-partenaires
12. **Subventions** : 600 subventions
13. **Events** : 600 événements
14. **EventMedia** : 600 médias événements
15. **DemandesAdhesion** : 600 demandes d'adhésion
16. **DemandesPartenariat** : 600 demandes de partenariat
17. **DonationIntents** : 600 intentions de don
18. **MessagesContact** : 600 messages de contact
19. **BureauMessages** : 600 messages chat
20. **AuditLogs** : 600 logs d'audit

**Total** : ~12 000 entrées dans la base de données

---

## 🚀 Utilisation

### Lancer le seed

```bash
cd agcm
npm run seed
# ou
npx tsx prisma/seed.ts
```

### Utiliser la pagination dans les requêtes

#### Exemple 1 : Page 1, 20 éléments par page
```
GET /api/super-admin/users?page=1&limit=20
```

#### Exemple 2 : Page 2, 50 éléments par page
```
GET /api/bureau/contents?page=2&limit=50
```

#### Exemple 3 : Avec filtres
```
GET /api/admin/demandes/adhesions?statut=EN_ATTENTE&page=1&limit=30
```

---

## 📊 Performance & Scalabilité

### Avantages de la pagination

1. **Performance** : Limite le nombre de résultats chargés en mémoire
2. **Temps de réponse** : Réponses plus rapides même avec des milliers d'entrées
3. **Bande passante** : Moins de données transférées
4. **UX** : Chargement progressif des données
5. **Scalabilité** : Fonctionne avec des millions d'entrées

### Optimisations implémentées

- ✅ Requêtes `count()` et `findMany()` en parallèle avec `Promise.all()`
- ✅ Limite maximale de 100 éléments par page
- ✅ Index sur les colonnes de tri (créés dans Prisma)
- ✅ Pagination basée sur `offset` et `limit` (efficace pour petites/moyennes bases)

### Pour des bases très volumineuses (>100k entrées)

Si nécessaire, on peut implémenter :
- Pagination par curseur (cursor-based) au lieu d'offset
- Cache Redis pour les comptes totaux
- Index composites supplémentaires

---

## 🧪 Test

### Vérifier le seed

```bash
# Lancer le seed
npm run seed

# Vérifier les comptes
psql -U kaba -d agcm -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'members', COUNT(*) FROM members UNION ALL SELECT 'contents', COUNT(*) FROM contents;"
```

### Tester la pagination

```bash
# Test avec curl
curl "http://localhost:3000/api/super-admin/users?page=1&limit=20"
curl "http://localhost:3000/api/bureau/contents?page=2&limit=10"
```

---

## 📝 Notes

- La pagination est **optionnelle** : si `page` et `limit` ne sont pas fournis, les valeurs par défaut sont utilisées (page=1, limit=20)
- Le maximum de `limit` est **100** pour éviter les surcharges
- Toutes les routes retournent le même format de réponse paginée pour la cohérence



