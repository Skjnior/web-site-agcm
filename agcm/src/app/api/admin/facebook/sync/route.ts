import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FacebookService } from '@/lib/facebook';

/**
 * Route API pour synchroniser les posts Facebook vers le site (News/Actualités)
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Récupérer les derniers posts Facebook
        const fbPosts = await FacebookService.getLatestPosts(5);

        if (fbPosts.length === 0) {
            return NextResponse.json({ message: 'Aucun post Facebook trouvé ou synchronisé.' });
        }

        // 2. Pour chaque post, vérifier s'il existe déjà en DB
        let newSyncCount = 0;

        // On récupère un auteur par défaut (le premier admin par exemple)
        const adminPoste = await prisma.poste.findFirst({
            where: { nom: { contains: 'Président' } }
        });

        const mandatActif = await prisma.mandat.findFirst({
            where: { statut: 'ACTIF' }
        });

        if (!adminPoste || !mandatActif) {
            return NextResponse.json({ error: 'Configuration manquante (Poste auteur ou Mandat actif).' }, { status: 500 });
        }

        for (const fbPost of fbPosts) {
            const existing = await prisma.content.findFirst({
                where: { facebookPostId: fbPost.id }
            });

            if (!existing && fbPost.message) {
                // Créer une nouvelle actualité à partir du post FB
                await prisma.content.create({
                    data: {
                        facebookPostId: fbPost.id,
                        titre: fbPost.message.slice(0, 100) + (fbPost.message.length > 100 ? '...' : ''),
                        contenu: fbPost.message,
                        imagePrincipale: fbPost.full_picture || null,
                        type: 'ACTUALITE',
                        visibiliteCible: 'PUBLIC_SITE',
                        statutWorkflow: 'PUBLIE',
                        auteurPosteId: adminPoste.id,
                        mandatId: mandatActif.id,
                        lienExterne: fbPost.permalink_url,
                    }
                });
                newSyncCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `${newSyncCount} nouveaux posts Facebook synchronisés.`,
            totalProcessed: fbPosts.length
        });

    } catch (error) {
        console.error('Erreur lors de la synchronisation Facebook:', error);
        return NextResponse.json({ error: 'Erreur lors de la synchronisation' }, { status: 500 });
    }
}
