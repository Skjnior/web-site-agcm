import { Metadata } from 'next';
import { Calendar, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Mes Événements - AGCM',
    description: 'Gérez vos participations aux événements',
};

export default function MesEvenementsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-blue-400" />
                        Mes Événements
                    </h1>
                    <p className="text-slate-400 mt-1">Gérez vos inscriptions et participations</p>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all rounded-xl">
                    Découvrir les événements
                </Button>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />

                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6 border border-slate-700/50 shadow-inner">
                        <Ticket className="h-10 w-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-200 mb-2">Aucun événement à afficher</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Vous n'êtes actuellement inscrit à aucun événement. Explorez nos prochains événements pour y participer.
                    </p>
                    <Button variant="outline" className="border-slate-700 bg-slate-800/30 text-slate-300 hover:text-white hover:bg-slate-700 transition-all rounded-xl">
                        Voir le calendrier complet
                    </Button>
                </div>
            </div>
        </div>
    );
}
