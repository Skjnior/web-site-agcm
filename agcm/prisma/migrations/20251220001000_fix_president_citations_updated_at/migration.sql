-- Fix pour la colonne updated_at dans president_citations
-- Ajouter la valeur par défaut
ALTER TABLE president_citations 
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- Mettre à jour les valeurs NULL existantes (si nécessaire)
UPDATE president_citations 
SET updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;


