-- CreateEnum
CREATE TYPE "RoleSysteme" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "StatutMembre" AS ENUM ('ACTIF', 'SUSPENDU', 'RADIE');

-- CreateEnum
CREATE TYPE "StatutMandat" AS ENUM ('ACTIF', 'EXPIRE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "StatutAffectation" AS ENUM ('ACTIF', 'INACTIF', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE');

-- CreateEnum
CREATE TYPE "VisibiliteCible" AS ENUM ('PRIVE_BUREAU', 'PUBLIC_MEMBRES', 'PUBLIC_SITE');

-- CreateEnum
CREATE TYPE "StatutWorkflow" AS ENUM ('BROUILLON', 'SOUMIS', 'APPROUVE', 'REJETE', 'PUBLIE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ProjetStatut" AS ENUM ('BROUILLON', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE');

-- CreateEnum
CREATE TYPE "ProjetMediaType" AS ENUM ('IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "EventStatut" AS ENUM ('PASSE', 'EN_COURS', 'A_VENIR');

-- CreateEnum
CREATE TYPE "DemandeStatut" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "DonationIntentType" AS ENUM ('FINANCIER', 'MATERIEL', 'AUTRE');

-- CreateEnum
CREATE TYPE "DonationIntentStatut" AS ENUM ('NOUVEAU', 'CONTACTE', 'CONFIRME', 'CLASSE_SANS_SUITE');

-- CreateEnum
CREATE TYPE "ContactStatut" AS ENUM ('NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "SubventionType" AS ENUM ('SUBVENTION', 'AIDE', 'DON');

-- CreateEnum
CREATE TYPE "SubventionStatut" AS ENUM ('DEMANDEE', 'ACCORDEE', 'REFUSEE', 'VERSEE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT', 'ASSIGN', 'INACTIVATE', 'ARCHIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_systeme" "RoleSysteme" NOT NULL DEFAULT 'MEMBER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "photo_url" TEXT,
    "bio" TEXT,
    "statut_membre" "StatutMembre" NOT NULL DEFAULT 'ACTIF',
    "date_adhesion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandats" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "statut" "StatutMandat" NOT NULL DEFAULT 'ACTIF',
    "pv_document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "est_bureau" BOOLEAN NOT NULL DEFAULT true,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affectations_poste" (
    "id" TEXT NOT NULL,
    "mandat_id" TEXT NOT NULL,
    "poste_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "statut" "StatutAffectation" NOT NULL DEFAULT 'ACTIF',
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "raison_inactivation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affectations_poste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT,
    "lien_externe" TEXT,
    "image_principale" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibilite_cible" "VisibiliteCible" NOT NULL,
    "statut_workflow" "StatutWorkflow" NOT NULL DEFAULT 'BROUILLON',
    "auteur_poste_id" TEXT NOT NULL,
    "mandat_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "auteur_user_id" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "auteur_user_id" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "objectif" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actions" TEXT,
    "statut" "ProjetStatut" NOT NULL DEFAULT 'BROUILLON',
    "visibilite_site" BOOLEAN NOT NULL DEFAULT false,
    "responsable_poste_id" TEXT NOT NULL,
    "mandat_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets_media" (
    "id" TEXT NOT NULL,
    "projet_id" TEXT NOT NULL,
    "type" "ProjetMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projets_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "site_url" TEXT,
    "type" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "visibilite_site" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets_partners" (
    "projet_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projets_partners_pkey" PRIMARY KEY ("projet_id","partner_id")
);

-- CreateTable
CREATE TABLE "subventions" (
    "id" TEXT NOT NULL,
    "projet_id" TEXT,
    "organisme" TEXT NOT NULL,
    "type" "SubventionType" NOT NULL,
    "montant" DECIMAL(18,2) NOT NULL,
    "statut" "SubventionStatut" NOT NULL DEFAULT 'DEMANDEE',
    "documents_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "responsable_financier_poste_id" TEXT NOT NULL,

    CONSTRAINT "subventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "lieu" TEXT,
    "statut" "EventStatut" NOT NULL DEFAULT 'A_VENIR',
    "affiche_site" BOOLEAN NOT NULL DEFAULT false,
    "created_by_poste_id" TEXT NOT NULL,
    "mandat_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events_media" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_principale" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_adhesion" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "message" TEXT,
    "statut" "DemandeStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "processed_by_id" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_adhesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_partenariat" (
    "id" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "contact_nom" TEXT,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "type_partenariat" TEXT,
    "message" TEXT,
    "statut" "DemandeStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "processed_by_id" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_partenariat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_intents" (
    "id" TEXT NOT NULL,
    "type" "DonationIntentType" NOT NULL,
    "montant_estime" DECIMAL(18,2),
    "description" TEXT,
    "nom" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "statut" "DonationIntentStatut" NOT NULL DEFAULT 'NOUVEAU',
    "handled_by_poste_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_contact" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "statut" "ContactStatut" NOT NULL DEFAULT 'NOUVEAU',
    "destinataire_poste_id" TEXT,
    "assigned_to_poste_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bureau_messages" (
    "id" TEXT NOT NULL,
    "scope" "VisibiliteCible" NOT NULL,
    "auteur_user_id" TEXT NOT NULL,
    "mandat_id" TEXT,
    "texte" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bureau_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_user_id_key" ON "members"("user_id");

-- CreateIndex
CREATE INDEX "members_nom_prenom_idx" ON "members"("nom", "prenom");

-- CreateIndex
CREATE INDEX "mandats_statut_idx" ON "mandats"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "postes_nom_key" ON "postes"("nom");

-- CreateIndex
CREATE INDEX "affectations_poste_mandat_id_statut_idx" ON "affectations_poste"("mandat_id", "statut");

-- CreateIndex
CREATE INDEX "affectations_poste_poste_id_statut_idx" ON "affectations_poste"("poste_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "affectations_poste_mandat_id_poste_id_member_id_key" ON "affectations_poste"("mandat_id", "poste_id", "member_id");

-- CreateIndex
CREATE INDEX "contents_mandat_id_visibilite_cible_statut_workflow_idx" ON "contents"("mandat_id", "visibilite_cible", "statut_workflow");

-- CreateIndex
CREATE INDEX "contents_type_statut_workflow_idx" ON "contents"("type", "statut_workflow");

-- CreateIndex
CREATE INDEX "comments_content_id_created_at_idx" ON "comments"("content_id", "created_at");

-- CreateIndex
CREATE INDEX "ratings_content_id_idx" ON "ratings"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_content_id_auteur_user_id_key" ON "ratings"("content_id", "auteur_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "projets_slug_key" ON "projets"("slug");

-- CreateIndex
CREATE INDEX "projets_mandat_id_statut_visibilite_site_idx" ON "projets"("mandat_id", "statut", "visibilite_site");

-- CreateIndex
CREATE INDEX "projets_media_projet_id_ordre_idx" ON "projets_media"("projet_id", "ordre");

-- CreateIndex
CREATE INDEX "partners_visibilite_site_idx" ON "partners"("visibilite_site");

-- CreateIndex
CREATE INDEX "subventions_statut_type_idx" ON "subventions"("statut", "type");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_affiche_site_statut_date_debut_idx" ON "events"("affiche_site", "statut", "date_debut");

-- CreateIndex
CREATE INDEX "events_media_event_id_ordre_idx" ON "events_media"("event_id", "ordre");

-- CreateIndex
CREATE INDEX "demandes_adhesion_statut_created_at_idx" ON "demandes_adhesion"("statut", "created_at");

-- CreateIndex
CREATE INDEX "demandes_partenariat_statut_created_at_idx" ON "demandes_partenariat"("statut", "created_at");

-- CreateIndex
CREATE INDEX "donation_intents_statut_created_at_idx" ON "donation_intents"("statut", "created_at");

-- CreateIndex
CREATE INDEX "messages_contact_statut_created_at_idx" ON "messages_contact"("statut", "created_at");

-- CreateIndex
CREATE INDEX "bureau_messages_scope_created_at_idx" ON "bureau_messages"("scope", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations_poste" ADD CONSTRAINT "affectations_poste_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations_poste" ADD CONSTRAINT "affectations_poste_poste_id_fkey" FOREIGN KEY ("poste_id") REFERENCES "postes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations_poste" ADD CONSTRAINT "affectations_poste_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_auteur_poste_id_fkey" FOREIGN KEY ("auteur_poste_id") REFERENCES "postes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_auteur_user_id_fkey" FOREIGN KEY ("auteur_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_auteur_user_id_fkey" FOREIGN KEY ("auteur_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_responsable_poste_id_fkey" FOREIGN KEY ("responsable_poste_id") REFERENCES "postes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets_media" ADD CONSTRAINT "projets_media_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets_partners" ADD CONSTRAINT "projets_partners_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets_partners" ADD CONSTRAINT "projets_partners_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subventions" ADD CONSTRAINT "subventions_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "projets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subventions" ADD CONSTRAINT "subventions_responsable_financier_poste_id_fkey" FOREIGN KEY ("responsable_financier_poste_id") REFERENCES "postes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_poste_id_fkey" FOREIGN KEY ("created_by_poste_id") REFERENCES "postes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_media" ADD CONSTRAINT "events_media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_adhesion" ADD CONSTRAINT "demandes_adhesion_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_partenariat" ADD CONSTRAINT "demandes_partenariat_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_intents" ADD CONSTRAINT "donation_intents_handled_by_poste_id_fkey" FOREIGN KEY ("handled_by_poste_id") REFERENCES "postes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_contact" ADD CONSTRAINT "messages_contact_destinataire_poste_id_fkey" FOREIGN KEY ("destinataire_poste_id") REFERENCES "postes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_contact" ADD CONSTRAINT "messages_contact_assigned_to_poste_id_fkey" FOREIGN KEY ("assigned_to_poste_id") REFERENCES "postes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bureau_messages" ADD CONSTRAINT "bureau_messages_auteur_user_id_fkey" FOREIGN KEY ("auteur_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bureau_messages" ADD CONSTRAINT "bureau_messages_mandat_id_fkey" FOREIGN KEY ("mandat_id") REFERENCES "mandats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

