// src/app/api/internal/page-view/route.ts
// API interne pour enregistrer les visites de pages avec géolocalisation IP
// Appelée depuis le middleware via fetch non-bloquant

import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaRetry } from '@/lib/prisma';
import { isPageViewTrackingEnabled } from '@/lib/page-view-config';

// Clé secrète pour protéger cet endpoint interne
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || 'internal-page-view-secret';

interface GeoData {
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  isp?: string;
  proxy?: boolean;
}

async function geolocateIP(ip: string): Promise<GeoData> {
  // Ne pas géolocaliser les IPs locales/privées
  if (
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip === 'unknown'
  ) {
    return { country: 'Local', city: 'Localhost' };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,proxy`, {
      signal: AbortSignal.timeout(2000), // 2s max
    });

    if (!res.ok) return {};

    const data = await res.json();

    if (data.status !== 'success') return {};

    return {
      country: data.country,
      countryCode: data.countryCode,
      city: data.city,
      region: data.regionName,
      isp: data.isp,
      proxy: data.proxy,
    };
  } catch {
    return {}; // timeout ou erreur réseau → on ignore
  }
}

export async function POST(request: NextRequest) {
  // Vérifier la clé secrète interne (sans BDD).
  const secret = request.headers.get('x-internal-secret');
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isPageViewTrackingEnabled()) {
    return NextResponse.json({ skipped: true }, { status: 202 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const {
    path,
    method = 'GET',
    ipAddress,
    userAgent,
    referer,
    sessionId,
    userId,
  } = body as {
    path?: string;
    method?: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    sessionId?: string;
    userId?: string;
  };

  if (!path) {
    return NextResponse.json({ error: 'path required' }, { status: 400 });
  }

  // Le tracking ne doit JAMAIS faire planter l'expérience visiteur. On répond
  // toujours 202 « accepted » — l'écriture se fait au mieux en arrière-plan
  // avec retry, et toute erreur est logguée mais pas remontée au client.
  // Important : sur Prisma Postgres direct, le pool peut saturer (P2037),
  // c'est exactement ce contre quoi on se protège ici.
  void (async () => {
    try {
      const geoData = ipAddress ? await geolocateIP(ipAddress) : {};
      await prismaRetry(
        () =>
          prisma.pageView.create({
            data: {
              path,
              method,
              ipAddress: ipAddress || null,
              userAgent: userAgent || null,
              referer: referer || null,
              sessionId: sessionId || null,
              userId: userId || null,
              country: geoData.country || null,
              countryCode: geoData.countryCode || null,
              city: geoData.city || null,
              region: geoData.region || null,
              isp: geoData.isp || null,
              isProxy: geoData.proxy || false,
            },
          }),
        { retries: 2, delayMs: 300 },
      );
    } catch (error: unknown) {
      // On log seulement le code et le message court — pas la stack — pour
      // ne pas inonder Vercel logs en cas de saturation continue.
      const msg = error instanceof Error ? error.message.split('\n')[0] : String(error);
      console.warn('[page-view] write skipped (DB busy) :', msg);
    }
  })();

  return NextResponse.json({ accepted: true }, { status: 202 });
}
