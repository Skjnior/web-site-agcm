// components/home/AboutSection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre de section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Qui sommes-nous ?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green mx-auto rounded-full" />
        </div>

        {/* Présentation principale */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            {/* Données officielles des Statuts Article 1 & 2 */}
            <p className="text-lg text-gray-700 leading-relaxed">
              L'<span className="font-semibold">Association des Guinéens de La Charente-Maritime (AGCM)</span> est une 
              association à but non lucratif, apolitique et laïque, fondée conformément à la loi du 1er juillet 1901 
              et au décret du 16 août 1901.
            </p>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              L'AGCM fédère et accompagne les Guinéens de La Charente-Maritime, valorise notre culture et porte des 
              projets solidaires ici et en Guinée.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Notre ressort territorial couvre l'ensemble du <span className="font-semibold">département de la Charente-Maritime</span>.
            </p>

            <div className="pt-4">
              <Link href="/a-propos">
                <Button variant="outline" className="border-guinea-red text-guinea-red hover:bg-guinea-red hover:text-white">
                  En savoir plus sur l'AGCM
                </Button>
              </Link>
            </div>
          </div>

          {/* Encadré Mission et Valeurs */}
          <div className="relative">
            <div className="bg-gradient-to-br from-guinea-red/10 via-guinea-yellow/10 to-guinea-green/10 rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                {/* Mission officielle */}
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

                {/* Objectif 1 - Article 4 */}
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

                {/* Objectif 2 - Article 4 */}
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

        {/* Cartes des 4 objectifs principaux - Article 4 des Statuts */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-guinea-red/5 to-guinea-red/10 rounded-xl border border-guinea-red/20 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-guinea-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-guinea-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Solidarité</h3>
            <p className="text-sm text-gray-600">
              Créer un lien de solidarité et d'entraide mutuelle entre les membres de l'association
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-guinea-yellow/5 to-guinea-yellow/10 rounded-xl border border-guinea-yellow/20 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-guinea-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-guinea-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Intégration</h3>
            <p className="text-sm text-gray-600">
              Promouvoir l'intégration des Guinéens et des membres de l'association en Charente-Maritime
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-guinea-green/5 to-guinea-green/10 rounded-xl border border-guinea-green/20 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-guinea-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-guinea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Culture</h3>
            <p className="text-sm text-gray-600">
              Organiser des journées d'échange culturel et des rencontres pour valoriser notre culture
            </p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-guinea-red/5 to-guinea-yellow/10 rounded-xl border border-guinea-red/20 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-r from-guinea-red/20 to-guinea-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-guinea-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Projets</h3>
            <p className="text-sm text-gray-600">
              Réaliser des projets humanitaires et environnementaux ici et en Guinée
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
