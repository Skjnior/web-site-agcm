// components/layout/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { publicNavFooterQuickLinks } from '@/config/site-public-nav';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Données officielles du Certificat d'enregistrement
  const contactInfo = {
    address: "La Rochelle, Charente-Maritime, France",
    phone: "+33 (0)6 XX XX XX XX", // Téléphone non trouvé précisément, laisser un placeholder propre
    email: "association.ajgcm@gmail.com",
    president: "Mr. ALHASSANE DIALLO"
  };

  const legalLinks = [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Politique de confidentialité", href: "/confidentialite" },
    { name: "CGU", href: "/cgu" }
  ];

  const affiliations = [
    {
      name: "Mairie de La Rochelle",
      fullName: "Partenaire institutionnel local",
      url: "https://www.larochelle.fr"
    },
    {
      name: "France Travail",
      fullName: "Accompagnement insertion professionnelle",
      url: "#"
    },
    {
      name: "Mission Locale",
      fullName: "Soutien à la jeunesse",
      url: "#"
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Barre tricolore supérieure */}
      <div className="h-2 flex">
        <div className="flex-1 bg-guinea-red" />
        <div className="flex-1 bg-guinea-yellow" />
        <div className="flex-1 bg-guinea-green" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Colonne 1: À propos */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/Image/logo.jpg"
                  alt="Logo AGCM"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AGCM</h3>
                <p className="text-xs text-gray-400">Depuis 2003</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Association des Guinéens de La Charente-Maritime - Solidarité, Culture et Intégration.
            </p>
            {/* TODO: Ajouter les vrais liens réseaux sociaux quand disponibles */}
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-guinea-yellow transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-guinea-yellow transition-colors" aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-guinea-yellow transition-colors" aria-label="Twitter">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Colonne 2: Liens rapides */}
          <div>
            <h4 className="text-white font-bold mb-4">Navigation</h4>
            <ul className="space-y-2">
              {publicNavFooterQuickLinks.map((link) => (
                <li key={`${link.href}-${link.name}`}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-guinea-yellow transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3: Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-guinea-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-guinea-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${contactInfo.phone}`} className="text-gray-400 hover:text-guinea-yellow transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-guinea-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${contactInfo.email}`} className="text-gray-400 hover:text-guinea-yellow transition-colors">
                  {contactInfo.email}
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <Link href="/contact">
                <button className="w-full px-4 py-2 bg-guinea-red hover:bg-guinea-red/90 text-white rounded-lg text-sm font-semibold transition-colors">
                  Nous contacter
                </button>
              </Link>
            </div>
          </div>

          {/* Colonne 4: Affiliations */}
          <div>
            <h4 className="text-white font-bold mb-4">Nos partenaires</h4>
            <ul className="space-y-3">
              {affiliations.map((affiliation) => (
                <li key={affiliation.name}>
                  <a
                    href={affiliation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-guinea-yellow transition-colors block"
                    title={affiliation.fullName}
                  >
                    <span className="font-semibold">{affiliation.name}</span>
                    <p className="text-xs text-gray-500 mt-1">{affiliation.fullName}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Association des Guinéens de La Charente-Maritime (AGCM). Tous droits réservés.
            </div>

            {/* Liens légaux */}
            <div className="flex flex-wrap justify-center gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-gray-400 hover:text-guinea-yellow transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
