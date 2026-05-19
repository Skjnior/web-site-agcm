import Image from 'next/image';

type LogoProps = {
  className?: string;
  /** `navbar` : compact pour la barre du haut (une seule ligne de liens). */
  variant?: 'light' | 'dark' | 'navbar';
};

export default function Logo({ className, variant = 'light' }: LogoProps) {
  const isNavbar = variant === 'navbar';
  const textColor = variant === 'dark' ? 'text-gray-900' : 'text-white';
  const subtitleColor = variant === 'dark' ? 'text-gray-600' : 'text-slate-300';

  const box = isNavbar
    ? 'h-9 w-9 sm:h-9 sm:w-9 shrink-0 rounded-lg border border-white/10'
    : 'h-12 w-12 rounded-xl border border-white/10';
  const titleClass = isNavbar
    ? `${textColor} text-sm font-bold leading-none sm:text-base`
    : `${textColor} text-lg font-bold`;

  return (
    <div
      className={`flex min-w-0 items-center gap-1.5 sm:gap-2 ${className ?? ''}`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden shadow-lg ${box}`}
      >
        <Image src="/Image/logo.jpg" alt="AGCM Logo" fill className="object-cover" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className={titleClass}>AGCM</p>
        <p
          className={`${subtitleColor} mt-0.5 line-clamp-2 max-w-[9.5rem] text-[10px] leading-snug sm:max-w-[11rem] sm:text-[11px] lg:max-w-[12rem] xl:max-w-[13.5rem]`}
        >
          Association des Guinéens de La Charente-Maritime
        </p>
      </div>
    </div>
  );
}

