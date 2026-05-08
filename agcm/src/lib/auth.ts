// src/lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { authRateLimit } from './rate-limit';

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Rate limiting pour l'authentification
          const rateLimitResult = await authRateLimit.limit(
            credentials.email as string
          );

          if (!rateLimitResult.success) {
            console.warn(`Rate limit exceeded for email: ${credentials.email}`);
            return null;
          }

          // Chercher l'utilisateur dans la base
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { member: true }
          });

          if (!user || !user.isActive || user.deletedAt) {
            return null;
          }

          if (!user.passwordHash) {
            return null;
          }

          // Vérifier le mot de passe
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            return null;
          }

          // Mettre à jour lastLogin
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });

          // Retourner les infos utilisateur
          return {
            id: user.id,
            email: user.email,
            name: user.member?.prenom && user.member?.nom
              ? `${user.member.prenom} ${user.member.nom}`
              : user.email,
            role: user.roleSysteme,
            memberId: user.member?.id || null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        const u = user as { id?: string; role?: string; roleSysteme?: string; memberId?: string; email?: string };
        token.id = u.id;
        token.role = u.role;
        token.roleSysteme = u.roleSysteme || u.role;
        token.memberId = u.memberId;
        if (u.email) token.email = u.email;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session?.user && token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            email: true,
            roleSysteme: true,
            member: { select: { id: true, prenom: true, nom: true } },
          },
        });

        const u = session.user as {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          roleSysteme?: string;
          memberId?: string | null;
          canAccessIntranet?: boolean;
        };

        if (dbUser) {
          u.id = token.id as string;
          u.email = dbUser.email;
          u.name =
            dbUser.member?.prenom && dbUser.member?.nom
              ? `${dbUser.member.prenom} ${dbUser.member.nom}`
              : dbUser.email;
          u.role = dbUser.roleSysteme;
          u.roleSysteme = dbUser.roleSysteme;
          u.memberId = dbUser.member?.id ?? null;
        } else {
          u.id = token.id as string;
          u.email = (token.email as string) || '';
          u.name = u.email || 'Utilisateur';
          u.role = token.role as string;
          u.roleSysteme = (token.roleSysteme || token.role) as string;
          u.memberId = token.memberId as string | null;
        }

        const role = u.roleSysteme || u.role || '';
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          u.canAccessIntranet = true;
        } else if (role === 'MEMBER' && u.id) {
          const { isBureauActif } = await import('@/lib/rbac');
          u.canAccessIntranet = await isBureauActif(u.id);
        } else {
          u.canAccessIntranet = false;
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/connexion',
    error: '/connexion',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Important pour NextAuth v5
};

// @ts-expect-error NextAuth v5 default export type resolution
const nextAuth = NextAuth(authConfig);
export const auth = nextAuth.auth;
export const handlers = nextAuth.handlers;