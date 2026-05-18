import { redirect } from 'next/navigation';

/** Super admin / communication : même interface que le bureau. */
export default function AdminGaleriePage() {
  redirect('/bureau/galerie');
}
