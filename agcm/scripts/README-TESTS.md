# Tests des rôles AGCM

## Comptes de test (seed)

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **SUPER_ADMIN** | user1@agcm.gn | password123 | Admin, Salon bureau, Approbations, tout |
| **ADMIN** | user2@agcm.gn | password123 | Admin, Salon bureau, Approbations |
| **MEMBER BUREAU** | user7@agcm.gn | password123 | Bureau, Salon privé, Paiements |
| **MEMBER SIMPLE** | user16@agcm.gn | password123 | Dashboard membre, Paiements (pas de salon) |

## Script de test RBAC

```bash
npx tsx scripts/test-roles.ts
```

Vérifie les fonctions `isBureauActif`, `canAccessSalonBureau`, `getAffectationActive` pour chaque rôle.

## Tests unitaires

```bash
npm test
```

## Tests manuels (navigateur)

1. Démarrer le serveur : `npm run dev`
2. Se connecter avec chaque compte
3. Vérifier :
   - **SUPER_ADMIN** : /admin, /admin/approbations, /app/chat
   - **ADMIN** : idem
   - **MEMBER BUREAU** : /bureau, /app/chat, /app/dashboard/paiements (avec carte Salon privé)
   - **MEMBER SIMPLE** : /app/dashboard, /app/chat → redirection vers /app/dashboard
