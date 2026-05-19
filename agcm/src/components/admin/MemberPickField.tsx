'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Mail, Phone, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type MemberPickOption = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  photoUrl: string | null;
  fullName: string;
};

type MemberPickFieldProps = {
  id?: string;
  label?: string;
  members: MemberPickOption[];
  value: string;
  onChange: (memberId: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  /** Message si aucun membre dans la liste */
  emptyHint?: string;
};

export function MemberAvatar({ member, className }: { member: MemberPickOption; className?: string }) {
  const initial =
    `${member.prenom?.[0] ?? ''}${member.nom?.[0] ?? ''}`.toUpperCase() || '?';
  const [imgError, setImgError] = useState(false);

  if (member.photoUrl?.trim() && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URLs locales /uploads/ gérées côté client
      <img
        src={member.photoUrl}
        alt=""
        className={cn('h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600', className)}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 ring-2 ring-slate-200 dark:bg-slate-600 dark:text-slate-100 dark:ring-slate-600',
        className
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function MemberPickField({
  id,
  label,
  members,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Choisir un membre',
  emptyHint = 'Aucun membre disponible.',
}: MemberPickFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => members.find((m) => m.id === value), [members, value]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return members;
    return members.filter((m) => {
      const hay = [
        m.fullName,
        m.prenom,
        m.nom,
        m.email,
        m.telephone ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return normalize(hay).includes(q);
    });
  }, [members, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      {label ? (
        <Label htmlFor={id} className="text-slate-700 dark:text-slate-300">
          {label}
        </Label>
      ) : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'mt-1.5 flex w-full min-h-[46px] items-center gap-3 rounded-md border px-3 py-2 text-left text-sm shadow-sm outline-none transition-colors',
          'border-slate-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20',
          'dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-primary/30',
          error && 'border-red-500 dark:border-red-500',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        {selected ? (
          <>
            <MemberAvatar member={selected} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900 dark:text-slate-100">{selected.fullName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{selected.email}</p>
            </div>
          </>
        ) : (
          <>
            <User className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
          </>
        )}
        <ChevronDown
          className={cn('ml-auto h-4 w-4 shrink-0 text-slate-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-[100] mt-1 flex max-h-[min(22rem,70vh)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-900"
        >
          <div className="shrink-0 border-b border-slate-200 p-2 dark:border-slate-700">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher nom, email, téléphone…"
                className="h-9 pl-8 dark:bg-slate-800/80"
                autoFocus
              />
            </div>
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1 scrollbar-thin [-webkit-overflow-scrolling:touch] touch-pan-y"
            onWheel={(e) => e.stopPropagation()}
          >
            {members.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{emptyHint}</p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Aucun résultat pour cette recherche.
              </p>
            ) : (
              filtered.map((m) => {
                const active = m.id === value;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors',
                      active
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    )}
                  >
                    <MemberAvatar member={m} />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">{m.fullName}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-slate-600 dark:text-slate-400">
                        <Mail className="h-3 w-3 shrink-0 opacity-70" />
                        <span className="truncate">{m.email}</span>
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <Phone className="h-3 w-3 shrink-0 opacity-70" />
                        <span>{m.telephone?.trim() || '—'}</span>
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
