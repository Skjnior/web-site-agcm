// components/home/HeroSection.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <>
      {/* Barre tricolore */}
      <div className="fixed top-0 left-0 right-0 h-2 flex shadow-md z-50">
        <div className="flex-1 bg-guinea-red" />
        <div className="flex-1 bg-guinea-yellow" />
        <div className="flex-1 bg-guinea-green" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        {/* Blobs animés */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-guinea-red/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
               style={{ animation: 'blob 7s infinite' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-guinea-yellow/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
               style={{ animation: 'blob 7s infinite 2s' }} />
          <div className="absolute -bottom-32 left-20 w-96 h-96 bg-guinea-green/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
               style={{ animation: 'blob 7s infinite 4s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32 transform hover:scale-105 transition-transform">
                <Image
                  src="/Image/logo.png"
                  alt="Logo AGCM - Association Guinéenne des Auditeurs"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Titre */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="block text-gray-900 mb-2">
                Association Guinéenne
              </span>
              <span className="block bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green bg-clip-text text-transparent">
                des Auditeurs
              </span>
            </h1>

            {/* Mission */}
            <p className="max-w-4xl mx-auto text-xl md:text-2xl text-gray-600 leading-relaxed font-medium">
              Promouvoir et développer la création de valeur par les professionnels de l'audit et contrôle internes
            </p>

            {/* TODO: Vérifier l'année exacte - Document indique 1986 pour la loi fondamentale, 2003 pour l'enregistrement */}
            <p className="text-lg text-gray-500">
              Association professionnelle à but non lucratif | Enregistrée en 2003
            </p>

            {/* Statistiques - TODO: Mettre à jour avec les vrais chiffres */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="text-3xl md:text-4xl font-bold text-guinea-red">2003</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Enregistrement officiel</div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                {/* TODO: Mettre à jour avec le nombre réel de membres */}
                <div className="text-3xl md:text-4xl font-bold text-guinea-yellow">250+</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Membres actifs</div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                {/* TODO: Mettre à jour avec le nombre réel de formations */}
                <div className="text-3xl md:text-4xl font-bold text-guinea-green">45+</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Formations</div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                {/* TODO: Mettre à jour avec le nombre réel d'événements */}
                <div className="text-3xl md:text-4xl font-bold text-guinea-red">120+</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Événements</div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/inscription">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-guinea-red to-guinea-red/90 hover:from-guinea-red/90 hover:to-guinea-red shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    Devenir membre
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>

              <Link href="/formations">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold border-2 border-guinea-green text-guinea-green hover:bg-guinea-green hover:text-white transition-all"
                >
                  Découvrir nos formations
                </Button>
              </Link>
            </div>

            {/* Affiliations - Données officielles du document */}
            <div className="pt-8 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Membre de :</p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                <span className="px-3 py-1 bg-white/80 rounded-full shadow">
                  UFAI - Union Francophone de l'Audit Interne
                </span>
                <span className="px-3 py-1 bg-white/80 rounded-full shadow">
                  UIAI-AO - Union des Instituts d'Audit Interne de l'Afrique de l'Ouest
                </span>
                <span className="px-3 py-1 bg-white/80 rounded-full shadow">
                  IIA - Institute of Internal Auditors (en cours d'affiliation)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
    </>
  );
}
