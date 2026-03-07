import Image from 'next/image';

type LogoProps = {
  className?: string;
  variant?: 'light' | 'dark'; // light = texte blanc (par défaut), dark = texte noir
}

export default function Logo({ className, variant = 'light' }: LogoProps) {
  const textColor = variant === 'dark' 
    ? 'text-gray-900' 
    : 'text-white';
  const subtitleColor = variant === 'dark'
    ? 'text-gray-600'
    : 'text-slate-300';

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <div className="h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg border border-white/10 relative">
        <Image
          src="/Image/logo.jpg"
          alt="AGCM Logo"
          fill
          className="object-cover"
        />
      </div>
      <div className="leading-tight min-w-0">
        <p className={`${textColor} font-bold text-lg`}>AGCM</p>
        <p className={`${subtitleColor} text-xs max-w-[130px] sm:max-w-none truncate sm:whitespace-normal`}>Association des Guinéens de La Charente-Maritime</p>
      </div>
    </div>
  )
}

