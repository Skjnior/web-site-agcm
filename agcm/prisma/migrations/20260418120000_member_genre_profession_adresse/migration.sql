-- CreateEnum
CREATE TYPE "GenreMembre" AS ENUM ('FEMME', 'HOMME', 'AUTRE', 'NE_PAS_DIRE');

-- AlterTable
ALTER TABLE "members" ADD COLUMN "genre" "GenreMembre";
ALTER TABLE "members" ADD COLUMN "date_naissance" DATE;
ALTER TABLE "members" ADD COLUMN "profession" TEXT;
ALTER TABLE "members" ADD COLUMN "adresse" TEXT;
