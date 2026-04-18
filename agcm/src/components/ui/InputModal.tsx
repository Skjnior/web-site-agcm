'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** Si défini, le texte doit faire au moins ce nombre de caractères (après trim). */
  minLength?: number;
  type?: 'text' | 'textarea';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  label = 'Valeur',
  placeholder = '',
  required = false,
  minLength,
  type = 'text',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false,
}: InputModalProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen]);

  const trimmed = value.trim();
  const meetsMin =
    minLength === undefined ? true : trimmed.length >= minLength;

  const handleConfirm = () => {
    if (required && !trimmed) {
      return;
    }
    if (!meetsMin) {
      return;
    }
    onConfirm(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
      />
      <div className="relative z-50 mx-4 w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="p-6">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="mb-4 whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-400">
                {message}
              </p>
              <div className="space-y-2">
                <Label htmlFor="input-value" className="text-gray-700 dark:text-slate-300">
                  {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
                </Label>
                {type === 'textarea' ? (
                  <textarea
                    id="input-value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                    rows={4}
                  />
                ) : (
                  <Input
                    id="input-value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        handleConfirm();
                      }
                    }}
                  />
                )}
              </div>
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
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-300 text-gray-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || (required && !trimmed) || !meetsMin}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
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


