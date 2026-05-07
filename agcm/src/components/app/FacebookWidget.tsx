'use client';

import { useEffect, useRef, useState } from 'react';

import { Facebook, Loader2 } from 'lucide-react';

interface FacebookWidgetProps {
  pageId?: string;
}

export default function FacebookWidget({ pageId = '100093300071406' }: FacebookWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initFB = () => {
      // @ts-expect-error Facebook SDK adds FB to window
      if (window.FB && containerRef.current) {
        // @ts-expect-error Facebook SDK adds FB to window
        window.FB.XFBML.parse(containerRef.current, () => {
          // Callback exécuté quand le widget a fini de charger
          setIsLoading(false);
        });
      }
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v25.0';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = initFB;
      document.body.appendChild(script);
    } else {
      initFB();
    }
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div id="fb-root"></div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex items-center gap-3 shrink-0">
        <Facebook className="w-6 h-6" />
        <div>
          <h3 className="font-bold">Suivez-nous sur Facebook</h3>
          <p className="text-blue-100 text-xs">Retrouvez nos activités en direct</p>
        </div>
      </div>

      <div className="p-4 flex-1 bg-slate-50 relative min-h-[600px]" ref={containerRef}>
        
        {/* Loader visuel */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <span className="text-sm">Chargement de Facebook...</span>
          </div>
        )}

        {/* Le Widget Facebook */}
        <div
          className={`fb-page w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          data-href={`https://www.facebook.com/profile.php?id=${pageId}`}
          data-tabs="timeline"
          data-width="500" // Utilise adapt-container-width pour s'ajuster
          data-height="800"
          data-small-header="false"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        >
          <blockquote
            cite={`https://www.facebook.com/profile.php?id=${pageId}`}
            className="fb-xfbml-parse-ignore"
          >
            <a href={`https://www.facebook.com/profile.php?id=${pageId}`}>AGCM</a>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
