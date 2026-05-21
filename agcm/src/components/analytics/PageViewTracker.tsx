'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const SESSION_TRACKED_KEY = 'agcm:page-views-tracked';

/** Pages qu'on ne tracke pas (admin/bureau/dashboard internes : peu d'intérêt analytique
 * et risquent de saturer le tracker en navigation). */
function shouldSkip(path: string): boolean {
  return (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/admin') ||
    path.startsWith('/bureau') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/app/')
  );
}

/** On dédup par session-storage : chaque path n'est tracké qu'une fois par
 * onglet/onglet. Évite des milliers d'appels lors d'une navigation rapide. */
function alreadyTrackedThisSession(path: string): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_TRACKED_KEY);
    const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    if (set.has(path)) return true;
    set.add(path);
    sessionStorage.setItem(SESSION_TRACKED_KEY, JSON.stringify([...set].slice(-50)));
    return false;
  } catch {
    return false;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const lastPath = useRef<string>('');

  useEffect(() => {
    if (shouldSkip(pathname)) return;

    const fullPath =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    if (lastPath.current === fullPath) return;
    lastPath.current = fullPath;

    if (alreadyTrackedThisSession(fullPath)) return;

    const payload = JSON.stringify({
      path: fullPath,
      method: 'GET',
      userAgent: navigator.userAgent,
      referer: document.referrer || undefined,
      userId: session?.user?.id || null,
    });

    // Stratégie : sendBeacon est non bloquant et survit à la navigation. Mais
    // il ne permet pas d'ajouter des headers personnalisés (notre x-internal-secret).
    // On part donc sur fetch() avec keepalive=true en arrière-plan, en silencieux.
    const send = () => {
      try {
        void fetch('/api/internal/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': 'internal-page-view-secret',
          },
          body: payload,
          keepalive: true,
        }).catch(() => {
          /* silently ignore tracking errors */
        });
      } catch {
        /* noop */
      }
    };

    // requestIdleCallback si dispo pour ne pas pénaliser le rendu critique
    type IdleCb = (cb: () => void) => number;
    const ric = (window as unknown as { requestIdleCallback?: IdleCb })
      .requestIdleCallback;
    if (typeof ric === 'function') {
      ric(send);
    } else {
      const timeout = setTimeout(send, 800);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams, session]);

  return null;
}
