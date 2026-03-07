import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notifications - AGCM',
  description: 'Vos notifications',
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
