import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutCallToAction() {
  return (
    <section className="py-16 bg-gradient-to-r from-guinea-red to-guinea-red/90">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Rejoignez l'AGCM
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Rejoignez l'Association des Guinéens de La Charente-Maritime et participez à nos activités culturelles, événements et projets solidaires.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/adhesion">
            <Button size="lg" className="bg-white text-guinea-red hover:bg-gray-100 font-semibold">
              Demander l'adhésion
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold"
            >
              Nous contacter
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
