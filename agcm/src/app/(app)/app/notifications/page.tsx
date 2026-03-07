import { Metadata } from 'next';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Notifications - AGCM',
    description: 'Vos notifications',
};

export default function NotificationsPage() {
    // Temporary mock data to fill the page beautifully
    const notifications = [
        {
            id: 1,
            title: 'Bienvenue sur AGCM',
            message: 'Votre compte a été créé avec succès. Explorez votre espace membre.',
            date: 'Il y a 2 heures',
            read: false,
            type: 'info',
        },
        {
            id: 2,
            title: 'Nouvel événement',
            message: 'L\'Assemblée Générale aura lieu le 15 Décembre. Confirmez votre présence.',
            date: 'Hier',
            read: true,
            type: 'event',
        },
        {
            id: 3,
            title: 'Rapport mensuel',
            message: 'Le rapport du mois dernier est maintenant disponible dans la section documents.',
            date: 'Il y a 3 jours',
            read: true,
            type: 'document',
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 flex items-center gap-3">
                        <Bell className="h-8 w-8 text-blue-400" />
                        Mes Notifications
                    </h1>
                    <p className="text-slate-400 mt-1">Restez informé des dernières activités</p>
                </div>

                <Button variant="outline" className="border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all rounded-xl backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Tout marquer comme lu
                </Button>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="divide-y divide-slate-800/50">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-6 transition-all duration-300 hover:bg-slate-800/30 flex gap-4 ${!notification.read ? 'bg-blue-500/5' : ''
                                }`}
                        >
                            <div className="mt-1">
                                {!notification.read ? (
                                    <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                                ) : (
                                    <div className="h-3 w-3 rounded-full bg-slate-700" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-4">
                                    <p className={`text-base font-medium ${!notification.read ? 'text-slate-200' : 'text-slate-300'}`}>
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-slate-500 flex items-center whitespace-nowrap">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {notification.date}
                                    </p>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {notification.message}
                                </p>
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
        </div>
    );
}
