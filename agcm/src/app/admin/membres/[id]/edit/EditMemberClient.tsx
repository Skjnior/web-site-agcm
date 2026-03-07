'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

const memberUpdateSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  pays: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  statutMembre: z.enum(['ACTIF', 'SUSPENDU', 'RADIE']),
});

type MemberFormData = z.infer<typeof memberUpdateSchema>;

interface EditMemberClientProps {
  member: {
    id: string;
    prenom: string;
    nom: string;
    telephone: string | null;
    ville: string | null;
    pays: string | null;
    bio: string | null;
    statutMembre: string;
    user: {
      id: string;
      email: string;
      roleSysteme: string;
    };
  };
  currentUserRole: string;
}

export default function EditMemberClient({ member: initialMember, currentUserRole }: EditMemberClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      prenom: initialMember.prenom,
      nom: initialMember.nom,
      telephone: initialMember.telephone || '',
      ville: initialMember.ville || '',
      pays: initialMember.pays || '',
      bio: initialMember.bio || '',
      statutMembre: initialMember.statutMembre as 'ACTIF' | 'SUSPENDU' | 'RADIE',
    },
  });

  const statutMembre = watch('statutMembre');

  const onSubmit = async (data: MemberFormData) => {
    setLoading(true);
    try {
      // Convertir les chaînes vides en null
      const updateData = {
        ...data,
        telephone: data.telephone || null,
        ville: data.ville || null,
        pays: data.pays || null,
        bio: data.bio || null,
      };

      const response = await fetch(`/api/admin/membres/${initialMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification');
      }

      setSuccessModal({ isOpen: true, message: 'Membre modifié avec succès' });
      setTimeout(() => {
        router.push(`/admin/membres/${initialMember.id}`);
      }, 1500);
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la modification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/admin/membres/${initialMember.id}`}>
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Modifier le membre</h1>
            <p className="text-gray-600 mt-1">
              {initialMember.prenom} {initialMember.nom}
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    {...register('prenom')}
                    className="text-gray-900"
                  />
                  {errors.prenom && (
                    <p className="text-sm text-red-600 mt-1">{errors.prenom.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    {...register('nom')}
                    className="text-gray-900"
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-600 mt-1">{errors.nom.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    {...register('telephone')}
                    className="text-gray-900"
                  />
                  {errors.telephone && (
                    <p className="text-sm text-red-600 mt-1">{errors.telephone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ville">Ville</Label>
                  <Input
                    id="ville"
                    {...register('ville')}
                    className="text-gray-900"
                  />
                  {errors.ville && (
                    <p className="text-sm text-red-600 mt-1">{errors.ville.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pays">Pays</Label>
                  <Input
                    id="pays"
                    {...register('pays')}
                    className="text-gray-900"
                  />
                  {errors.pays && (
                    <p className="text-sm text-red-600 mt-1">{errors.pays.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="statutMembre">Statut *</Label>
                  <Select
                    value={statutMembre}
                    onValueChange={(value) => setValue('statutMembre', value as 'ACTIF' | 'SUSPENDU' | 'RADIE')}
                  >
                    <SelectTrigger className="text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="ACTIF" className="text-gray-900">Actif</SelectItem>
                      <SelectItem value="SUSPENDU" className="text-gray-900">Suspendu</SelectItem>
                      <SelectItem value="RADIE" className="text-gray-900">Radié</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.statutMembre && (
                    <p className="text-sm text-red-600 mt-1">{errors.statutMembre.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  rows={4}
                  className="text-gray-900"
                />
                {errors.bio && (
                  <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations compte */}
          <Card>
            <CardHeader>
              <CardTitle>Compte utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Email</Label>
                <Input
                  value={initialMember.user.email}
                  disabled
                  className="text-gray-900 bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">
                  L'email ne peut pas être modifié depuis cette page
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Link href={`/admin/membres/${initialMember.id}`}>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button variant="edit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: '' });
          router.push(`/admin/membres/${initialMember.id}`);
        }}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </>
  );
}


