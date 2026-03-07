// src/lib/auth.ts
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { authRateLimit } from './rate-limit';

export const authConfig: NextAuthConfig = {
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

          if (!user || !user.isActive) {
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleSysteme = (user as any).roleSysteme || user.role; // Ajouter roleSysteme
        token.memberId = user.memberId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.roleSysteme = (token.roleSysteme || token.role) as string; // Ajouter roleSysteme
        session.user.memberId = token.memberId as string | null;
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