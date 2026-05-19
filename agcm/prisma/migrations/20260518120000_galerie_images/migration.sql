-- Galerie publique : stockage des images avec visibilité site
CREATE TABLE "galerie_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "visible_site" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galerie_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "galerie_images_visible_site_ordre_idx" ON "galerie_images"("visible_site", "ordre");

ALTER TABLE "galerie_images" ADD CONSTRAINT "galerie_images_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
