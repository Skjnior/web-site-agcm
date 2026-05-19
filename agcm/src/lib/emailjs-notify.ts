/**
 * Notifications formulaires publics via EmailJS (2 templates : contact / adhésion).
 * Dashboard : https://dashboard.emailjs.com — activer « Allow Non-browser Applications » si envoi serveur.
 */

import emailjs from '@emailjs/nodejs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sendEmail } from '@/lib/email';

/** Valeurs fournies par le projet ; surcharge possibles via .env */
const SERVICE_ID = process.env.EMAILJS_SERVICE_ID ?? 'service_w0zlpfb';
const TEMPLATE_CONTACT = process.env.EMAILJS_TEMPLATE_CONTACT ?? 'template_m6wz0tn';
const TEMPLATE_ADHESION = process.env.EMAILJS_TEMPLATE_ADHESION ?? 'template_b1lpr33';

function emailJsAuth():
  | { publicKey: string; privateKey?: string }
  | null {
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  if (!publicKey) return null;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  return privateKey ? { publicKey, privateKey } : { publicKey };
}

function adminInbox(): string {
  return process.env.ADMIN_EMAIL || 'contact@agcm-guinee.org';
}

export function defaultLogoUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
  if (base) return `${base}/Image/logo.jpg`;
  const fallback = process.env.EMAILJS_LOGO_URL;
  if (fallback) return fallback;
  return 'https://agcm-guinee.org/Image/logo.jpg';
}

export function formatSubmittedAtFr(date: Date = new Date()): string {
  return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
}

function dash(v: string | null | undefined): string {
  const s = v?.trim();
  return s && s.length > 0 ? s : '—';
}

async function sendEmailJs(templateId: string, templateParams: Record<string, string>) {
  const auth = emailJsAuth();
  if (!auth) {
    console.warn('EMAILJS_PUBLIC_KEY manquant — envoi EmailJS ignoré');
    return false;
  }
  try {
    await emailjs.send(SERVICE_ID, templateId, templateParams, auth);
    return true;
  } catch (e) {
    console.error('EmailJS:', e);
    return false;
  }
}

/** Template « contact » : contact, partenariat, intention de don. */
export async function notifyEmailJsContactTemplate(fields: {
  form_kind: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
}) {
  const submittedAt = formatSubmittedAtFr();
  const params: Record<string, string> = {
    logo_url: defaultLogoUrl(),
    form_kind: fields.form_kind,
    sender_name: fields.sender_name,
    sender_email: fields.sender_email,
    subject: fields.subject,
    message: fields.message,
    submitted_at: submittedAt,
  };

  if (await sendEmailJs(TEMPLATE_CONTACT, params)) return;

  await sendEmail({
    to: adminInbox(),
    subject: `[AGCM] ${fields.form_kind} : ${fields.subject}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <p><strong>${fields.form_kind}</strong></p>
        <p><strong>De :</strong> ${fields.sender_name} (${fields.sender_email})</p>
        <p><strong>Sujet :</strong> ${fields.subject}</p>
        <p><strong>Reçu :</strong> ${submittedAt}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
        <pre style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${escapeHtml(fields.message)}</pre>
      </div>
    `,
  });
}

/** Template « adhésion » uniquement. */
export async function notifyEmailJsAdhesionTemplate(data: {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  ville?: string | null;
  pays?: string | null;
  message?: string | null;
}) {
  const submittedAt = formatSubmittedAtFr();
  const params: Record<string, string> = {
    logo_url: defaultLogoUrl(),
    prenom: data.prenom,
    nom: data.nom,
    email: data.email,
    telephone: dash(data.telephone),
    ville: dash(data.ville),
    pays: dash(data.pays),
    message: dash(data.message),
    submitted_at: submittedAt,
  };

  if (await sendEmailJs(TEMPLATE_ADHESION, params)) return;

  await sendEmail({
    to: adminInbox(),
    subject: `Nouvelle demande d'adhésion : ${data.prenom} ${data.nom}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4b5563;">Nouvelle demande d'adhésion (fallback)</h2>
        <p><strong>Candidat :</strong> ${data.prenom} ${data.nom}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Téléphone :</strong> ${dash(data.telephone)}</p>
        <p><strong>Localisation :</strong> ${dash(data.ville)}, ${dash(data.pays)}</p>
        <p><strong>Message :</strong></p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">${escapeHtml(dash(data.message))}</div>
        <p style="font-size: 12px; color: #666;">${submittedAt}</p>
      </div>
    `,
  });
}

const DON_TYPE_LABEL: Record<string, string> = {
  FINANCIER: 'Financier',
  MATERIEL: 'Matériel',
  AUTRE: 'Autre',
};

/** Helpers appelés depuis les routes API */
export async function notifyPublicContactForm(data: {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}) {
  await notifyEmailJsContactTemplate({
    form_kind: 'Contact',
    sender_name: data.nom,
    sender_email: data.email,
    subject: data.sujet,
    message: data.message,
  });
}

export async function notifyPublicPartenariatForm(data: {
  organisation: string;
  contactNom?: string | null;
  email: string;
  telephone?: string | null;
  typePartenariat?: string | null;
  message?: string | null;
}) {
  const body = [
    `Organisation : ${data.organisation}`,
    `Contact référent : ${dash(data.contactNom)}`,
    `Téléphone : ${dash(data.telephone)}`,
    `Type de partenariat : ${dash(data.typePartenariat)}`,
    '',
    data.message?.trim() || '—',
  ].join('\n');

  const displayName =
    data.contactNom?.trim() && data.contactNom.trim().length > 0
      ? data.contactNom.trim()
      : data.organisation;

  await notifyEmailJsContactTemplate({
    form_kind: 'Partenariat',
    sender_name: displayName,
    sender_email: data.email,
    subject: `Partenariat — ${data.organisation}`,
    message: body,
  });
}

export async function notifyPublicDonForm(data: {
  type: string;
  montantEstime?: number | null;
  description?: string | null;
  nom?: string | null;
  email?: string | null;
  telephone?: string | null;
}) {
  const typeLabel = DON_TYPE_LABEL[data.type] ?? data.type;
  const montantLine =
    data.montantEstime != null && data.montantEstime > 0
      ? `Montant estimé : ${data.montantEstime} €`
      : 'Montant estimé : —';

  const body = [
    `Type de don : ${typeLabel}`,
    montantLine,
    `Téléphone : ${dash(data.telephone)}`,
    '',
    dash(data.description),
  ].join('\n');

  await notifyEmailJsContactTemplate({
    form_kind: 'Don',
    sender_name: dash(data.nom) !== '—' ? dash(data.nom) : 'Don (site)',
    sender_email: dash(data.email),
    subject: `Intention de don — ${typeLabel}`,
    message: body,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
