'use client';

import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 mx-4 w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-400">
                {message}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
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
                  Traitement...
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


