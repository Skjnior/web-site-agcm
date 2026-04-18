// src/app/api/super-admin/users/route.ts
// Gestion des utilisateurs (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const genreValues = ['FEMME', 'HOMME', 'AUTRE', 'NE_PAS_DIRE'] as const;

const userCreateSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  roleSysteme: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']),
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  genre: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    z.enum(genreValues).optional()
  ),
  dateNaissance: z
    .string()
    .optional()
    .transform((s) => {
      if (!s?.trim()) return undefined;
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }),
  profession: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z
    .string()
    .optional()
    .transform((s) => s?.trim() || undefined)
    .refine((s) => !s || /^https?:\/\/.+/i.test(s) || /^\/uploads\//.test(s), {
      message: 'URL ou chemin invalide (https://… ou fichier uploadé /uploads/…)',
    }),
});

const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleSysteme: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const roleSysteme = searchParams.get('roleSysteme');
  const isActiveParam = searchParams.get('isActive');
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: any = {};

    // Filtre par recherche (email ou nom/prénom du membre)
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { member: { 
          OR: [
            { prenom: { contains: search, mode: 'insensitive' } },
            { nom: { contains: search, mode: 'insensitive' } },
          ],
        } },
      ];
    }

    // Filtre par rôle
    if (roleSysteme && roleSysteme !== 'all') {
      where.roleSysteme = roleSysteme;
    }

    // Filtre par statut
    if (isActiveParam && isActiveParam !== 'all') {
      where.isActive = isActiveParam === 'true';
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          member: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(users, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireSuperAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const data = userCreateSchema.parse(body);

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Créer l'utilisateur et le membre en transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          roleSysteme: data.roleSysteme,
          isActive: true,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          prenom: data.prenom,
          nom: data.nom,
          genre: data.genre ?? undefined,
          dateNaissance: data.dateNaissance ?? undefined,
          profession: data.profession?.trim() || undefined,
          adresse: data.adresse?.trim() || undefined,
          telephone: data.telephone?.trim() || undefined,
          ville: data.ville?.trim() || undefined,
          pays: data.pays?.trim() || undefined,
          bio: data.bio?.trim() || undefined,
          photoUrl: data.photoUrl,
          statutMembre: 'ACTIF',
        },
      });

      return { user, member };
    });

    await logAction({
      userId: session!.user.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: result.user.id,
      afterData: { ...result.user, member: result.member },
    });

    return NextResponse.json(
      { success: true, user: result.user, member: result.member },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

