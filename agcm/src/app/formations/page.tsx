// src/app/formations/page.tsx
// Section formations supprimée — redirection vers les activités
import { redirect } from 'next/navigation';

export default function FormationsPage() {
  redirect('/actualites?type=ACTIVITE');
}
