// components/home/MemberTypesSection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MemberTypesSection() {
  // Données officielles Article 5 des Statuts + Article 5-2 du Règlement Intérieur
  const memberTypes = [
    {
      type: "Membre actif",
      badge: "PROFESSIONNEL",
      description: "Professionnels ayant une responsabilité directe ou indirecte dans le domaine de l'audit interne, soit en pratiquant dans ce domaine, soit parce que ce domaine est placé sous leur dépendance organisationnelle.",
      benefits: [
        "Droit de vote aux Assemblées Générales",
        "Éligible au Conseil d'Administration",
        "Accès complet aux formations",
        "Carte de membre officielle",
        "Annuaire des membres"
      ],
      // TODO: Mettre à jour la cotisation réelle
      cotisation: "12 000 GNF / an",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "guinea-red",
      popular: true
    },
    {
      type: "Membre associé",
      badge: "CONNEXE",
      description: "Professionnels exerçant leur activité dans des domaines connexes au Contrôle ou à l'Audit Interne (Contrôle de Gestion, enseignement universitaire en audit, contrôle dans les organismes publics ou privés).",
      benefits: [
        "Accès aux formations et événements",
        "Bibliothèque de ressources",
        "Réseau professionnel",
        "Cotisation adaptée"
      ],
      // TODO: Vérifier la cotisation exacte
      cotisation: "À définir",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "guinea-yellow"
    },
    {
      type: "Membre étudiant",
      badge: "ÉTUDIANT",
      description: "Étudiants qui étudient les disciplines de l'Audit ou ayant un rapport avec l'Audit, régulièrement inscrits dans les Grandes Écoles ou Universités dispensant cet enseignement.",
      benefits: [
        "Tarifs préférentiels formations",
        "Mentorat par membres actifs",
        "Accès bibliothèque",
        "Événements de networking"
      ],
      // TODO: Vérifier la cotisation étudiante
      cotisation: "Tarif réduit",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      color: "guinea-green"
    },
    {
      type: "Membre honoraire",
      badge: "HONORAIRE",
      description: "Anciens membres actifs ayant cessé d'exercer toute activité professionnelle, en reconnaissance de leur contribution à l'Association.",
      benefits: [
        "Participation aux événements",
        "Accès aux ressources",
        "Dispensé de cotisation",
        "Statut honorifique"
      ],
      cotisation: "Gratuit",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: "guinea-red"
    },
    {
      type: "Membre d'honneur",
      badge: "D'HONNEUR",
      description: "Personnalités choisies par l'Assemblée Générale, en raison des services éminents qu'ils ont rendus à l'Association, au Contrôle ou à l'Audit interne, en Guinée, en Afrique ou dans le Monde.",
      benefits: [
        "Reconnaissance officielle",
        "Participation aux AG",
        "Rôle consultatif",
        "Dispensé de cotisation"
      ],
      cotisation: "Gratuit",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      color: "guinea-yellow"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Types de membres
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            L'AGCM accueille différents profils de membres selon leur situation professionnelle et leur contribution à l'audit
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green mx-auto rounded-full mt-6" />
        </div>

        {/* Grille de types de membres */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberTypes.map((member, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 ${
                member.popular ? 'border-guinea-red' : 'border-gray-200'
              } group`}
            >
              {/* Badge Popular */}
              {member.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-guinea-red text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                    Plus courant
                  </span>
                </div>
              )}

              {/* Icône */}
              <div className={`w-20 h-20 rounded-2xl bg-${member.color}/10 flex items-center justify-center mb-6 text-${member.color} group-hover:scale-110 transition-transform mx-auto`}>
                {member.icon}
              </div>

              {/* Type */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.type}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${member.color}/10 text-${member.color}`}>
                  {member.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-6 leading-relaxed min-h-[100px]">
                {member.description}
              </p>

              {/* Avantages */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                  Avantages
                </h4>
                <ul className="space-y-2">
                  {member.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className={`w-4 h-4 text-${member.color} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cotisation */}
              <div className={`p-4 rounded-xl bg-${member.color}/5 border border-${member.color}/20 mb-6`}>
                <div className="text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Cotisation annuelle</p>
                  <p className={`text-2xl font-bold text-${member.color}`}>
                    {member.cotisation}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link href="/inscription" className="block">
                <Button 
                  className={`w-full bg-${member.color} hover:bg-${member.color}/90 text-white`}
                >
                  {member.popular ? "Rejoindre l'AGCM" : "En savoir plus"}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            <strong>Note :</strong> Les cotisations peuvent varier selon la catégorie de membre. 
            Tous les membres, actifs ou associés, ont les mêmes droits et obligations dans l'Association, 
            mais seuls les membres actifs à jour de leurs cotisations sont électeurs et éligibles au Conseil d'Administration.
          </p>
        </div>
      </div>
    </section>
  );
}
