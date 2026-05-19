'use client';

import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

/**
 * Modale de confirmation alignée visuellement sur {@link SignOutConfirmProvider} (overlay + carte, pas d’alerte navigateur).
 */
export default function BureauConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  isLoading,
  Icon,
  variant = 'default',
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  Icon: LucideIcon;
  variant?: 'default' | 'danger';
}) {
  if (!open) return null;

  const danger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        aria-label="Fermer"
        onClick={onCancel}
        disabled={isLoading}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bureau-confirm-dialog-title"
        className={
          danger
            ? 'relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-red-500/45 bg-white shadow-2xl dark:border-red-600/50 dark:bg-slate-900 dark:shadow-black/40'
            : 'relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-blue-500/40 bg-white shadow-2xl dark:border-blue-500/35 dark:bg-slate-900 dark:shadow-black/40'
        }
      >
        <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-slate-100/90 px-6 py-5 dark:border-slate-700/80 dark:from-slate-800/90 dark:to-slate-900/90">
          <div className="flex items-start gap-4">
            <div
              className={
                danger
                  ? 'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/15 to-amber-500/10 ring-1 ring-red-500/25 dark:from-red-500/25 dark:to-amber-500/10 dark:ring-red-500/35'
                  : 'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 ring-1 ring-blue-500/25 dark:from-blue-500/25 dark:to-indigo-500/10 dark:ring-blue-500/35'
              }
            >
              <Icon
                className={
                  danger
                    ? 'h-7 w-7 text-red-600 dark:text-red-400'
                    : 'h-7 w-7 text-blue-600 dark:text-blue-400'
                }
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2
                id="bureau-confirm-dialog-title"
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
              >
                {title}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Espace bureau AGCM</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">{message}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 bg-slate-50/50 px-6 py-4 dark:border-slate-700/80 dark:bg-slate-900/50 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full border-slate-300 py-6 text-slate-700 hover:bg-slate-100 sm:w-auto sm:py-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            variant={danger ? 'destructive' : 'default'}
            className={
              danger
                ? 'w-full gap-2 py-6 font-semibold sm:w-auto sm:py-2'
                : 'w-full gap-2 bg-blue-600 py-6 font-semibold text-white hover:bg-blue-700 sm:w-auto sm:py-2'
            }
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {danger ? 'Suppression…' : 'Envoi…'}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
