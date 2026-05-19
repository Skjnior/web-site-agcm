const timeline = [
  {
    title: "Fondation de l'AGCM",
    description:
      "L'Association des Guinéens de La Charente-Maritime est créée, marquant le début d'une aventure de solidarité et d'entraide entre les Guinéens de la région.",
    accent: "bg-guinea-red/20",
    icon: <span className="text-2xl font-bold text-guinea-red">2003</span>,
  },
  {
    title: "Développement et croissance",
    description:
      "Au fil des années, l'AGCM a développé ses activités culturelles, organisé des événements et renforcé son réseau de membres à travers la Charente-Maritime.",
    accent: "bg-guinea-yellow/20",
    icon: (
      <svg className="w-8 h-8 text-guinea-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Projets solidaires",
    description:
      "L'AGCM porte des projets humanitaires et environnementaux, organise des échanges culturels et coopère avec d'autres associations pour le développement communautaire.",
    accent: "bg-guinea-green/20",
    icon: (
      <svg className="w-8 h-8 text-guinea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function AboutHistory() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Notre histoire</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green mx-auto rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {timeline.map(({ title, description, accent, icon }, index) => {
              const isLast = index === timeline.length - 1;

              return (
                <div key={title} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${accent}`}>{icon}</div>
                  </div>
                  <div className={`flex-1 ${isLast ? '' : 'pb-8 border-l-2 border-gray-200'} pl-6`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
