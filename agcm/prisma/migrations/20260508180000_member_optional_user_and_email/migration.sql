-- Adhérents : fiche Member sans compte User (user_id NULL, email renseigné).
-- Membres avec compte : user_id requis côté métier pour les postes au bureau.

ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "email" TEXT;

UPDATE "members" AS m
SET "email" = u."email"
FROM "users" AS u
WHERE m."user_id" = u."id" AND (m."email" IS NULL OR m."email" = '');

ALTER TABLE "members" ALTER COLUMN "user_id" DROP NOT NULL;

CREATE UNIQUE INDEX "members_email_key" ON "members"("email");
