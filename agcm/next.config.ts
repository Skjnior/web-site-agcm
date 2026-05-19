import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Répertoire du projet Next (`agcm/`) — évite une mauvaise inférence si un autre lockfile existe au-dessus */
const agcmRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: agcmRoot,
  // Ne pas définir `turbopack.root` ici : sur Vercel il entre en conflit avec
  // `outputFileTracingRoot` et déclenche un avertissement à chaque build.
  // En local : `npm run dev:turbo` pour Turbopack ; `npm run dev` utilise Webpack (plus stable au quotidien).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
