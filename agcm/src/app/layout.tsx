// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PageViewTracker from "@/components/analytics/PageViewTracker";

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
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-gradient-to-b from-agcm-900 via-agcm-800 to-agcm-900 text-white overflow-x-hidden" suppressHydrationWarning>
        <Providers>
          <PageViewTracker />
          <Navbar />
          {children}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
