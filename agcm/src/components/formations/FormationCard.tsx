import Link from 'next/link';
import { SmartImage } from '@/components/ui/smart-image';
import { PLACEHOLDER_CARD_IMAGE } from '@/lib/placeholder-images';

type FormationCardProps = {
  titre: string;
  slug: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  niveau: string;
  categorie: string;
  imageUrl?: string | null;
};

export default function FormationCard({ titre, slug, dateDebut, dateFin, lieu, niveau, categorie, imageUrl }: FormationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative aspect-[16/9] bg-gray-100">
        <SmartImage
          src={imageUrl && imageUrl.trim() !== '' ? imageUrl : PLACEHOLDER_CARD_IMAGE}
          alt={titre}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-0.5 rounded bg-gray-100">{categorie}</span>
          <span className="px-2 py-0.5 rounded bg-gray-100">{niveau}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{titre}</h3>
        <div className="text-sm text-gray-600">
          <span>
            {dateDebut} - {dateFin}
          </span>
          <span className="mx-2">•</span>
          <span>{lieu}</span>
        </div>
        <div>
          <Link href={`/formations/${slug}`} className="text-guinea-red font-semibold text-sm hover:underline">
            Voir la formation →
          </Link>
        </div>
      </div>
    </div>
  );
}
