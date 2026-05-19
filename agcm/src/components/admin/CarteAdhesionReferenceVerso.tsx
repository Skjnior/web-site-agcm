'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import {
  CARTE_REFERENCE_CONTACT_EMAIL,
  CARTE_REFERENCE_LOSS_MESSAGE,
  CARTE_REFERENCE_PHONE_DISPLAY,
  CARTE_REFERENCE_PHONE_TEL,
  CARTE_REFERENCE_STAMP_LINES,
} from '@/lib/cartes-adhesion-reference-config';
import { buildCarteQrPayload } from '@/lib/cartes-adhesion-reference-utils';
import type { CarteAdhesionTheme } from '@/lib/cartes-adhesion-themes';
import { REFERENCE_HEADER_CLIP, type CarteReferenceVariants, type ReferenceWatermarkId } from '@/lib/cartes-adhesion-reference-variants';
import { cn } from '@/lib/utils';

const LOGO = '/Image/logo.jpg';

function VersoWatermark({ mode }: { mode: ReferenceWatermarkId }) {
  if (mode === 'aucun') return null;
  if (mode === 'geometrique') {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 22% 28%, rgb(148 163 184 / 0.07) 0%, transparent 46%)',
            'radial-gradient(circle at 78% 72%, rgb(148 163 184 / 0.055) 0%, transparent 44%)',
            'linear-gradient(125deg, transparent 38%, rgb(241 245 249 / 0.28) 50%, transparent 62%)',
          ].join(', '),
        }}
        aria-hidden
      />
    );
  }
  const opacity = mode === 'logo_large' ? 'opacity-[0.09]' : 'opacity-[0.045]';
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-[6] flex items-center justify-center',
        opacity,
      )}
      aria-hidden
    >
      <div className="relative aspect-square w-[72%] max-w-[220px]">
        <Image src={LOGO} alt="" fill className="object-contain" sizes="220px" />
      </div>
    </div>
  );
}

const cardShell =
  'relative mx-auto mt-8 w-[280px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80 aspect-[539/856] print:mt-0 print:break-inside-avoid print:rounded-xl print:shadow-md';

export default function CarteAdhesionReferenceVerso({
  memberId,
  theme,
  motifBodyClass,
  variants,
}: {
  memberId: string;
  theme: CarteAdhesionTheme;
  motifBodyClass: string;
  variants: CarteReferenceVariants;
}) {
  const { primary, primaryDark, soft } = theme.referencePalette;
  const clip = REFERENCE_HEADER_CLIP[variants.headerShape];
  const qrValue = buildCarteQrPayload(memberId);

  return (
    <article className={cn(cardShell, 'carte-reference-verso')} aria-label="Carte adhérent verso">
      <div
        className={cn(
          'pointer-events-none absolute left-0 right-0 top-[22%] bottom-[11%] z-[4]',
          motifBodyClass,
        )}
        aria-hidden
      />

      <div
        className="absolute left-0 top-0 z-[12] h-[24%] w-full"
        style={{
          backgroundColor: primary,
          clipPath: clip,
        }}
        aria-hidden
      />

      <div className="absolute left-3 top-2.5 z-[26] font-black tracking-tight text-white drop-shadow-md">
        <span className="text-lg leading-none">AGCM</span>
      </div>

      <div className="absolute right-2 top-2 z-[28]">
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-white shadow-md ring-2 ring-white">
          <Image src={LOGO} alt="" fill className="object-contain p-0.5" sizes="44px" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute -right-[18%] top-[12%] z-[8] aspect-square w-[42%] rounded-full opacity-70"
        style={{ backgroundColor: soft }}
        aria-hidden
      />

      <VersoWatermark mode={variants.versoWatermark} />

      <div className="absolute left-0 right-0 top-[26%] bottom-[48px] z-[18] flex flex-col px-4">
        <p className="mt-1 text-center text-[10px] font-bold leading-snug text-slate-800">{CARTE_REFERENCE_LOSS_MESSAGE}</p>
        <a
          href={CARTE_REFERENCE_PHONE_TEL}
          className="mx-auto mt-5 block text-center text-[clamp(1rem,4.8vw,1.25rem)] font-black tracking-tight text-slate-950 underline-offset-2 hover:underline"
        >
          {CARTE_REFERENCE_PHONE_DISPLAY}
        </a>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pb-1 pt-10">
          <div className="max-w-[62%] rounded-md border-2 border-blue-800 bg-blue-50/90 px-2 py-1.5 shadow-sm">
            {CARTE_REFERENCE_STAMP_LINES.map((line) => (
              <p key={line} className="text-[6.5px] font-semibold leading-tight text-blue-950">
                {line}
              </p>
            ))}
            <p className="mt-2 text-[8px] font-bold uppercase text-slate-800">Le président</p>
            <div className="mt-1 h-8 border-b border-slate-400/90" aria-hidden />
            <p className="mt-0.5 text-[7px] italic text-slate-500">Signature à apposer</p>
          </div>
          <div className="shrink-0 rounded-lg bg-white p-1 shadow-md ring-1 ring-slate-200/90">
            <QRCodeSVG value={qrValue} size={56} level="M" marginSize={1} fgColor="#0f172a" bgColor="#ffffff" />
          </div>
        </div>
      </div>

      <footer
        className="absolute bottom-0 left-0 right-0 z-[40] flex min-h-[38px] items-center justify-center px-2 py-2 text-center text-[9px] font-medium lowercase text-white"
        style={{ backgroundColor: primaryDark }}
      >
        {CARTE_REFERENCE_CONTACT_EMAIL}
      </footer>
    </article>
  );
}
