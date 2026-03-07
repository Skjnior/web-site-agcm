# Guide de Tests - AGCM

Ce document décrit la stratégie de tests et comment exécuter les tests du projet AGCM.

## Structure des Tests

```
__tests__/
├── api/                    # Tests d'intégration API
│   ├── admin/
│   │   └── approbations.test.ts
│   └── bureau/
│       └── contents.test.ts
├── components/              # Tests de composants React
│   ├── ui/
│   │   └── Badge.test.tsx
│   └── bureau/
│       └── ContentPreview.test.tsx
├── hooks/                   # Tests de hooks
│   └── use-pagination.test.ts
├── lib/                     # Tests unitaires utilitaires
│   ├── rbac.test.ts
│   ├── pagination.test.ts
│   ├── audit.test.ts
│   └── mandat.test.ts
├── validators/              # Tests de validation
│   └── content.test.ts
└── workflows/               # Tests E2E de workflows
    └── content-approval.test.ts
```

## Types de Tests

### 1. Tests Unitaires

Testent les fonctions isolées sans dépendances externes.

**Exemples :**
- `lib/rbac.test.ts` - Fonctions de permissions
- `lib/pagination.test.ts` - Utilitaires de pagination
- `validators/content.test.ts` - Validation Zod

### 2. Tests d'Intégration

Testent les interactions entre plusieurs modules, notamment les API routes.

**Exemples :**
- `api/admin/approbations.test.ts` - Workflow d'approbation
- `api/bureau/contents.test.ts` - Création et soumission de contenu

### 3. Tests de Composants

Testent les composants React avec React Testing Library.

**Exemples :**
- `components/ui/Badge.test.tsx` - Composant Badge
- `components/bureau/ContentPreview.test.tsx` - Modal de prévisualisation

### 4. Tests E2E (Workflows)

Testent des scénarios complets de bout en bout.

**Exemples :**
- `workflows/content-approval.test.ts` - Workflow complet d'approbation

## Exécution des Tests

### Tous les tests
```bash
npm test
```

### Mode watch (développement)
```bash
npm run test:watch
```

### Avec couverture de code
```bash
npm run test:coverage
```

### Un fichier spécifique
```bash
npm test -- __tests__/lib/rbac.test.ts
```

### Un pattern
```bash
npm test -- --testNamePattern="should approve content"
```

## Configuration

### Jest Config (`jest.config.js`)

- **Environnement** : `jest-environment-jsdom` pour les tests React
- **Coverage** : Collecte depuis `src/**/*.{js,jsx,ts,tsx}`
- **Mocks** : Configuration dans `jest.setup.js`

### Setup (`jest.setup.js`)

- Mocks Next.js (router, Image, next-auth)
- Mocks Prisma Client
- Configuration des variables d'environnement de test
- Polyfills pour Request/Response

## Bonnes Pratiques

### 1. Structure AAA (Arrange-Act-Assert)

```typescript
it('should approve content successfully', async () => {
  // Arrange
  const mockContent = { id: 'content-1', statutWorkflow: 'SOUMIS' };
  (prisma.content.findUnique as jest.Mock).mockResolvedValue(mockContent);

  // Act
  const response = await approveContent(request, { params: { contentId: 'content-1' } });

  // Assert
  expect(response.status).toBe(200);
  expect(prisma.content.update).toHaveBeenCalled();
});
```

### 2. Isolation des Tests

Chaque test doit être indépendant. Utiliser `beforeEach` pour réinitialiser les mocks :

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. Mocks Appropriés

- **Prisma** : Mocké globalement dans `jest.setup.js`
- **Next.js** : Router, Image, navigation mockés
- **next-auth** : Session mockée

### 4. Tests de Permissions

Toujours tester les cas d'erreur de permissions :

```typescript
it('should return 403 if user has no active affectation', async () => {
  (getAffectationActive as jest.Mock).mockResolvedValue(null);
  // ...
  expect(response.status).toBe(403);
});
```

## Couverture de Code

La couverture cible est de **80% minimum** pour :
- Fonctions utilitaires (`lib/`)
- API routes critiques
- Composants réutilisables

Exclure de la couverture :
- Pages Next.js (`app/**/page.tsx`)
- Layouts (`app/**/layout.tsx`)
- Types et interfaces

## CI/CD

Les tests s'exécutent automatiquement sur :
- Push vers `main` ou `develop`
- Pull Requests

Voir `.github/workflows/test.yml` pour la configuration CI.

## Dépannage

### Erreur "Request is not defined"
- Vérifier que `undici` est installé
- Vérifier les polyfills dans `jest.setup.js`

### Erreur "Cannot find module '@prisma/client'"
- Exécuter `npx prisma generate`
- Vérifier que Prisma est mocké dans `jest.setup.js`

### Tests qui échouent de manière aléatoire
- Vérifier l'isolation des tests
- S'assurer que les mocks sont réinitialisés dans `beforeEach`

## Prochaines Étapes

- [ ] Ajouter des tests pour tous les composants UI
- [ ] Tests E2E avec Playwright
- [ ] Tests de performance
- [ ] Tests d'accessibilité (a11y)



