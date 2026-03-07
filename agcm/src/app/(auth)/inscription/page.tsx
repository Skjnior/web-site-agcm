// src/app/(auth)/inscription/page.tsx
// Cette page est bloquée - seul SUPER_ADMIN peut créer des comptes

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Inscription - AGCM',
  description: 'Création de compte',
};

export default function InscriptionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4">
      <div className="fixed top-0 left-0 right-0 h-2 flex shadow-md z-50">
        <div className="flex-1 bg-guinea-red" />
        <div className="flex-1 bg-guinea-yellow" />
        <div className="flex-1 bg-guinea-green" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 pb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-guinea-red via-guinea-yellow to-guinea-green rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-4xl font-bold text-white drop-shadow-md">AGCM</span>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-center">
              <span className="bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green bg-clip-text text-transparent">
                Inscription
              </span>
            </CardTitle>
            
            <CardDescription className="text-center text-base text-gray-600">
              Association des Guinéens de La Charente-Maritime
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">Création de compte non autorisée</h2>
            
            <p className="text-gray-600">
              La création de compte n'est pas disponible pour les visiteurs.
              Seul un administrateur peut créer votre compte.
            </p>

            <p className="text-sm text-gray-500">
              Pour devenir membre de l'Association des Guinéens de La Charente-Maritime,
              veuillez contacter l'administration ou remplir le formulaire de demande d'adhésion.
            </p>

            <div className="pt-4 space-y-3">
              <Link href="/adhesion" className="block">
                <Button className="w-full">
                  Formulaire de demande d'adhésion
                </Button>
              </Link>
              
              <Link href="/connexion" className="block">
                <Button variant="outline" className="w-full">
                  J'ai déjà un compte
                </Button>
              </Link>
              
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
