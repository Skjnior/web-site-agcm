import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type MemberPageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Classes pour l’icône Lucide (ex. text-blue-400) */
  iconClassName?: string;
  actions?: ReactNode;
};

/**
 * Bandeau de page aligné sur le style admin (admin-glass).
 */
export function MemberPageHeader({
  title,
  description,
  icon: Icon,
  iconClassName = 'text-blue-400',
  actions,
}: MemberPageHeaderProps) {
  return (
    <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/50">
            <Icon className={`h-6 w-6 ${iconClassName}`} aria-hidden />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-slate-400">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

type MemberPageShellProps = MemberPageHeaderProps & {
  children: ReactNode;
  /** Contenu centré type formulaire (max-w-4xl) */
  narrow?: boolean;
};

/**
 * En-tête + contenu : même langage visuel que le panneau super admin (glass + panels).
 */
export default function MemberPageShell({
  title,
  description,
  icon,
  iconClassName,
  actions,
  narrow,
  children,
}: MemberPageShellProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-6">
      <div className="space-y-8">
        <MemberPageHeader
          title={title}
          description={description}
          icon={icon}
          iconClassName={iconClassName}
          actions={actions}
        />
        {narrow ? (
          <div className="mx-auto w-full max-w-4xl space-y-8">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
