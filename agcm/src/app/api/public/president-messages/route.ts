// src/app/api/public/president-messages/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const citations = await prisma.presidentCitation.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(citations);
    } catch (error) {
        console.error('Erreur lors de la récupération des citations des présidents:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des données' },
            { status: 500 }
        );
    }
}
