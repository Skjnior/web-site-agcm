import { Metadata } from 'next';
import { Vote, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Votes & Sondages - AGCM',
    description: 'Participez aux décisions de l\'association',
};

export default function VotesPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 flex items-center gap-3">
                        <Vote className="h-8 w-8 text-amber-400" />
                        Votes & Sondages
                    </h1>
                    <p className="text-slate-400 mt-1">Donnez votre avis et participez aux décisions</p>
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />

                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6 border border-slate-700/50 shadow-inner">
                        <CheckSquare className="h-10 w-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-200 mb-2">Aucun vote en cours</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Il n'y a actuellement aucune session de vote ou de sondage ouverte. Vous serez notifié lors de la prochaine session.
                    </p>
                </div>
            </div>
        </div>
    );
}
