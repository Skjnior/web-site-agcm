import type { StatutMembre } from '@prisma/client';

/** Données sérialisées pour une carte d’adhérent (API + UI). */
export type CarteAdhesionMemberDto = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  ville: string | null;
  pays: string | null;
  statutMembre: StatutMembre;
  dateAdhesion: string;
  photoUrl: string | null;
  postesBureau: string | null;
  isAdherentSansCompte: boolean;
};

export type CartesAdhesionApiResponse = {
  generatedAt: string;
  mandatTitre: string | null;
  members: CarteAdhesionMemberDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
