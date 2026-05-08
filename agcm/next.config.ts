import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ne pas définir `turbopack.root` ici : sur Vercel il entre en conflit avec
  // `outputFileTracingRoot` et déclenche un avertissement à chaque build.
  // `npm run dev --turbopack` fonctionne sans cette option.
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
