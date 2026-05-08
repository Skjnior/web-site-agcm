import { redirect } from 'next/navigation';

/** Ancienne page « Votes & sondages » : retirée du produit ; les liens redirigent vers l’espace bureau. */
export default function VotesPageRedirect() {
  redirect('/bureau');
}
