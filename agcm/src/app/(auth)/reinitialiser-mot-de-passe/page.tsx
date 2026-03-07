'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Vérifier si le token et l'email sont présents
    if (!token || !email) {
      setTokenValid(false);
      setIsValidating(false);
      return;
    }

    // Vérifier la validité du token
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/verifier-token-reset?token=${token}&email=${encodeURIComponent(email || '')}`);
        const result = await response.json();
        
        if (response.ok && result.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(result.error || 'Token invalide ou expiré');
        }
      } catch (err) {
        setTokenValid(false);
        setError('Erreur lors de la validation du token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token || !email) {
      setError('Token ou email manquant');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reinitialiser-mot-de-passe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Une erreur est survenue');
      }

      setSuccess(true);
      
      // Redirection après 3 secondes
      setTimeout(() => {
        router.push('/connexion');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guinea-red mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Token invalide ou expiré</h2>
            <p className="text-gray-600">
              {error || 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.'}
            </p>
            <div className="pt-4 space-y-2">
              <Link href="/mot-de-passe-oublie">
                <Button>Demander un nouveau lien</Button>
              </Link>
              <Link href="/connexion">
                <Button variant="outline" className="w-full">Retour à la connexion</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Mot de passe réinitialisé !</h2>
            <p className="text-gray-600">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Fond décoratif */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-guinea-red/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-guinea-yellow/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-guinea-green/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Barre tricolore */}
      <div className="fixed top-0 left-0 right-0 h-2 flex shadow-md z-50">
        <div className="flex-1 bg-guinea-red" />
        <div className="flex-1 bg-guinea-yellow" />
        <div className="flex-1 bg-guinea-green" />
      </div>

      {/* Card de réinitialisation */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-4 pb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-guinea-red via-guinea-yellow to-guinea-green rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-white drop-shadow-md">AGCM</span>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold text-center">
                <span className="bg-gradient-to-r from-guinea-red via-guinea-yellow to-guinea-green bg-clip-text text-transparent">
                  Nouveau mot de passe
                </span>
              </CardTitle>
              
              <CardDescription className="text-center text-base text-gray-600 font-medium">
                Association des Guinéens de La Charente-Maritime
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-guinea-red to-guinea-red/90 hover:from-guinea-red/90 hover:to-guinea-red"
                disabled={isLoading}
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 pb-8 px-8 border-t">
            <Link href="/connexion" className="text-sm text-gray-600 hover:text-guinea-red transition-colors">
              Retour à la connexion
            </Link>
          </CardFooter>
        </Card>
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



