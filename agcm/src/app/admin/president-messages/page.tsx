import { redirect } from 'next/navigation';

/** Ancienne URL : tout est regroupé sous Site vitrine (onglets). */
export default function AdminPresidentMessagesRedirectPage() {
  redirect('/admin/site-vitrine?tab=messages-president');
}
