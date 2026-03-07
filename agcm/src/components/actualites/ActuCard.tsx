import Link from 'next/link';
import { SmartImage } from '@/components/ui/smart-image';
import { PLACEHOLDER_CARD_IMAGE } from '@/lib/placeholder-images';

type ActuCardProps = {
  titre: string;
  slug: string;
  resume: string;
  categorie: string;
  datePublication?: string | null;
  imageUrl?: string | null;
};

export default function ActuCard({ titre, slug, resume, categorie, datePublication, imageUrl }: ActuCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative aspect-[16/9] bg-gray-100">
        <SmartImage
          src={imageUrl && imageUrl.trim() !== '' ? imageUrl : PLACEHOLDER_CARD_IMAGE}
          alt={titre}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-0.5 rounded bg-gray-100">{categorie}</span>
          {datePublication ? <span>{datePublication}</span> : null}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{titre}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{resume}</p>
        <div>
          <Link href={`/actualites/${slug}`} className="text-guinea-red font-semibold text-sm hover:underline">
            Lire l'actualité →
          </Link>
        </div>
      </div>
    </div>
  );
}
