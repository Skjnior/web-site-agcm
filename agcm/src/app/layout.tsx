// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PageViewTrackerGate from "@/components/analytics/PageViewTrackerGate";
import { Suspense } from "react";

/** Indispensable pour le responsive mobile (évite la mise à l’échelle « page bureau » sur téléphone). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f2417",
};

export const metadata: Metadata = {
  title: "AGCM - Association des Guinéens de La Charente-Maritime",
  description: "L'AGCM fédère et accompagne les Guinéens de La Charente-Maritime, valorise notre culture et porte des projets solidaires ici et en Guinée.",
  keywords: "AGCM, Association Guinéens Charente-Maritime, solidarité, culture, intégration, projets humanitaires",
  authors: [{ name: "AGCM" }],
  openGraph: {
    title: "AGCM - Association des Guinéens de La Charente-Maritime",
    description: "Unis par nos racines, engagés pour notre avenir.",
    type: "website",
    locale: "fr_FR",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Favicon : icon.png, favicon.ico et apple-icon.png dans app/ (convention Next.js)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="overflow-x-hidden" suppressHydrationWarning>
      <body className="bg-gradient-to-b from-agcm-900 via-agcm-800 to-agcm-900 text-white overflow-x-hidden antialiased" suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <PageViewTrackerGate />
          </Suspense>
          <Navbar />
          {children}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
