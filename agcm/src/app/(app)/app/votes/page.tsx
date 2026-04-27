import { Metadata } from 'next';
import { Vote, CheckSquare } from 'lucide-react';
import MemberPageShell from '@/components/app/MemberPageShell';

export const metadata: Metadata = {
    title: 'Votes & Sondages - AGCM',
    description: 'Participez aux décisions de l\'association',
};

export default function VotesPage() {
    return (
        <MemberPageShell
            title="Votes & sondages"
            description="Donnez votre avis et participez aux décisions"
            icon={Vote}
            iconClassName="text-amber-400"
        >
            <div className="admin-panel relative min-h-[400px] overflow-hidden">
                <div className="-z-10 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />

                <div className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6 border border-slate-700/50 shadow-inner">
                        <CheckSquare className="h-10 w-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-200 mb-2">Aucun vote en cours</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Il n'y a actuellement aucune session de vote ou de sondage ouverte. Vous serez notifié lors de la prochaine session.
                    </p>
                </div>
            </div>
        </MemberPageShell>
    );
}
