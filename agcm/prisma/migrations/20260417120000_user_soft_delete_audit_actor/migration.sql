-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "actor_email" TEXT;

-- Backfill actor email from users (traçabilité pour les logs existants)
UPDATE "audit_logs" AS al
SET "actor_email" = u."email"
FROM "users" AS u
WHERE al."user_id" = u."id" AND al."actor_email" IS NULL;

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_user_id_fkey";

-- AlterColumn
ALTER TABLE "audit_logs" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_actor_email_idx" ON "audit_logs"("actor_email");
