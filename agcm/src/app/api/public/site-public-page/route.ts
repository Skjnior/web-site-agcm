import { NextResponse } from 'next/server';
import { getSitePublicPayload } from '@/lib/site-public-server';

export async function GET() {
  try {
    const payload = await getSitePublicPayload();
    return NextResponse.json({ payload });
  } catch (e) {
    console.error('site-public-page GET', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
