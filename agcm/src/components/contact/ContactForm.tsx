"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Sujet trop court"),
  message: z.string().min(10, "Message trop court"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      setStatus('submitting');
      // On utilise le même structure attendu par l'API public/contact
      const body = {
        nom: values.name,
        email: values.email,
        sujet: values.subject,
        message: values.message,
      };

      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('fail');

      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 5000);
    }
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col items-stretch border border-slate-100">
          <div className="bg-agcm-900 p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Envoyez-nous un message</h3>
            <p className="text-slate-300 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Nom complet *</label>
                <input
                  {...register('name')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="Votre nom"
                />
                {errors.name ? <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email *</label>
                <input
                  {...register('email')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="vous@exemple.com"
                />
                {errors.email ? <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.email.message}</p> : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Sujet *</label>
              <input
                {...register('subject')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                placeholder="Quel est l'objet de votre demande ?"
              />
              {errors.subject ? <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.subject.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Message *</label>
              <textarea
                {...register('message')}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                placeholder="Comment pouvons-nous vous aider ?"
              />
              {errors.message ? <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.message.message}</p> : null}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer mon message
                  </>
                )}
              </button>

              {status === 'success' && (
                <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 animate-fade-in border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Message envoyé avec succès ! Nous reviendrons vers vous très vite.</span>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in border border-red-100">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">Une erreur est survenue lors de l&apos;envoi. Veuillez réessayer.</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

