# Correspondance seed — bureau (mandat actif)

Généré par `prisma/seed.ts` : affectations `postes[0]` … `postes[14]` pour les **15 premières** affectations au mandat actif.

**Mot de passe pour tous les comptes de test** : `password123`

| Poste (fonction) | Email | Rôle système |
|------------------|--------|--------------|
| Président | user1@agcm.gn | SUPER_ADMIN |
| Vice-Président | user2@agcm.gn | ADMIN |
| Secrétaire général | user3@agcm.gn | ADMIN |
| Secrétaire adjoint | user4@agcm.gn | ADMIN |
| Trésorier | user5@agcm.gn | ADMIN |
| Trésorier adjoint | user6@agcm.gn | ADMIN |
| Responsable communication | user7@agcm.gn | MEMBER |
| Responsable projets | user8@agcm.gn | MEMBER |
| Responsable événements | user9@agcm.gn | MEMBER |
| Responsable partenariats | user10@agcm.gn | MEMBER |
| Responsable formation | user11@agcm.gn | MEMBER |
| Responsable jeunesse | user12@agcm.gn | MEMBER |
| Responsable culture | user13@agcm.gn | MEMBER |
| Responsable social | user14@agcm.gn | MEMBER |
| Responsable sport | user15@agcm.gn | MEMBER |

## Navigation après connexion

- **user1 → user6** : redirection typique vers **`/admin`**.
- **user7 → user15** : **`/dashboard`** → **`/bureau`** (membre avec poste bureau actif).

Valable après un seed complet (`npx prisma db seed`), sans modification manuelle des affectations.
