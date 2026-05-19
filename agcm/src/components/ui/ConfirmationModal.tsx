'use client';

import { useId, type ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Texte simple (si `children` est défini, il remplace le paragraphe du message). */
  message?: string;
  children?: ReactNode;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  /** Libellé du bouton pendant `isLoading`. */
  loadingLabel?: string;
  /** Classes sur le conteneur plein écran (ex. `z-[100]` au-dessus d’autres overlays). */
  layerClassName?: string;
  /** Classes sur la carte (fond, bordure) pour harmoniser avec un contexte sombre, etc. */
  panelClassName?: string;
  /** Classes additionnelles sur le titre (ex. texte clair si la carte est sombre). */
  titleClassName?: string;
  /** Bordure / style du pied de modale. */
  footerClassName?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message = '',
  children,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false,
  loadingLabel = 'Traitement...',
  layerClassName,
  panelClassName,
  titleClassName,
  footerClassName,
}: ConfirmationModalProps) {
  const titleId = useId();

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (!isLoading) onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      default:
        return (
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-amber-400" />
        );
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500';
      default:
        return 'bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500';
    }
  };

  return (
    <div
      className={cn('fixed inset-0 flex items-center justify-center', layerClassName ?? 'z-50')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-50 mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900',
          panelClassName,
        )}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id={titleId}
                className={cn('mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100', titleClassName)}
              >
                {title}
              </h3>
              {children != null ? (
                <div className="text-sm">{children}</div>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-400">{message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => !isLoading && onClose()}
              disabled={isLoading}
              className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className={cn(
              'mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-slate-700',
              footerClassName,
            )}
          >
            <Button
              variant="outline"
              onClick={() => !isLoading && onClose()}
              disabled={isLoading}
              className="border-slate-300 text-gray-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(getConfirmButtonColor())}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  {loadingLabel}
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


