'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError] Layout/page admin a crashé :', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Espace admin temporairement indisponible</h1>
        <p className="mt-3 text-sm text-slate-300">
          Le tableau de bord n&apos;a pas pu charger. La cause la plus fréquente est une
          saturation du pool de connexions à la base de données — c&apos;est passager.
          Réessayez dans quelques secondes.
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
          >
            Réessayer
          </button>
          <a
            href="/connexion"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Se reconnecter
          </a>
        </div>
      </div>
    </div>
  );
}
