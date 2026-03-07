// src/app/a-propos/pv-reunion/page.tsx
// Page pour afficher le PV de réunion du 31 mai 2025

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PV Réunion du 31 Mai 2025 - AGCM',
  description: 'Procès-verbal de la réunion du 31 mai 2025 - Élection du nouveau bureau exécutif',
};

export default function PVReunionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/a-propos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">PV RÉUNION DU 31 MAI 2025</h1>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>31 Mai 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>69 Personnes présentes</span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I. PRÉSENTS</h2>
              <p className="text-gray-700">69 Personnes (voir fiche de présence Excel)</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">II. ORDRE DU JOUR</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Élections bureau</li>
                <li>Informations</li>
                <li>Décompte et proclamation résultats</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">III. DÉROULÉ ET DÉCISIONS</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Élections du bureau</h3>
                  <p className="text-gray-700 mb-4">
                    La réunion de ce jour est consacrée essentiellement à l'élection du nouveau bureau exécutif de
                    l'association. Elle est dirigée par la commission électorale mise en place par l'assemblée lors de la
                    réunion précédente. L'assemblée générale débute à 14h 30 et est présidée par Thierno Amadou Diallo
                    en tant que président de la commission électorale.
                  </p>
                  <p className="text-gray-700 mb-4">
                    D'entrée, le président de la commission électorale effectue les salutations d'usage, présente le
                    processus électoral et donne la parole à chaque candidat afin de se présenter et présenter son projet
                    pour l'association.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Tous les candidats par poste se présentent :</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Président :</strong> Alhassane Diallo et Mamadou Oury Diallo</li>
                      <li><strong>Secrétaire administratif :</strong> Mamadi Kaba (absent pour raisons personnelles)</li>
                      <li><strong>Secrétaire chargé à la communication et à l'information :</strong> Diaby Lamine et Diallo Lamine</li>
                      <li><strong>Secrétaire chargé à l'organisation :</strong> Alpha Oumar Bah, Lamine Diaby et Fodé Abbass Camara</li>
                      <li><strong>Secrétaire chargé aux affaires sociales et à l'intégration :</strong> Adama Barry</li>
                      <li><strong>Secrétaire chargé aux sports, à l'environnement et à la culture :</strong> Alpha Oumar Barry</li>
                      <li><strong>Trésorier :</strong> Balde Alpha Oumar</li>
                      <li><strong>Directeur de finances :</strong> Ibrahim Diallo et Imam Bah</li>
                      <li><strong>Secrétaire chargé à la sécurité :</strong> Alpha Issiagha Diallo et Abdoulaye Camara</li>
                      <li><strong>Secrétaire chargé à la formation :</strong> Pas de candidat</li>
                    </ul>
                  </div>
                  
                  <p className="text-gray-700">Après les présentations, on passe au vote dans une bonne ambiance.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Informations générales</h3>
                  <p className="text-gray-700 mb-3">
                    Pendant le décompte, l'ancien bureau profite pour donner les dernières informations sur l'actualité
                    de l'association :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Organisation d'un barbecue pour la fête de Tabaski le dimanche 08 juin 2025, tous les membres sont invités ainsi que leur famille</li>
                    <li>Organisation d'une soirée culturelle le samedi 19 juillet avec l'invitation de l'artiste Habib Fatako</li>
                    <li>Un membre ayant perdu son père en Guinée, des prières et bénédictions sont faites.</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Après les informations, le président de la commission électorale effectue le dépouillement des voix avec
                    l'aide de deux volontaires. Puis, on passe à la proclamation dont voici les résultats.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Décompte et proclamation des résultats</h3>
                  <p className="text-gray-700 mb-4 font-semibold">Nombre de votants : 61</p>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Ainsi, le nouveau bureau se compose comme suit :</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li><strong>Président :</strong> Diallo Alhassane, élu avec 39 voix soit 61%</li>
                      <li><strong>Secrétaire administratif :</strong> Mamadi Kaba, élu à 100%</li>
                      <li><strong>Secrétaire chargé à la communication et à l'information :</strong> Diallo Lamine, élu avec 32 voix soit 54%</li>
                      <li><strong>Secrétaire chargé à l'organisation :</strong> Alpha Oumar Bah, élu avec 25 voix soit 42%</li>
                      <li><strong>Secrétaire chargé aux affaires sociales et à l'intégration :</strong> Adama Barry, élu avec 100% des voix</li>
                      <li><strong>Secrétaire chargé aux sports, à la culture et à l'environnement :</strong> Alpha Oumar Barry, élu (unique candidat)</li>
                      <li><strong>Trésorier :</strong> Balde Alpha Oumar, élu (unique candidat)</li>
                      <li><strong>Directeur des finances :</strong> Ibrahim Diallo, élu avec 100% des voix</li>
                      <li><strong>Secrétaire chargé à la sécurité :</strong> Alpha Issiagha Diallo, élu avec 60% des voix</li>
                    </ul>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Après la proclamation des résultats, la commission remercie l'ensemble des participants. Les
                    différents candidats se félicitent mutuellement et s'engagent à œuvrer pour le développement de
                    l'association.
                  </p>
                  
                  <p className="text-gray-700 mb-4">
                    Le président nomme M. Ibrahim Khalil Baldé comme vice-président de l'association.
                  </p>
                  
                  <p className="text-gray-700 font-semibold">Fin de la réunion et remerciements</p>
                  
                  <div className="mt-6 text-right">
                    <p className="text-gray-700">Balde Alpha Oumar</p>
                    <p className="text-gray-600 text-sm">Trésorier de l'association</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}



