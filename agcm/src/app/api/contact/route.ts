import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Email de destination (modifiable via variable d'environnement)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || 'contact@agcm-guinee.org'

// Initialiser Resend seulement si la clé API est configurée
let resend: Resend | null = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

// Fonction pour formater les données en HTML pour l'email
function formatEmailContent(type: string, formData: any): string {
  const typeLabels: Record<string, string> = {
    contact: 'Formulaire de contact',
    adhesion: 'Demande d\'adhésion',
    benevole: 'Candidature formateur',
    partenaire: 'Demande de partenariat',
    evenement: 'Proposition d\'événement',
  }

  let htmlContent = `
    <h2 style="color: #1B4332; font-family: Arial, sans-serif;">${typeLabels[type] || 'Nouvelle soumission'}</h2>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #666; font-size: 12px; margin-bottom: 10px;">
        <strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}
      </p>
  `

  // Ajouter tous les champs du formulaire
  Object.entries(formData).forEach(([key, value]) => {
    if (value && value !== '') {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
      htmlContent += `
        <p style="margin: 8px 0;">
          <strong style="color: #1B4332;">${label}:</strong><br>
          <span style="color: #333;">${String(value)}</span>
        </p>
      `
    }
  })

  htmlContent += `
    </div>
    <p style="color: #666; font-size: 12px; margin-top: 20px;">
      Ce message a été envoyé depuis le formulaire du site AGCM.
    </p>
  `

  return htmlContent
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...formData } = body

    // Validation basique
    if (!type || !formData) {
      return NextResponse.json(
        { error: 'Type de formulaire et données requises' },
        { status: 400 }
      )
    }

    // Préparer les données avec timestamp
    const submission = {
      type,
      ...formData,
      submittedAt: new Date().toISOString(),
    }

    // Envoyer l'email si Resend est configuré
    if (resend && process.env.RESEND_API_KEY) {
      try {
        const typeLabels: Record<string, string> = {
          contact: 'Formulaire de contact',
          adhesion: 'Demande d\'adhésion',
          benevole: 'Candidature formateur',
          partenaire: 'Demande de partenariat',
          evenement: 'Proposition d\'événement',
        }

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'AGCM Site <noreply@agcm.gn>',
          to: [ADMIN_EMAIL],
          subject: `[AGCM] ${typeLabels[type] || 'Nouvelle soumission'}`,
          html: formatEmailContent(type, formData),
        })

        if (error) {
          console.error('Erreur Resend:', error)
          // Ne pas échouer la requête si l'email échoue, mais logger l'erreur
        } else {
          console.log('✅ Email envoyé avec succès:', data?.id)
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError)
        // Continuer même si l'email échoue
      }
    } else {
      // Mode développement : logger les données si pas de clé API
      console.log('\n📧 ===== NOUVELLE SOUMISSION DE FORMULAIRE =====')
      console.log('Type:', type)
      console.log('Données:', JSON.stringify(submission, null, 2))
      console.log('💡 Pour activer l\'envoi d\'emails, créez .env.local avec:')
      console.log('   RESEND_API_KEY=re_votre_cle_api')
      console.log('   ADMIN_EMAIL=votre-email@example.com')
      console.log('   EMAIL_FROM=AGCM <noreply@agcm.gn>')
      console.log('===========================================\n')
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Formulaire soumis avec succès. Nous vous répondrons bientôt !',
        id: `${type}-${Date.now()}` 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la soumission du formulaire' },
      { status: 500 }
    )
  }
}
