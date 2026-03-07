-- CreateEnum
CREATE TYPE "TypeSondage" AS ENUM ('PUBLIC', 'PRIVE');

-- AlterTable
ALTER TABLE "votes" ADD COLUMN "type" "TypeSondage" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "votes" ALTER COLUMN "created_by_poste_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "votes_type_idx" ON "votes"("type");


