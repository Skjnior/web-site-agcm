// src/lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { authRateLimit } from './rate-limit';
import { getAuthSecret } from './auth-secret';

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

          void prisma.user
            .update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            })
            .catch((err) => console.error('lastLogin update failed:', err));

          let canAccessIntranet =
            user.roleSysteme === 'SUPER_ADMIN' || user.roleSysteme === 'ADMIN';
          if (!canAccessIntranet && user.roleSysteme === 'MEMBER') {
            const { isBureauActif } = await import('./rbac');
            canAccessIntranet = await isBureauActif(user.id);
          }

          return {
            id: user.id,
            email: user.email,
            name:
              user.member?.prenom && user.member?.nom
                ? `${user.member.prenom} ${user.member.nom}`
                : user.email,
            role: user.roleSysteme,
            roleSysteme: user.roleSysteme,
            memberId: user.member?.id || null,
            canAccessIntranet,
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
        const u = user as {
          id?: string;
          role?: string;
          roleSysteme?: string;
          memberId?: string | null;
          email?: string;
          name?: string;
          canAccessIntranet?: boolean;
        };
        token.id = u.id;
        token.role = u.roleSysteme || u.role;
        token.roleSysteme = u.roleSysteme || u.role;
        token.memberId = u.memberId;
        token.name = u.name;
        if (u.email) token.email = u.email;
        token.canAccessIntranet = u.canAccessIntranet === true;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session?.user && token?.id) {
        const u = session.user as {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          roleSysteme?: string;
          memberId?: string | null;
          canAccessIntranet?: boolean;
        };
        u.id = token.id as string;
        u.email = (token.email as string) || '';
        u.name = (token.name as string) || u.email || 'Utilisateur';
        u.role = (token.roleSysteme || token.role) as string;
        u.roleSysteme = u.role;
        u.memberId = (token.memberId as string | null) ?? null;
        u.canAccessIntranet = token.canAccessIntranet === true;
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
  secret: getAuthSecret(),
  trustHost: true,
};

// @ts-expect-error NextAuth v5 default export type resolution
const nextAuth = NextAuth(authConfig);
export const auth = nextAuth.auth;
export const handlers = nextAuth.handlers;