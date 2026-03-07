'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donationIntentSchema, DonationIntentInput } from '@/lib/validators/demandes';
import { Heart, Wallet, Package, Loader2, CheckCircle2 } from 'lucide-react';

export default function DonationSection() {
    const [activeTab, setActiveTab] = useState<'FINANCIER' | 'MATERIEL'>('FINANCIER');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DonationIntentInput>({
        resolver: zodResolver(donationIntentSchema),
        defaultValues: {
            type: 'FINANCIER',
        },
    });

    const onSubmit = async (data: DonationIntentInput) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/public/don', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, type: activeTab }),
            });

            if (response.ok) {
                setSuccess(true);
                reset();
            } else {
                const result = await response.json();
                setError(result.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <section id="dons" className="py-16 px-4 bg-white">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-agcm-900">Merci pour votre générosité !</h2>
                    <p className="text-slate-600 text-lg">
                        Votre intention de don a bien été reçue. Notre équipe vous contactera très prochainement pour finaliser votre contribution.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="text-red-600 font-semibold hover:underline"
                    >
                        Faire un autre don
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section id="dons" className="py-16 px-4 bg-slate-50 border-y border-slate-200">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">Soutenir nos actions</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mt-2">Faire un don</h2>
                    <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
                        Chaque geste compte. Que ce soit financier ou matériel, votre soutien permet à l'AGCM de poursuivre ses missions ici et en Guinée.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    {/* Tabs Nav */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                        <button
                            onClick={() => { setActiveTab('FINANCIER'); reset({ type: 'FINANCIER' }); }}
                            className={`flex-1 py-5 flex items-center justify-center gap-3 font-bold transition-all ${activeTab === 'FINANCIER' ? 'bg-white text-red-600 border-t-4 border-red-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Wallet size={20} />
                            Don Financier
                        </button>
                        <button
                            onClick={() => { setActiveTab('MATERIEL'); reset({ type: 'MATERIEL' }); }}
                            className={`flex-1 py-5 flex items-center justify-center gap-3 font-bold transition-all ${activeTab === 'MATERIEL' ? 'bg-white text-red-600 border-t-4 border-red-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Package size={20} />
                            Don Matériel
                        </button>
                    </div>

                    <div className="p-8 md:p-10">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-agcm-900">Nom complet *</label>
                                    <input
                                        {...register('nom')}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        placeholder="Votre nom"
                                    />
                                    {errors.nom && <p className="text-red-500 text-xs">{errors.nom.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-agcm-900">Email *</label>
                                    <input
                                        {...register('email')}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        placeholder="votre@email.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-agcm-900">Téléphone</label>
                                    <input
                                        {...register('telephone')}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        placeholder="Votre numéro"
                                    />
                                </div>
                                {activeTab === 'FINANCIER' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-agcm-900">Montant estimé (€) *</label>
                                        <input
                                            type="number"
                                            {...register('montantEstime', { valueAsNumber: true })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition-all font-mono"
                                            placeholder="0.00"
                                        />
                                        {errors.montantEstime && <p className="text-red-500 text-xs">{errors.montantEstime.message}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-agcm-900">
                                    {activeTab === 'FINANCIER' ? 'Message / Précisions' : 'Description du matériel *'}
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                    placeholder={activeTab === 'FINANCIER' ? 'Souhaitez-vous soutenir un projet spécifique ?' : 'Décrivez ce que vous souhaitez donner (ex: kits scolaires, matériel médical...)'}
                                />
                                {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Heart size={20} />}
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon intention de don'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
