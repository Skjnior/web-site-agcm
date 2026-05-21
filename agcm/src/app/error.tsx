'use client';

import { useEffect } from 'react';

/**
 * Boundary d'erreur global Next.js (App Router).
 * Capté quand un Server Component plante côté serveur — typiquement quand
 * Prisma renvoie P2037 (« too many connections ») et qu'aucun catch ne le
 * récupère.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError] Server-side exception:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Service momentanément indisponible</h1>
        <p className="mt-3 text-sm text-slate-300">
          Une erreur est survenue côté serveur. C&apos;est souvent passager : la base de
          données peut être saturée pendant quelques secondes. Réessayez ; si le problème
          persiste, prévenez l&apos;équipe technique.
        </p>

        {error?.digest ? (
          <p className="mt-3 text-xs font-mono text-slate-500">
            Réf&nbsp;: <span className="text-slate-400">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
