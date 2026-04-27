import type { SitePublicPayload } from '@/types/site-public';

/** Valeurs par défaut + base pour le seed Prisma (`SitePublicPage`). */
export const SITE_PUBLIC_DEFAULT_PAYLOAD: SitePublicPayload = {
  version: 1,
  hero: {
    badge: 'AGCM-GCM',
    title: 'Unis par nos racines, engagés pour notre avenir.',
    paragraph:
      "L'AGCM fédère et accompagne les Guinéens de La Charente-Maritime, valorise notre culture et porte des projets solidaires ici et en Guinée.",
    backgroundUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    highlights: [
      {
        title: 'Solidarité & accueil',
        text: 'Mentorat, aide administrative, accompagnement.',
        icon: 'heart',
      },
      {
        title: 'Jeunesse & insertion',
        text: 'Orientation, stages, ateliers pro.',
        icon: 'book',
      },
      {
        title: 'Projets en Guinée',
        text: 'Éducation, santé, environnement.',
        icon: 'globe',
      },
    ],
  },
  axes: [
    {
      title: 'Intégration & solidarité locale',
      text:
        "Accompagnement des nouveaux arrivants, soutien administratif, aide à l'orientation et mentorat.",
    },
    {
      title: 'Culture & cohésion communautaire',
      text:
        'Événements, sport, cuisine et musique pour rassembler la communauté guinéenne et ses amis.',
    },
    {
      title: 'Projets humanitaires en Guinée',
      text: 'Soutien aux écoles, centres de santé, environnement et aide matérielle sur le terrain.',
    },
  ],
  history: {
    tagline: 'Histoire & valeurs',
    title: 'Née pour fédérer et soutenir',
    body:
      "L'AGCM est née de la volonté de Guinéens de La Rochelle de créer un espace d'entraide et d'intégration. Depuis 2023, nous accompagnons la communauté, renforçons les liens sociaux, valorisons notre culture et soutenons des projets humanitaires.",
    valeurLabels: ['Solidarité', 'Respect', 'Engagement', 'Cohésion', 'Culture & Identité'],
    bureauTeaser:
      'Une équipe engagée pour coordonner projets locaux et humanitaires.',
  },
  jeunesse: {
    tagline: 'Jeunesse & intégration',
    title: 'Accompagner les jeunes',
    items: [
      'Aide aux démarches (CAF, préfecture, école)',
      'Orientation / réussite scolaire',
      'Recherche de stage / job étudiant',
      'Mentorat par les anciens',
      'Ateliers insertion professionnelle',
      'Soutien moral aux nouveaux arrivants',
    ],
  },
  guineeSection: {
    eyebrow: 'Projets en Guinée',
    title: 'Agir sur le terrain',
    intro:
      "Nous soutenons des actions concrètes pour l'éducation, la santé et l'environnement.",
  },
  projetsLocaux: {
    eyebrow: 'Projets locaux',
    title: 'Agir en Charente-Maritime',
    lead:
      'Actions solidaires, événements culturels, activités sportives et soutien aux jeunes sur le territoire.',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    bullets: [
      'Événements culturels et cohésion',
      'Actions solidaires locales',
      'Sport, rencontres et intégration',
    ],
  },
  adhesion: {
    intro:
      "Rejoignez l'association pour participer aux activités, recevoir les infos et soutenir les projets.",
    bullets: [
      'Accès aux événements et groupes',
      'Info en priorité et accompagnement',
      'Cotisation annuelle (montant à préciser)',
    ],
    cotisationHint: 'Cotisation annuelle (montant à préciser)',
  },
  partenaires: {
    eyebrow: 'Partenaires & mécènes',
    title: 'Construire ensemble',
    items: [
      'Associations locales',
      'Entreprises solidaires',
      'Mairies / structures municipales',
      'Clubs sportifs',
      'Organisations guinéennes',
      'Mécènes individuels',
    ],
  },
  faq: {
    eyebrow: 'Questions fréquentes',
    title: 'Besoin de réponses ?',
    subtitle: 'Réponses aux questions les plus fréquentes',
    items: [
      {
        q: 'Comment adhérer ?',
        a: "Remplissez le formulaire d'adhésion et réglez la cotisation annuelle (montant indiqué lors de l'inscription).",
      },
      {
        q: 'Faut-il être guinéen ?',
        a: "L'association est ouverte à tous. La plupart des membres sont guinéens, mais les soutiens extérieurs sont bienvenus.",
      },
      {
        q: 'Puis-je faire un don ?',
        a: "Oui, les dons soutiennent directement les projets en Guinée et les actions locales. Une page transparence présente l'usage des fonds.",
      },
      {
        q: 'Comment participer aux activités ?',
        a: 'Consultez le calendrier des événements et inscrivez-vous. Les infos pratiques sont partagées aux membres.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'On reste en lien',
    lead:
      "Horaires d'échange (indicatif) : Lundi - Vendredi, 18h-21h. Lien WhatsApp / Messenger sur demande.",
    phone: '—',
    whatsappLine: 'WhatsApp / Messenger (sur demande)',
    regionLine: 'Charente-Maritime • France',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2687.674410555554!2d-1.1511393239070596!3d46.161579279053004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x480153c0fc4d4f73%3A0x40d37521e0dec60!2sLa%20Rochelle!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr',
  },
  gallery: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop',
      alt: 'Moment partagé - Événement communautaire',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop',
      alt: 'Moment partagé - Activité culturelle',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&sat=-15',
      alt: 'Moment partagé - Rassemblement',
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&auto=format&fit=crop',
      alt: 'Moment partagé - Solidarité',
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop',
      alt: 'Moment partagé - Sport',
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop',
      alt: 'Moment partagé - Culture',
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop',
      alt: 'Moment partagé - Éducation',
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop',
      alt: 'Moment partagé - Intégration',
    },
  ],
  about: {
    hero: {
      backgroundUrl:
        'https://images.unsplash.com/photo-1523050335456-c7884704b129?auto=format&fit=crop&w=1920&q=80',
      badge: 'Découvrez notre histoire',
      title: "À propos de l'AGCM",
      subtitle:
        "Une communauté unie au service de l'intégration en Charente-Maritime et du développement solidaire en Guinée.",
    },
    partners: {
      eyebrow: 'Nos Partenaires',
      title: 'Ils nous font confiance',
      lead:
        "L'AGCM collabore avec des institutions et associations locales pour porter haut les couleurs de la Guinée et soutenir notre communauté.",
      items: [
        {
          name: 'Mairie de La Rochelle',
          description:
            "Partenaire privilégié pour l'organisation d'événements culturels et l'intégration locale en Charente-Maritime.",
          logo:
            'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=200&h=200&q=80',
          type: 'Institutionnel',
        },
        {
          name: 'France Travail / Mission Locale',
          description:
            'Accompagnement de nos jeunes membres guinéens dans leur insertion professionnelle et recherche de stages.',
          logo:
            'https://images.unsplash.com/photo-1454165833767-027508659d91?auto=format&fit=crop&w=200&h=200&q=80',
          type: 'Social',
        },
        {
          name: 'Associations Solidaires',
          description:
            "Réseau d'associations locales collaborant sur des projets humanitaires en direction de la Guinée.",
          logo:
            'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=200&h=200&q=80',
          type: 'Humanitaire',
        },
      ],
    },
  },
};
