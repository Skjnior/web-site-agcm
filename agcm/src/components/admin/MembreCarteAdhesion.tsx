'use client';

import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import CarteAdhesionReferenceRecto from '@/components/admin/CarteAdhesionReferenceRecto';
import CarteAdhesionReferenceVerso from '@/components/admin/CarteAdhesionReferenceVerso';
import type { CarteAdhesionMemberDto } from '@/lib/cartes-adhesion-types';
import type { CarteAdhesionOrientation } from '@/lib/cartes-adhesion-orientation';
import { getCarteAdhesionMotif, type CarteAdhesionMotifId } from '@/lib/cartes-adhesion-motifs';
import {
  DEFAULT_REFERENCE_VARIANTS,
  type CarteReferenceVariants,
} from '@/lib/cartes-adhesion-reference-variants';
import { getCarteAdhesionTheme, type CarteAdhesionThemeId } from '@/lib/cartes-adhesion-themes';
import { cn } from '@/lib/utils';

/** Logo officiel AGCM (même chemin que le site public). */
const ASSOCIATION_LOGO_SRC = '/Image/logo.jpg';

function formatAdhesion(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function statutLabel(s: string) {
  switch (s) {
    case 'ACTIF':
      return 'Membre actif';
    case 'SUSPENDU':
      return 'Membre suspendu';
    case 'RADIE':
      return 'Membre radié';
    default:
      return s;
  }
}

function BandeauHeader({
  theme,
  compact,
}: {
  theme: ReturnType<typeof getCarteAdhesionTheme>;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden',
        compact ? 'h-[16%] min-h-[2.75rem]' : 'h-[30%] min-h-[4.75rem]',
      )}
    >
      <Image
        src="/Image/fb-hero.jpg"
        alt=""
        fill
        className="object-cover"
        sizes={compact ? '320px' : '540px'}
        priority={false}
      />
      <div className={cn('absolute inset-0 bg-gradient-to-r', theme.headerOverlay)} />
      <div className="relative flex h-full items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-4">
        <div
          className={cn(
            'relative shrink-0 overflow-hidden rounded-lg bg-white shadow-md ring-2 ring-white/55',
            compact ? 'h-9 w-10' : 'h-[52px] w-[56px]',
          )}
        >
          <Image
            src={ASSOCIATION_LOGO_SRC}
            alt="Logo AGCM"
            fill
            className="object-contain p-0.5"
            sizes={compact ? '40px' : '56px'}
          />
        </div>
        <div className="min-w-0 text-white drop-shadow-md">
          <p
            className={cn(
              'font-semibold uppercase tracking-[0.28em] text-white/90',
              compact ? 'text-[6.5px]' : 'text-[8px]',
            )}
          >
            Association
          </p>
          <h2
            className={cn(
              'truncate font-black uppercase leading-none tracking-wide',
              compact ? 'mt-0.5 text-sm' : 'mt-0.5 text-[clamp(15px,4.2vw,22px)]',
            )}
          >
            AGCM
          </h2>
          {!compact ? (
            <p className="mt-0.5 max-w-[220px] truncate text-[9px] font-medium leading-tight text-white/85">
              Carte officielle d&apos;adhésion
            </p>
          ) : (
            <p className="mt-0.5 truncate text-[7px] font-medium leading-tight text-white/88">
              Carte d&apos;adhésion
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BandeauFooter({ theme }: { theme: ReturnType<typeof getCarteAdhesionTheme> }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center px-2 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white sm:text-[10px]',
        '[text-shadow:0_1px_3px_rgb(0_0_0/0.45)]',
        theme.bannerStrip,
      )}
    >
      Carte d&apos;adhérent — membre associatif
    </div>
  );
}

function PiedReference({ member }: { member: CarteAdhesionMemberDto }) {
  return (
    <p className="border-t border-slate-100 bg-slate-50 px-2 py-1 text-center text-[6.5px] leading-tight text-slate-400 print:bg-white">
      Réf. {member.id.slice(0, 14)}… · Document interne AGCM — ne pas diffuser ·{' '}
      {[member.ville, member.pays].filter(Boolean).join(', ') || 'Localisation non renseignée'}
    </p>
  );
}

/** Zone infos — paysage uniquement */
function CorpsInfosLandscape({
  member,
  theme,
  mandatTitre,
}: {
  member: CarteAdhesionMemberDto;
  theme: ReturnType<typeof getCarteAdhesionTheme>;
  mandatTitre: string | null;
}) {
  const locality = [member.ville, member.pays].filter(Boolean).join(' · ');

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between px-4 py-3 text-slate-800">
      <div className="space-y-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Identité du titulaire</p>
          <p className="mt-1 text-[clamp(14px,3.8vw,18px)] font-bold uppercase leading-tight tracking-tight">
            {member.prenom} {member.nom}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide', theme.chipStatut)}>
            {statutLabel(member.statutMembre)}
          </span>
          <span className="text-[9px] text-slate-500">Depuis le {formatAdhesion(member.dateAdhesion)}</span>
        </div>

        {locality ? (
          <p className="flex items-start gap-1 text-[8px] text-slate-600">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" aria-hidden />
            <span className="min-w-0 break-words leading-snug">{locality}</span>
          </p>
        ) : null}

        {mandatTitre ? (
          <p className="text-[9px] leading-snug text-slate-500">
            <span className="font-semibold text-slate-600">Mandat · </span>
            {mandatTitre}
          </p>
        ) : null}

        {member.postesBureau ? (
          <div className={cn('py-1 pl-3', theme.bureauStripe)}>
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Bureau exécutif — fonction</p>
            <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-900">{member.postesBureau}</p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/80 px-2 py-1.5">
            <p className="text-[9px] font-semibold uppercase text-slate-500">Qualité</p>
            <p className="text-[11px] font-medium text-slate-700">Membre associé</p>
          </div>
        )}

        {member.isAdherentSansCompte ? (
          <p className="text-[8px] italic text-slate-400">Gestion bureau — sans compte site</p>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[10px] text-slate-600">
        {member.email ? (
          <span className="flex min-w-0 items-start gap-1">
            <Mail className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" aria-hidden />
            <span className="min-w-0 truncate">{member.email}</span>
          </span>
        ) : null}
        {member.telephone ? (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
            {member.telephone}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function BlocPhotoLandscape({ member }: { member: CarteAdhesionMemberDto }) {
  const photo = member.photoUrl?.trim() || null;

  return (
    <div className="flex w-[34%] max-w-[148px] shrink-0 flex-col items-center justify-center border-l border-slate-100/95 bg-gradient-to-b from-slate-50/95 to-white px-2 py-3">
      <div className="relative aspect-[3/4] w-full max-w-[118px] overflow-hidden rounded-xl border-[3px] border-white bg-white shadow-lg ring-1 ring-slate-200/70">
        {photo ? (
          <SmartImage
            src={photo}
            alt={`Portrait ${member.prenom} ${member.nom}`}
            fill
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
            <span className="text-2xl font-black tabular-nums">
              {member.prenom.slice(0, 1)}
              {member.nom.slice(0, 1)}
            </span>
            <span className="mt-1 px-1 text-center text-[8px] font-medium uppercase leading-tight">Photo</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-wider text-slate-400">
        Photo d&apos;identité
      </p>
    </div>
  );
}

export default function MembreCarteAdhesion({
  member,
  themeId,
  mandatTitre,
  orientation,
  motifId = 'uni',
  referenceVariants,
}: {
  member: CarteAdhesionMemberDto;
  themeId: CarteAdhesionThemeId;
  mandatTitre: string | null;
  orientation: CarteAdhesionOrientation;
  motifId?: CarteAdhesionMotifId;
  /** Portrait : modèle carte plastique recto/verso — combinatoire avec le thème couleur */
  referenceVariants?: Partial<CarteReferenceVariants>;
}) {
  const theme = getCarteAdhesionTheme(themeId);
  const motif = getCarteAdhesionMotif(motifId);
  const refV = { ...DEFAULT_REFERENCE_VARIANTS, ...referenceVariants };

  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'carte-adhesion-item carte-adhesion-vertical carte-reference-paire mx-auto flex w-[280px] shrink-0 flex-col gap-10 print:gap-0',
        )}
      >
        <div className="print:break-after-page">
          <CarteAdhesionReferenceRecto
            member={member}
            theme={theme}
            motifBodyClass={motif.bodyClass}
            variants={refV}
          />
        </div>
        <CarteAdhesionReferenceVerso
          memberId={member.id}
          theme={theme}
          motifBodyClass={motif.bodyClass}
          variants={refV}
        />
      </div>
    );
  }

  return (
    <article
      className={cn(
        'carte-adhesion-item carte-adhesion-horizontal relative mx-auto flex w-full max-w-[540px] flex-col overflow-hidden rounded-xl border border-slate-300/90 bg-white shadow-xl',
        'aspect-[856/539]',
        'print:break-inside-avoid print:rounded-md print:border print:border-slate-400 print:shadow-md',
      )}
    >
      <BandeauHeader theme={theme} />
      <div className={cn('flex min-h-0 flex-1', motif.bodyClass)}>
        <CorpsInfosLandscape member={member} theme={theme} mandatTitre={mandatTitre} />
        <BlocPhotoLandscape member={member} />
      </div>
      <BandeauFooter theme={theme} />
      <PiedReference member={member} />
    </article>
  );
}
