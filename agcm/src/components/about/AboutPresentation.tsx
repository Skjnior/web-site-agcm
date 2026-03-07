export default function AboutPresentation() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Qui sommes-nous ?</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                L'<span className="font-semibold text-guinea-red">Association des Guinéens de La Charente-Maritime (AGCM)</span> est une association à but non lucratif, apolitique et laïque, fondée conformément à la loi du 1er juillet 1901 et au décret du 16 août 1901.
              </p>
              <p>
                L'AGCM fédère et accompagne les Guinéens de La Charente-Maritime, valorise notre culture et porte des projets solidaires ici et en Guinée.
              </p>
              <p>
                Notre ressort territorial couvre l'ensemble du <span className="font-semibold">département de la Charente-Maritime</span>.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-guinea-red/10 via-guinea-yellow/10 to-guinea-green/10 rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-guinea-red/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-guinea-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Notre mission</h3>
                    <p className="text-gray-600 text-sm">
                      Créer un lien de solidarité et d'entraide entre les fils et filles de Guinée
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-guinea-yellow/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-guinea-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Solidarité professionnelle</h3>
                    <p className="text-gray-600 text-sm">
                      Créer et entretenir l'esprit de solidarité entre nos membres
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-guinea-green/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-guinea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Formation continue</h3>
                    <p className="text-gray-600 text-sm">
                      Contribuer à la formation de nos membres dans l'exercice de leurs fonctions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
