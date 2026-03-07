// src/app/a-propos/page.tsx
import { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import {
  AboutCallToAction,
  AboutHero,
  AboutHistory,
  AboutObjectives,
  AboutPartners,
  AboutPresentation,
} from '@/components/about';

export const metadata: Metadata = {
  title: 'À propos - AGCM | Association des Guinéens de La Charente-Maritime',
  description: 'Découvrez l\'Association des Guinéens de La Charente-Maritime (AGCM) : notre mission, nos valeurs, nos objectifs et notre histoire.',
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutPresentation />
      <AboutObjectives />
      <AboutHistory />
      <AboutPartners />
      <AboutCallToAction />
      <Footer />
    </>
  );
}

