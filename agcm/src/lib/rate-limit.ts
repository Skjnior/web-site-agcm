// src/lib/rate-limit.ts
// Rate limiting 100% in-memory — pas de dépendance externe

// Store en mémoire simple
class MemoryStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  async increment(key: string, windowMs: number): Promise<number> {
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  async get(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetAt) return 0;
    return entry.count;
  }
}

const memoryStore = new MemoryStore();

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
};

async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const count = await memoryStore.increment(key, windowMs);
  return {
    success: count <= maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
  };
}

// Auth : 5 tentatives par 15 minutes
export const authRateLimit = {
  limit: (identifier: string) =>
    rateLimit(`auth:${identifier}`, 5, 15 * 60 * 1000),
};

// Formulaires publics : 10 par heure
export const inscriptionRateLimit = {
  limit: (identifier: string) =>
    rateLimit(`inscription:${identifier}`, 10, 60 * 60 * 1000),
};

// Routes admin : 200 requêtes par minute
export const adminRateLimit = {
  limit: (identifier: string) =>
    rateLimit(`admin:${identifier}`, 200, 60 * 1000),
};

/**
 * Récupère l'identifiant de la requête (IP ou userId)
 */
export function getRateLimitIdentifier(req: Request, userId?: string): string {
  if (userId) return userId;
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded
    ? forwarded.split(',')[0].trim()
    : (req.headers.get('x-real-ip') ?? 'unknown');
}
