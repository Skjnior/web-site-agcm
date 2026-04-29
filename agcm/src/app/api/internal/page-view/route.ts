// src/app/api/internal/page-view/route.ts
// API interne pour enregistrer les visites de pages avec géolocalisation IP
// Appelée depuis le middleware via fetch non-bloquant

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  // Vérifier la clé secrète interne
  const secret = request.headers.get('x-internal-secret');
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      path,
      method = 'GET',
      ipAddress,
      userAgent,
      referer,
      sessionId,
      userId,
    } = body;

    if (!path) {
      return NextResponse.json({ error: 'path required' }, { status: 400 });
    }

    // Géolocalisation en parallèle avec l'insertion
    const geoData = ipAddress ? await geolocateIP(ipAddress) : {};

    await prisma.pageView.create({
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
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[page-view] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
  }
}
