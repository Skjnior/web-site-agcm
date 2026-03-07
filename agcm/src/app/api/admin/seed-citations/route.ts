// src/app/api/admin/seed-citations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const citations = [
            {
                nom: 'Camara Aboubacar',
                message: 'L\'association m\'a accueilli quand je suis arrivé en France. J\'ai trouvé une famille.',
                debutMandat: new Date('2020-01-01'),
                finMandat: new Date('2022-12-31'),
            },
            {
                nom: 'Diallo Mamadou',
                message: 'Notre engagement pour la communauté guinéenne en Charente-Maritime est le moteur de nos actions.',
                debutMandat: new Date('2023-01-01'),
                finMandat: null,
            }
        ];

        for (const c of citations) {
            await prisma.presidentCitation.create({
                data: c
            });
        }

        return NextResponse.json({ success: true, message: 'Citations seeded' });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: 'Failed to seed' }, { status: 500 });
    }
}
