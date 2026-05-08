'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  /** Classes sur le conteneur relatif (icône œil) */
  containerClassName?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, containerClassName, id, disabled, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const genId = React.useId();
    const inputId = id ?? genId;

    return (
      <div className={cn('relative', containerClassName)}>
        <Input
          id={inputId}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10', className)}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className={cn(
            'absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-slate-500 hover:text-slate-800',
            'dark:text-slate-400 dark:hover:text-slate-200',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Eye className="h-4 w-4 shrink-0" aria-hidden />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
