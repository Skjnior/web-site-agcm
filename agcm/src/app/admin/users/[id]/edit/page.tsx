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
      <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier l'utilisateur</h1>
          <p className="text-gray-600 mt-1">Modifier les informations du compte</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Nouveau mot de passe (laisser vide pour ne pas changer)</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="roleSysteme">Rôle système</Label>
            <select
              id="roleSysteme"
              {...register('roleSysteme')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red"
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
              className="w-4 h-4 text-guinea-red border-gray-300 rounded focus:ring-guinea-red"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Compte actif
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/users">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

