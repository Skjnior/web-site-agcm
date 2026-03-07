// components/home/ServicesSection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ServicesSection() {
  // Données officielles de la documentation technique AGCM
  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Formations certifiantes",
      description: "Programmes de formation continue en audit interne, contrôle de gestion, management des risques. Préparation aux certifications CIA, CRMA, CISA, CFE.",
      features: [
        "Formations présentielles et en ligne",
        "Préparation aux certifications internationales",
        "Formateurs nationaux et internationaux",
        "Attestations de participation"
      ],
      color: "guinea-red",
      link: "/formations"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Événements professionnels",
      description: "Conférences, séminaires, webinaires, ateliers pratiques et assemblées générales pour échanger sur les meilleures pratiques.",
      features: [
        "Conférences thématiques trimestrielles",
        "Webinaires avec experts internationaux",
        "Ateliers pratiques d'audit",
        "Networking entre professionnels"
      ],
      color: "guinea-yellow",
      link: "/evenements"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Bibliothèque professionnelle",
      description: "Accès à une bibliothèque de ressources documentaires : normes, guides méthodologiques, études de cas, rapports annuels et outils d'audit.",
      features: [
        "Normes et standards internationaux",
        "Guides méthodologiques d'audit",
        "Études de cas guinéennes",
        "Publications AGCM exclusives"
      ],
      color: "guinea-green",
      link: "/ressources"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Réseau professionnel",
      description: "Rejoindre le réseau des Guinéens de La Charente-Maritime. Échanges, entraide et projets solidaires.",
      features: [
        "Carte de membre officielle",
        "Annuaire des membres",
        "Groupes de travail sectoriels",
        "Représentation institutionnelle"
      ],
      color: "guinea-red",
      link: "/adhesion"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nos services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            L'AGCM accompagne ses membres dans leur développement professionnel à travers une offre complète de services
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green mx-auto rounded-full mt-6" />
        </div>

        {/* Grille de services */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-${service.color} group`}
            >
              <div className={`w-16 h-16 rounded-xl bg-${service.color}/10 flex items-center justify-center mb-6 text-${service.color} group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              <ul className="space-y-3 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className={`w-5 h-5 text-${service.color} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={service.link}>
                <Button 
                  variant="outline" 
                  className={`w-full border-${service.color} text-${service.color} hover:bg-${service.color} hover:text-white`}
                >
                  En savoir plus
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center bg-gradient-to-r from-guinea-red/10 via-guinea-yellow/10 to-guinea-green/10 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à rejoindre l'AGCM ?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez l'Association des Guinéens de La Charente-Maritime et participez à nos activités culturelles et projets solidaires
          </p>
          <Link href="/adhesion">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-guinea-red to-guinea-red/90 hover:from-guinea-red/90 hover:to-guinea-red"
            >
              Demander votre adhésion
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
