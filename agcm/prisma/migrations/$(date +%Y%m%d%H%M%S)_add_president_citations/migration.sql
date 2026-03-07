-- CreateTable
CREATE TABLE "president_citations" (
    "id" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "president_id" TEXT NOT NULL,
    "mandat_id" TEXT NOT NULL,
    "date_citation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "president_citations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "president_citations_is_published_ordre_idx" ON "president_citations"("is_published", "ordre");

-- CreateIndex
CREATE INDEX "president_citations_mandat_id_idx" ON "president_citations"("mandat_id");

-- AddForeignKey
ALTER TABLE "president_citations" ADD CONSTRAINT "president_citations_president_id_fkey" FOREIGN KEY ("president_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "president_citations" ADD CONSTRAINT "president_citations_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


