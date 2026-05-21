# Pourquoi `connection_limit` disparaît sur Vercel au redeploy

## Cause

Si le projet Vercel est lié à **Prisma Postgres** (Storage → intégration), Vercel resynchronise à **chaque déploiement** des variables du type :

- `agcm_db_DATABASE_URL`
- `agcm_db_POSTGRES_URL`
- `agcm_db_PRISMA_DATABASE_URL`

Ces URLs viennent du tableau de bord Prisma **sans** `connection_limit` ni `pool_timeout`. Si vous modifiez à la main `DATABASE_URL` dans Vercel, la valeur peut sembler « disparaître » après un redeploy : l’intégration repousse sa version officielle.

Ce n’est en général **pas** un bug de votre saisie : c’est le comportement de la sync d’intégration.

## Ce que fait déjà le code (depuis le commit `3b5584e`)

Dans `src/lib/prisma.ts`, la fonction `ensureConnectionLimit()` ajoute automatiquement :

`connection_limit=3&pool_timeout=20`

à l’URL utilisée par l’application, **même si** le dashboard Vercel n’affiche pas ces paramètres.

Le client lit `DATABASE_URL` **ou**, en secours, `agcm_db_DATABASE_URL` (nom injecté par l’intégration).

## Ce que vous devez faire sur Vercel

1. **Settings → Environment Variables → Production** (et Preview si besoin).
2. Vérifier qu’**au moins une** de ces variables existe et pointe vers Prisma Postgres :
   - `DATABASE_URL` **ou**
   - `agcm_db_DATABASE_URL`
3. **Ne pas vous fier** à l’affichage de `&connection_limit=3` dans l’UI : après redeploy il peut disparaître alors que le runtime l’ajoute quand même.
4. Redéployer la branche **`develop`** (dernier fix pool + page-view) : Deployments → Redeploy, option **sans cache** si doute.
5. **Tracking visites** : désactivé en production par défaut (depuis le correctif pool). Pour le réactiver : `ENABLE_PAGE_VIEWS=1`. En urgence : `DISABLE_PAGE_VIEWS=1`.

## Option durable côté infra

- **Prisma Accelerate** : URL `prisma+postgres://…` (pooling géré par Prisma) — recommandé pour la prod serverless.
- **Ou** délier l’intégration et gérer `DATABASE_URL` uniquement à la main (vous assumez les mises à jour de mot de passe).
- **Ou** dupliquer la même URL (avec pool si vous voulez) sur `DATABASE_URL` **et** les trois `agcm_db_*` — fastidieux car la sync peut les réécraser.

## Sécurité

Ne commitez pas `.env.production`. Si une URL a été exposée (chat, capture d’écran), **régénérez** les identifiants dans Prisma Data Platform et mettez à jour les variables Vercel.
