# 🧪 Guide des Tests - AGCM

## 📋 Commandes disponibles

### 1. Exécuter tous les tests
```bash
npm test
```

### 2. Mode watch (re-exécution automatique lors des modifications)
```bash
npm run test:watch
```

### 3. Tests avec couverture de code
```bash
npm run test:coverage
```
Cela génère un rapport de couverture dans `coverage/` montrant quelles parties du code sont testées.

### 4. Exécuter un fichier de test spécifique
```bash
npm test -- __tests__/lib/rbac.test.ts
```

### 5. Exécuter plusieurs fichiers de test
```bash
npm test -- __tests__/lib/rbac.test.ts __tests__/lib/pagination.test.ts
```

### 6. Filtrer par nom de test
```bash
npm test -- --testNamePattern="should return true"
```

### 7. Mode verbose (afficher tous les détails)
```bash
npm test -- --verbose
```

### 8. Exécuter seulement les tests qui ont échoué
```bash
npm test -- --onlyFailures
```

## 📁 Structure des tests

Les tests sont organisés dans le dossier `__tests__/` :

```
__tests__/
├── api/
│   ├── admin/
│   │   ├── approbations.test.ts
│   │   ├── ressources.test.ts
│   │   └── upload.test.ts
│   ├── bureau/
│   │   └── contents.test.ts
│   └── ressources/
│       └── download.test.ts
├── components/
│   ├── bureau/
│   │   └── ContentPreview.test.tsx
│   └── ui/
│       └── Badge.test.tsx
├── hooks/
│   └── use-pagination.test.ts
├── lib/
│   ├── audit.test.ts
│   ├── file-upload.test.ts
│   ├── mandat.test.ts
│   ├── pagination.test.ts
│   └── rbac.test.ts
├── validators/
│   └── content.test.ts
└── workflows/
    └── content-approval.test.ts
```

## 🎯 Types de tests

### Tests unitaires
Testent des fonctions isolées :
- `__tests__/lib/rbac.test.ts` - Fonctions RBAC
- `__tests__/lib/pagination.test.ts` - Helpers de pagination
- `__tests__/validators/content.test.ts` - Validation Zod

### Tests d'intégration
Testent les API routes :
- `__tests__/api/admin/approbations.test.ts` - API d'approbation
- `__tests__/api/bureau/contents.test.ts` - API de contenu

### Tests de composants
Testent les composants React :
- `__tests__/components/ui/Badge.test.tsx` - Composant Badge
- `__tests__/components/bureau/ContentPreview.test.tsx` - Aperçu de contenu

### Tests E2E (End-to-End)
Testent des workflows complets :
- `__tests__/workflows/content-approval.test.ts` - Workflow d'approbation

## 🔧 Configuration

### Fichiers de configuration
- `jest.config.js` - Configuration Jest
- `jest.setup.js` - Setup global (mocks, polyfills)

### Variables d'environnement de test
Les variables sont définies dans `jest.setup.js` :
- `NEXTAUTH_SECRET` - Secret pour NextAuth
- `DATABASE_URL` - URL de la base de données de test
- `NEXTAUTH_URL` - URL de l'application

## 📊 Interprétation des résultats

### ✅ Tests qui passent
```
PASS __tests__/lib/pagination.test.ts
  Pagination Utilities
    ✓ should parse default pagination (10 ms)
    ✓ should parse custom page and limit (2 ms)
```

### ❌ Tests qui échouent
```
FAIL __tests__/lib/rbac.test.ts
  RBAC Functions
    ✕ should return true when user has active bureau affectation (3 ms)
    
    expect(received).toBe(expected)
    Expected: true
    Received: false
```

## 🐛 Déboguer un test

### 1. Mode verbose
```bash
npm test -- --verbose
```

### 2. Afficher les console.log
Par défaut, les `console.log` sont affichés dans les tests.

### 3. Utiliser `debugger`
Ajoutez `debugger;` dans votre test, puis lancez :
```bash
node --inspect-brk node_modules/.bin/jest --runInBand __tests__/lib/rbac.test.ts
```

## 📝 Écrire de nouveaux tests

### Structure d'un test
```typescript
describe('Nom du groupe de tests', () => {
  beforeEach(() => {
    // Setup avant chaque test
  });

  it('devrait faire quelque chose', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Exemples de matchers Jest
```typescript
expect(value).toBe(4);                    // Égalité stricte
expect(value).toEqual({ a: 1 });         // Égalité profonde
expect(value).toBeTruthy();              // Vrai
expect(value).toBeFalsy();               // Faux
expect(value).toContain('text');          // Contient
expect(value).toHaveLength(3);            // Longueur
expect(fn).toHaveBeenCalled();           // Fonction appelée
expect(fn).toHaveBeenCalledWith(arg);     // Appelée avec argument
```

## 🚀 Bonnes pratiques

1. **Nommer clairement les tests** : Utiliser des descriptions claires
2. **Un test = une assertion** : Tester une seule chose à la fois
3. **Isoler les tests** : Chaque test doit être indépendant
4. **Nettoyer après** : Utiliser `beforeEach` et `afterEach` pour nettoyer
5. **Mocker les dépendances** : Ne pas dépendre de services externes

## 📚 Ressources

- [Documentation Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)


