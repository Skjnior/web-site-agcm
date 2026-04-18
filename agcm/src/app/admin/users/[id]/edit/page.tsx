'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const userUpdateSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional().or(z.literal('')),
  roleSysteme: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userUpdateSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userUpdateSchema),
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/super-admin/users/${userId}`);
      if (!response.ok) throw new Error('Utilisateur introuvable');

      const result = await response.json();
      const user = result.user || result;
      setValue('email', user.email);
      setValue('roleSysteme', user.roleSysteme);
      setValue('isActive', user.isActive);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoadingUser(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    setError('');

    try {
      // Ne pas envoyer le mot de passe s'il est vide
      if (data.password === '') {
        delete data.password;
      }

      const response = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification');
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="admin-page mx-auto max-w-3xl space-y-6">
        <div className="admin-glass rounded-2xl py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-gray-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page mx-auto max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/admin/users">
            <Button
              variant="outline"
              size="sm"
              className="w-fit border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
              Modifier l&apos;utilisateur
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Modifier les informations du compte</p>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40"
        >
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={cn(errors.email && 'border-red-500 dark:border-red-500')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
              Nouveau mot de passe (laisser vide pour ne pas changer)
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={cn(errors.password && 'border-red-500 dark:border-red-500')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="roleSysteme" className="text-slate-700 dark:text-slate-300">
              Rôle système
            </Label>
            <select
              id="roleSysteme"
              {...register('roleSysteme')}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-primary/30"
            >
              <option value="MEMBER">Membre</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-primary/40"
            />
            <Label htmlFor="isActive" className="cursor-pointer text-slate-700 dark:text-slate-300">
              Compte actif
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          <Link href="/admin/users">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

