// src/lib/notifications.ts
// Helper pour créer des notifications in-app

import { prisma } from './prisma';

export type NotificationType =
  | 'CONTENT_APPROVED'
  | 'CONTENT_REJECTED'
  | 'PROJECT_APPROVED'
  | 'EVENT_APPROVED'
  | 'AFFECTATION_INACTIVATED'
  | 'DEMANDE_ADHESION'
  | 'DEMANDE_PARTENARIAT'
  | 'DEMANDE_DON'
  | 'MESSAGE_CONTACT';

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  entityType?: string,
  entityId?: string
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
      },
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
    // Ne pas faire échouer l'opération principale
  }
}

/**
 * Notifie l'auteur d'un contenu (via le poste) quand il est approuvé ou rejeté
 * On récupère le membre actif du poste auteur pour trouver son userId
 */
export async function notifyContentAuthor(
  auteurPosteId: string,
  mandatId: string,
  type: 'CONTENT_APPROVED' | 'CONTENT_REJECTED',
  contentTitre: string,
  contentId: string,
  rejectionReason?: string
): Promise<void> {
  try {
    const affectation = await prisma.affectationPoste.findFirst({
      where: {
        posteId: auteurPosteId,
        mandatId,
        statut: 'ACTIF',
      },
      include: {
        member: {
          select: { userId: true },
        },
      },
    });

    if (!affectation?.member?.userId) return;

    const message =
      type === 'CONTENT_APPROVED'
        ? `Votre contenu « ${contentTitre} » a été approuvé et publié par le Président.`
        : `Votre contenu « ${contentTitre} » a été rejeté.${rejectionReason ? ` Motif : ${rejectionReason}` : ''}`;

    await createNotification(
      affectation.member.userId,
      type,
      message,
      'Content',
      contentId
    );
  } catch (error) {
    console.error('Erreur notification auteur contenu:', error);
  }
}
