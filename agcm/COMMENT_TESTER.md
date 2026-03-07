# 🧪 Comment Tester - Guide Pratique

## 🚀 Commandes Principales

### 1. Exécuter tous les tests
```bash
npm test
```
Affiche un résumé de tous les tests (passés/échoués).

### 2. Exécuter un fichier de test spécifique
```bash
npm test -- __tests__/lib/rbac.test.ts
```
Utile pour tester une fonctionnalité précise.

### 3. Mode watch (re-exécution automatique)
```bash
npm run test:watch
```
Les tests se relancent automatiquement quand vous modifiez un fichier. **Idéal pendant le développement !**

### 4. Tests avec couverture de code
```bash
npm run test:coverage
```
Génère un rapport montrant quelles parties du code sont testées. Le rapport est dans `coverage/`.

### 5. Filtrer par nom de test
```bash
npm test -- --testNamePattern="should return true"
```
Exécute seulement les tests dont le nom contient ce pattern.

### 6. Mode verbose (plus de détails)
```bash
npm test -- --verbose
```
Affiche tous les détails de chaque test.

## 📁 Structure des Tests

```
__tests__/
├── api/              # Tests des routes API
├── components/       # Tests des composants React
├── lib/              # Tests des fonctions utilitaires
├── hooks/            # Tests des hooks React
├── validators/       # Tests de validation
└── workflows/        # Tests E2E (end-to-end)
```

## 🎯 Exemples Pratiques

### Tester seulement les fonctions RBAC
```bash
npm test -- __tests__/lib/rbac.test.ts
```

### Tester toutes les API admin
```bash
npm test -- __tests__/api/admin/
```

### Tester avec détails en cas d'erreur
```bash
npm test -- __tests__/lib/rbac.test.ts --verbose
```

### Voir la couverture de code pour un fichier
```bash
npm run test:coverage -- __tests__/lib/rbac.test.ts
```

## 📊 Interpréter les Résultats

### ✅ Tests qui passent
```
PASS __tests__/lib/rbac.test.ts
  RBAC Functions
    ✓ should return true for SUPER_ADMIN (2 ms)
    ✓ should return false for other roles (1 ms)
```

### ❌ Tests qui échouent
```
FAIL __tests__/api/admin/ressources.test.ts
  ● POST /api/admin/ressources › should create resource
  
    expect(received).toBe(expected)
    Expected: 200
    Received: 500
```

### Résumé final
```
Test Suites: 7 failed, 8 passed, 15 total
Tests:       18 failed, 68 passed, 86 total
```

## 🔧 Déboguer un Test

### 1. Voir les erreurs en détail
```bash
npm test -- __tests__/lib/rbac.test.ts --verbose
```

### 2. Utiliser `console.log` dans les tests
Les `console.log` s'affichent automatiquement dans les tests.

### 3. Tester un seul cas
```bash
npm test -- __tests__/lib/rbac.test.ts -t "should return true for SUPER_ADMIN"
```

## 💡 Bonnes Pratiques

1. **Lancez les tests avant de commit** :
   ```bash
   npm test
   ```

2. **Utilisez le mode watch pendant le développement** :
   ```bash
   npm run test:watch
   ```

3. **Vérifiez la couverture avant de déployer** :
   ```bash
   npm run test:coverage
   ```

4. **Testez un fichier spécifique après modification** :
   ```bash
   npm test -- __tests__/lib/rbac.test.ts
   ```

## 🐛 Résoudre les Problèmes Courants

### "Module not found"
Installez les dépendances :
```bash
npm install
```

### "Cannot find module '@/lib/...'"
Vérifiez que le chemin d'alias `@/` est correct dans `jest.config.js`.

### Tests qui passent mais le code ne fonctionne pas
Vérifiez que les mocks correspondent à la réalité du code.

## 📚 Ressources

- [Documentation Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)


