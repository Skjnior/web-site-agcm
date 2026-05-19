-- Table analytics des visites (schéma PageView), absente des migrations initiales.

CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "country_code" TEXT,
    "city" TEXT,
    "region" TEXT,
    "isp" TEXT,
    "is_proxy" BOOLEAN NOT NULL DEFAULT false,
    "session_id" TEXT,
    "user_id" TEXT,
    "status_code" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "page_views_path_created_at_idx" ON "page_views"("path", "created_at");
CREATE INDEX "page_views_user_id_created_at_idx" ON "page_views"("user_id", "created_at");
CREATE INDEX "page_views_ip_address_created_at_idx" ON "page_views"("ip_address", "created_at");
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");

ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
