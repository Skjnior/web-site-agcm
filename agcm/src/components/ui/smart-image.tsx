'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PLACEHOLDER_CARD_IMAGE } from '@/lib/placeholder-images';

type SmartImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
};

export function SmartImage({ src, alt, fill, className, sizes, width, height, fallbackSrc = PLACEHOLDER_CARD_IMAGE }: SmartImageProps) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const displaySrc = error ? fallbackSrc : src;

  // Si c'est une image locale (commence par /uploads/), utiliser une balise img normale
  // car Next.js Image peut avoir des problèmes avec les fichiers statiques locaux
  if (src.startsWith('/uploads/')) {
    if (fill) {
      return (
        <>
          {!error ? (
            <img
              src={src}
              alt={alt}
              className={className}
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
              onError={() => {
                console.error('Error loading image:', src);
                setError(true);
              }}
            />
          ) : !fallbackError ? (
            <img
              src={fallbackSrc}
              alt={alt}
              className={className}
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
              onError={() => setFallbackError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <img src="/Image/logo.png" alt={alt} className="max-w-[60%] max-h-[60%] object-contain opacity-50" />
            </div>
          )}
        </>
      );
    }
    return (
      <>
        {!error ? (
          <img
            src={src}
            alt={alt}
            className={className}
            width={width}
            height={height}
            onError={() => {
              console.error('Error loading image:', src);
              setError(true);
            }}
          />
        ) : !fallbackError ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className={className}
            width={width}
            height={height}
            onError={() => setFallbackError(true)}
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-100" style={{ width, height }}>
            <img src="/Image/logo.png" alt={alt} className="max-w-[60%] max-h-[60%] object-contain opacity-50" />
          </div>
        )}
      </>
    );
  }

  // Si erreur sur image principale ET fallback a échoué, afficher le logo
  if (error && fallbackError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fill ? 'w-full h-full absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined}>
        <img src="/Image/logo.png" alt={alt} className="max-w-[60%] max-h-[60%] object-contain opacity-50" />
      </div>
    );
  }

  // Pour les URLs externes, utiliser Next.js Image avec fallback
  if (fill) {
    return (
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        unoptimized={displaySrc.startsWith('http://localhost')}
        onError={() => {
          if (!error) setError(true);
          else setFallbackError(true);
        }}
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width!}
      height={height!}
      className={className}
      sizes={sizes}
      unoptimized={displaySrc.startsWith('http://localhost')}
      onError={() => {
        if (!error) setError(true);
        else setFallbackError(true);
      }}
    />
  );
}

