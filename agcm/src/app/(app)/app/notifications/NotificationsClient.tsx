'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/app/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/app/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-400" />
            Mes Notifications
          </h1>
          <p className="text-slate-400 mt-1">Restez informé des dernières activités</p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all rounded-xl backdrop-blur-sm"
            onClick={markAllAsRead}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 transition-all duration-300 hover:bg-slate-800/30 flex gap-4 cursor-pointer ${
                !notification.isRead ? 'bg-blue-500/5' : ''
              }`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="mt-1">
                {!notification.isRead ? (
                  <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-slate-700" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <p
                    className={`text-base font-medium ${
                      !notification.isRead ? 'text-slate-200' : 'text-slate-300'
                    }`}
                  >
                    {notification.type === 'CONTENT_APPROVED' && 'Contenu approuvé'}
                    {notification.type === 'CONTENT_REJECTED' && 'Contenu rejeté'}
                    {notification.type === 'PROJECT_APPROVED' && 'Projet approuvé'}
                    {notification.type === 'EVENT_APPROVED' && 'Événement approuvé'}
                    {notification.type === 'AFFECTATION_INACTIVATED' && 'Affectation inactivée'}
                    {!['CONTENT_APPROVED', 'CONTENT_REJECTED', 'PROJECT_APPROVED', 'EVENT_APPROVED', 'AFFECTATION_INACTIVATED'].includes(
                      notification.type
                    ) && 'Notification'}
                  </p>
                  <p className="text-sm text-slate-500 flex items-center whitespace-nowrap">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{notification.message}</p>
                {notification.entityType === 'Content' && notification.entityId && (
                  <Link
                    href={`/bureau/contents/${notification.entityId}`}
                    className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Voir le contenu →
                  </Link>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                <Bell className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-300">Aucune notification</h3>
              <p className="text-slate-500 mt-2">Vous êtes à jour !</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
