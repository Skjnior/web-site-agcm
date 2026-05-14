-- CreateTable
CREATE TABLE "member_registre_cotisations" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "date_reference" DATE NOT NULL,
    "situation_text" TEXT NOT NULL DEFAULT '',
    "absences_text" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_registre_cotisations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_registre_cotisations_date_reference_idx" ON "member_registre_cotisations"("date_reference");

-- CreateIndex
CREATE UNIQUE INDEX "member_registre_cotisations_member_id_date_reference_key" ON "member_registre_cotisations"("member_id", "date_reference");

-- AddForeignKey
ALTER TABLE "member_registre_cotisations" ADD CONSTRAINT "member_registre_cotisations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_registre_cotisations" ADD CONSTRAINT "member_registre_cotisations_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
