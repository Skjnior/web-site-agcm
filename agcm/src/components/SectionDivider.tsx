'use client';

interface SectionDividerProps {
  variant?: 'wave' | 'gradient' | 'geometric' | 'dots';
  className?: string;
}

export default function SectionDivider({ variant = 'wave', className = '' }: SectionDividerProps) {
  if (variant === 'wave') {
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        <svg
          className="relative block w-full h-16 md:h-24"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-39.07C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-slate-50"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`relative w-full py-8 ${className}`}>
        <div className="relative">
          {/* Ligne principale avec dégradé */}
          <div className="h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          
          {/* Motif décoratif au centre */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-red-500/60 rounded-full"></div>
              <div className="h-1 w-16 bg-gradient-to-r from-red-500/40 via-red-500/60 to-red-500/40 rounded-full"></div>
              <div className="h-3 w-3 bg-red-500/60 rounded-full"></div>
            </div>
          </div>
          
          {/* Lignes subtiles */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-red-400/20 to-transparent mt-1"></div>
        </div>
      </div>
    );
  }

  if (variant === 'geometric') {
    return (
      <div className={`relative w-full py-8 ${className}`}>
        <div className="flex items-center justify-center gap-2">
          <div className="h-1 w-16 bg-red-500/40 rounded-full"></div>
          <div className="h-2 w-2 bg-red-500/60 rounded-full"></div>
          <div className="h-1 w-24 bg-red-500/40 rounded-full"></div>
          <div className="h-2 w-2 bg-red-500/60 rounded-full"></div>
          <div className="h-1 w-16 bg-red-500/40 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`relative w-full py-6 ${className}`}>
        <div className="flex items-center justify-center gap-3">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 bg-red-500/30 rounded-full"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

