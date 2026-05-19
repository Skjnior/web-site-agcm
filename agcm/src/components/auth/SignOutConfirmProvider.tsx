'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  registerSignOutConfirmHandler,
  type SignOutConfirmPayload,
} from '@/lib/sign-out-confirm';

function SignOutDialog({
  onCancel,
  onConfirm,
  isLoading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        aria-label="Fermer"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-red-500 bg-white shadow-2xl dark:border-red-600 dark:bg-slate-900 dark:shadow-black/40"
      >
        <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/90 px-6 py-5 dark:border-slate-700/80 dark:from-slate-800/90 dark:to-slate-900/90">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/15 to-amber-500/10 ring-1 ring-red-500/20 dark:from-red-500/20 dark:to-amber-500/10 dark:ring-red-500/30">
              <LogOut className="h-7 w-7 text-red-600 dark:text-red-400" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2
                id="sign-out-dialog-title"
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
              >
                Se déconnecter ?
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Session sécurisée AGCM
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
            Vous allez quitter votre espace membre. Les formulaires non enregistrés pourront être perdus. Vous pourrez
            vous reconnecter à tout moment avec vos identifiants.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 bg-slate-50/50 px-6 py-4 dark:border-slate-700/80 dark:bg-slate-900/50 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 sm:w-auto dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 py-6 sm:py-2"
          >
            Rester connecté
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full gap-2 sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-6 sm:py-2"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Déconnexion…
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Me déconnecter
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SignOutConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<SignOutConfirmPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    registerSignOutConfirmHandler((payload) => {
      setPending(payload);
    });
    return () => registerSignOutConfirmHandler(null);
  }, []);

  const handleCancel = () => {
    if (isLoading) return;
    setPending((p) => {
      if (p) p.resolve(false);
      return null;
    });
  };

  const handleConfirm = async () => {
    console.log('SignOutConfirmProvider: handleConfirm called');
    if (!pending || isLoading) {
      console.log('SignOutConfirmProvider: pending is null or isLoading is true', { pending: !!pending, isLoading });
      return;
    }
    const payload = pending;
    setIsLoading(true);
    try {
      console.log('SignOutConfirmProvider: calling signOut', { callbackUrl: payload.callbackUrl, redirect: payload.redirect });
      await signOut({ callbackUrl: payload.callbackUrl, redirect: true });
      // Fallback au cas où le redirect de next-auth échoue
      window.location.href = payload.callbackUrl;
      payload.resolve(true);
    } catch (error) {
      console.error('SignOutConfirmProvider: signOut error', error);
      payload.resolve(false);
    } finally {
      setIsLoading(false);
      setPending(null);
    }
  };

  return (
    <>
      {children}
      {pending ? (
        <SignOutDialog onCancel={handleCancel} onConfirm={handleConfirm} isLoading={isLoading} />
      ) : null}
    </>
  );
}
