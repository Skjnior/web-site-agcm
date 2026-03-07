const objectives = [
  {
    title: "Promouvoir l'audit",
    description: "Encourager et développer les principes, systèmes et méthodes d'audit au sein des organisations",
    icon: (
      <svg className="w-7 h-7 text-guinea-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    cardClass: "border-guinea-red/20",
    iconWrapperClass: "bg-guinea-red/20",
  },
  {
    title: "Former",
    description: "Organiser des séminaires, rencontres périodiques et échanges d'expériences entre professionnels",
    icon: (
      <svg className="w-7 h-7 text-guinea-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    cardClass: "border-guinea-yellow/20",
    iconWrapperClass: "bg-guinea-yellow/20",
  },
  {
    title: "Fédérer",
    description: "Créer et entretenir un réseau solide de professionnels de l'audit en Guinée",
    icon: (
      <svg className="w-7 h-7 text-guinea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    cardClass: "border-guinea-green/20",
    iconWrapperClass: "bg-guinea-green/20",
  },
  {
    title: "Rayonner",
    description: "Représenter la Guinée au sein des réseaux d'audit de la sous-région et internationaux",
    icon: (
      <svg className="w-7 h-7 text-guinea-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    cardClass: "border-guinea-red/20",
    iconWrapperClass: "bg-gradient-to-r from-guinea-red/20 to-guinea-yellow/20",
  },
];

export default function AboutObjectives() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos objectifs</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Les objectifs de l'AGCM sont définis dans ses statuts et visent à promouvoir l'excellence dans le domaine de l'audit
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {objectives.map(({ title, description, icon, cardClass, iconWrapperClass }) => (
            <div
              key={title}
              className={`text-center p-6 bg-white rounded-xl border hover:shadow-lg transition-shadow ${cardClass}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${iconWrapperClass}`}>
                {icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
