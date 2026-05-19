/** Secret NextAuth v5 (AUTH_SECRET) ou v4 (NEXTAUTH_SECRET) — identique partout (auth, middleware). */
export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
}
