// src/app/api/projets/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projets = await prisma.projet.findMany({
      include: { medias: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    // map each project to include first image URL if exists
    const data = projets.map(p => ({
      id: p.id,
      titre: p.titre,
      description: p.description,
      imageUrl: p.medias?.find(m => m.type === 'IMAGE')?.url || null,
    }));
    return NextResponse.json({ projets: data });
  } catch (err) {
    console.error('GET projets error', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
