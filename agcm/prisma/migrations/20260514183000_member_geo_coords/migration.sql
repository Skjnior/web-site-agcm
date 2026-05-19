-- Atlas territorial : coordonnées optionnelles pour la carte des membres (présidence / admin)

ALTER TABLE "members" ADD COLUMN "geo_lat" DOUBLE PRECISION;
ALTER TABLE "members" ADD COLUMN "geo_lng" DOUBLE PRECISION;
