// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth';

const { handlers, auth } = NextAuth(authConfig);

export const { GET, POST } = handlers;
export { auth };