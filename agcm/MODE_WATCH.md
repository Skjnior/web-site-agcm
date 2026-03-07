# 🔄 Mode Watch - Guide d'Utilisation

## ✅ Vous êtes en mode watch !

Le mode watch surveille vos fichiers et relance automatiquement les tests quand vous les modifiez.

## ⌨️ Commandes Disponibles

### Commandes principales
- **`a`** → Exécuter tous les tests
- **`f`** → Exécuter seulement les tests qui ont échoué
- **`q`** → Quitter le mode watch
- **`Enter`** → Relancer les tests manuellement

### Filtrage
- **`p`** → Filtrer par nom de fichier (pattern)
  - Exemple : tapez `rbac` pour tester seulement les fichiers contenant "rbac"
- **`t`** → Filtrer par nom de test (pattern)
  - Exemple : tapez `should return true` pour tester seulement ces tests

### Autres commandes
- **`u`** → Mettre à jour les snapshots (si vous utilisez des snapshots)
- **`i`** → Mode interactif (sélectionner interactivement les fichiers à tester)

## 💡 Workflow Recommandé

1. **Lancez le mode watch** :
   ```bash
   npm run test:watch -- __tests__/lib/rbac.test.ts
   ```

2. **Modifiez votre code** dans `src/lib/rbac.ts` ou le test

3. **Les tests se relancent automatiquement** ✅

4. **Corrigez les erreurs** et les tests se relancent à nouveau

5. **Quittez avec `q`** quand vous avez terminé

## 🎯 Exemples d'Utilisation

### Tester tous les fichiers RBAC
```bash
npm run test:watch -- __tests__/lib/rbac
```

### Tester toutes les API
```bash
npm run test:watch -- __tests__/api
```

### Tester tout le projet
```bash
npm run test:watch
```

## 🔍 Astuces

- **Modifiez un fichier** → Les tests se relancent automatiquement
- **Sauvegardez** → Les tests se relancent automatiquement
- **Appuyez sur `Enter`** → Relance manuelle des tests
- **Appuyez sur `f`** → Teste seulement les échecs (utile après correction)

## ⚠️ Note

Le mode watch reste actif jusqu'à ce que vous appuyiez sur `q` pour quitter.


