// src/app/api/admin/publish-facebook/route.ts
// Publication d'un contenu sur la Page Facebook AGCM via Meta Graph API

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

const META_GRAPH_BASE = 'https://graph.facebook.com/v21.0';

interface FacebookPublishResult {
    success: boolean;
    facebookPostId?: string;
    error?: string;
}

async function publishToFacebook(
    message: string,
    imageUrl?: string | null,
    linkUrl?: string | null
): Promise<FacebookPublishResult> {
    const pageId = process.env.META_PAGE_ID;
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
        return {
            success: false,
            error: 'Configuration Meta API manquante (META_PAGE_ID ou META_PAGE_ACCESS_TOKEN absents dans .env.local)',
        };
    }

    try {
        let endpoint: string;
        let body: Record<string, string>;

        if (imageUrl && imageUrl.startsWith('http')) {
            // Publication avec image
            endpoint = `${META_GRAPH_BASE}/${pageId}/photos`;
            body = {
                url: imageUrl,
                caption: message,
                access_token: accessToken,
            };
        } else {
            // Publication texte + lien optionnel
            endpoint = `${META_GRAPH_BASE}/${pageId}/feed`;
            body = {
                message,
                access_token: accessToken,
                ...(linkUrl ? { link: linkUrl } : {}),
            };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error('Meta API error:', data.error);
            return {
                success: false,
                error: data.error?.message || 'Erreur lors de la publication sur Facebook',
            };
        }

        // data.id contient le post_id (ou photo_id)
        const postId = data.id || data.post_id;
        return { success: true, facebookPostId: postId };
    } catch (err) {
        console.error('Facebook publish error:', err);
        return { success: false, error: 'Erreur réseau lors de la publication sur Facebook' };
    }
}

export async function POST(request: NextRequest) {
    const { error, session } = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json();
        const { contentId } = body;

        if (!contentId) {
            return NextResponse.json({ error: 'contentId requis' }, { status: 400 });
        }

        const content = await prisma.content.findUnique({
            where: { id: contentId },
            include: {
                auteurPoste: { select: { nom: true } },
            },
        });

        if (!content) {
            return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
        }

        if (content.facebookPostId) {
            return NextResponse.json(
                { error: 'Ce contenu a déjà été publié sur Facebook', facebookPostId: content.facebookPostId },
                { status: 409 }
            );
        }

        // Construire le message Facebook
        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agcm.fr';
        const truncatedContent = content.contenu
            ? content.contenu.length > 500
                ? content.contenu.substring(0, 500) + '...'
                : content.contenu
            : '';

        const message = [
            `📢 ${content.titre}`,
            '',
            truncatedContent,
            '',
            `🔗 Lire la suite : ${siteUrl}`,
            '',
            '#AGCM #GuinéensDeCharenteMaritime #Communauté',
        ]
            .filter((line) => line !== null)
            .join('\n');

        const result = await publishToFacebook(
            message,
            content.imagePrincipale,
            content.lienExterne || `${siteUrl}`
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 502 });
        }

        // Sauvegarder l'ID du post Facebook dans la DB
        await prisma.content.update({
            where: { id: contentId },
            data: { facebookPostId: result.facebookPostId },
        });

        await logAction({
            userId: session!.user.id,
            action: 'UPDATE',
            entityType: 'Content',
            entityId: contentId,
            beforeData: { facebookPostId: null },
            afterData: { facebookPostId: result.facebookPostId },
        });

        return NextResponse.json({
            success: true,
            message: 'Contenu publié sur Facebook avec succès',
            facebookPostId: result.facebookPostId,
        });
    } catch (err) {
        console.error('Erreur publish-facebook:', err);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
