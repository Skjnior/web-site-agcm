'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { SmartImage } from '@/components/ui/smart-image';
import type { CarteAdhesionMemberDto } from '@/lib/cartes-adhesion-types';
import { CARTE_REFERENCE_CONTACT_EMAIL } from '@/lib/cartes-adhesion-reference-config';
import type { CarteAdhesionTheme } from '@/lib/cartes-adhesion-themes';
import {
  REFERENCE_HEADER_CLIP,
  type CarteReferenceVariants,
  type ReferenceAccentId,
} from '@/lib/cartes-adhesion-reference-variants';
import {
  agcmMemberNumericCode,
  buildCarteQrPayload,
  carteExpiryDecemberLabel,
  carteRoleLine,
} from '@/lib/cartes-adhesion-reference-utils';
import { cn } from '@/lib/utils';

const LOGO = '/Image/logo.jpg';

function AccentLayer({ accent, soft }: { accent: ReferenceAccentId; soft: string }) {
  if (accent === 'aucun') return null;
  if (accent === 'demi_cercle') {
    return (
      <div
        className="pointer-events-none absolute -right-[22%] top-[22%] z-[8] aspect-square w-[64%] max-w-[210px] rounded-full opacity-[0.88]"
        style={{ backgroundColor: soft }}
        aria-hidden
      />
    );
  }
  if (accent === 'double_bulle') {
    return (
      <>
        <div
          className="pointer-events-none absolute -right-[14%] top-[18%] z-[8] aspect-square w-[50%] max-w-[170px] rounded-full opacity-75"
          style={{ backgroundColor: soft }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-[6%] top-[36%] z-[8] aspect-square w-[34%] max-w-[120px] rounded-full opacity-55"
          style={{ backgroundColor: soft }}
          aria-hidden
        />
      </>
    );
  }
  return (
    <div
      className="pointer-events-none absolute right-0 top-[26%] z-[8] h-[44%] w-[15%] rounded-l-[999px] opacity-90"
      style={{ backgroundColor: soft }}
      aria-hidden
    />
  );
}

const cardShell =
  'relative mx-auto w-[280px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80 aspect-[539/856] print:break-inside-avoid print:rounded-xl print:shadow-md';

export default function CarteAdhesionReferenceRecto({
  member,
  theme,
  motifBodyClass,
  variants,
}: {
  member: CarteAdhesionMemberDto;
  theme: CarteAdhesionTheme;
  motifBodyClass: string;
  variants: CarteReferenceVariants;
}) {
  const { primary, primaryDark, soft } = theme.referencePalette;
  const clip = REFERENCE_HEADER_CLIP[variants.headerShape];
  const code = agcmMemberNumericCode(member.id);
  const qrValue = buildCarteQrPayload(member.id);
  const roleLine = carteRoleLine(member);
  const photo = member.photoUrl?.trim() || null;

  const photoWrap = cn(
    'relative z-[22] mx-auto overflow-hidden bg-white shadow-inner',
    variants.photoFrame === 'cercle'
      ? 'aspect-square w-[38%] max-w-[118px] rounded-full border-[4px]'
      : 'aspect-[3/4] w-[40%] max-w-[120px] rounded-2xl border-[3px]',
  );

  return (
    <article className={cn(cardShell, 'carte-reference-recto')} aria-label="Carte adhérent recto">
      <div
        className={cn(
          'pointer-events-none absolute left-0 right-0 top-[34%] bottom-[11%] z-[4]',
          motifBodyClass,
        )}
        aria-hidden
      />

      <div
        className="absolute left-0 top-0 z-[12] h-[48%] w-full"
        style={{
          backgroundColor: primary,
          clipPath: clip,
        }}
        aria-hidden
      />

      <AccentLayer accent={variants.accent} soft={soft} />

      <div className="absolute left-3 top-3 z-[26] font-black tracking-tight text-white drop-shadow-md">
        <span className="text-[clamp(1.15rem,5.5vw,1.45rem)] leading-none">AGCM</span>
      </div>

      <div className="absolute right-2.5 top-2.5 z-[28] flex items-center justify-center">
        <div
          className="relative h-[52px] w-[52px] overflow-hidden rounded-full bg-white shadow-md ring-[3px] ring-white"
          style={{ boxShadow: `0 4px 14px ${primaryDark}33` }}
        >
          <Image src={LOGO} alt="" fill className="object-contain p-0.5" sizes="52px" />
        </div>
      </div>

      <div className="absolute left-1/2 top-[21%] z-[22] w-full max-w-[90%] -translate-x-1/2">
        <div className={photoWrap} style={{ borderColor: primary }}>
          {photo ? (
            <SmartImage
              src={photo}
              alt={`Portrait ${member.prenom} ${member.nom}`}
              fill
              className="object-cover"
              sizes="120px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-lg font-black text-slate-500">
              {member.prenom.slice(0, 1)}
              {member.nom.slice(0, 1)}
            </div>
          )}
        </div>
      </div>

      <div className="absolute left-0 right-0 top-[42%] z-[20] flex flex-col items-center px-3 pb-2 pt-1 text-center">
        <p className="text-[13px] font-black uppercase leading-tight tracking-wide text-slate-900">
          {member.prenom}
        </p>
        <p className="mt-0.5 text-[15px] font-black uppercase leading-none tracking-tight text-slate-950">
          {member.nom}
        </p>
        <p className="mt-2 text-[11px] font-semibold" style={{ color: primaryDark }}>
          {roleLine}
        </p>
        <p className="mt-3 font-mono text-[17px] font-black tracking-[0.12em] text-slate-900">
          AGCM {code}
        </p>
      </div>

      <div className="absolute bottom-[13%] right-3 z-[30] flex flex-col items-end gap-1">
        <span className="text-[8px] font-medium text-slate-600">{carteExpiryDecemberLabel(member.dateAdhesion)}</span>
        <div className="rounded-lg bg-white p-1 shadow-md ring-1 ring-slate-200/90">
          <QRCodeSVG value={qrValue} size={52} level="M" marginSize={1} fgColor="#0f172a" bgColor="#ffffff" />
        </div>
      </div>

      <footer
        className="absolute bottom-0 left-0 right-0 z-[40] flex min-h-[38px] items-center justify-center px-2 py-2 text-center text-[9px] font-medium lowercase leading-snug text-white"
        style={{ backgroundColor: primaryDark }}
      >
        {CARTE_REFERENCE_CONTACT_EMAIL}
      </footer>
    </article>
  );
}
