// src/app/(auth)/connexion/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import Image from 'next/image';


export default function ConnexionPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Identifiants incorrects. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Fond décoratif avec couleurs du drapeau guinéen */}
      <div className="absolute inset-0">
        {/* Cercles flous avec couleurs guinéennes (rouge, jaune, vert) */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-600/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        
        {/* Motif géométrique avec couleurs guinéennes */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #dc2626 1px, transparent 1px),
              linear-gradient(to bottom, #eab308 1px, transparent 1px),
              linear-gradient(to right, #16a34a 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 60px 60px, 60px 60px',
            backgroundPosition: '0 0, 0 0, 30px 30px'
          }}
        />
      </div>

      {/* Barre tricolore guinéenne en haut */}
      <div className="fixed top-0 left-0 right-0 h-2 flex shadow-md z-50">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-yellow-500" />
        <div className="flex-1 bg-green-600" />
      </div>

      {/* Card de connexion */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border border-slate-200/50 backdrop-blur-sm bg-white/98">
          <CardHeader className="space-y-6 pb-8">
            {/* Logo AGCM avec couleurs guinéennes */}
            <div className="flex flex-col items-center gap-4">
              {/* Logo image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xl border-2 border-slate-200">
                <Image
                  src="/Image/logo.jpg"
                  alt="Logo AGCM"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Texte AGCM avec couleurs du drapeau */}
              <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold">
                  <span className="text-red-600">A</span>
                  <span className="text-yellow-500">G</span>
                  <span className="text-green-600">C</span>
                  <span className="text-red-600">M</span>
                </h1>
                <p className="text-sm font-medium text-gray-700">
                  Guinéens de La Charente-Maritime
                </p>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <CardTitle className="text-4xl font-bold text-center">
                <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 bg-clip-text text-transparent">
                  Bienvenue
                </span>
              </CardTitle>
              
              <CardDescription className="text-center text-base text-gray-600 font-medium">
                Association des Guinéens de La Charente-Maritime
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Message d'erreur */}
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-in slide-in-from-top-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Champ Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Adresse email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    {...register('email')}
                    className={`h-12 pl-10 text-base text-gray-900 transition-all ${
                      errors.email 
                        ? 'border-red-500 focus-visible:ring-red-500' 
                        : 'focus-visible:ring-red-500'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Mot de passe
                  </Label>
                  <Link 
                    href="/mot-de-passe-oublie" 
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`h-12 pl-10 pr-10 text-base text-gray-900 transition-all ${
                      errors.password 
                        ? 'border-red-500 focus-visible:ring-red-500' 
                        : 'focus-visible:ring-red-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L12 12m-5.71-5.71L12 12" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 hover:from-red-700 hover:via-yellow-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Se connecter
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 pb-8 px-8 border-t">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Pour devenir membre, contactez l'administration.</p>
              <p className="text-xs text-gray-500">
                Seul un administrateur peut créer votre compte.
              </p>
            </div>
            
            <div className="text-center">
              <Link 
                href="/" 
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1 group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Note de sécurité */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Connexion sécurisée - Vos données sont protégées
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}