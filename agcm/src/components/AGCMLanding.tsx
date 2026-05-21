'use client'

import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle,
  MapPin,
  Users,
  Heart,
  BookOpen,
  Globe2,
  HeartHandshake,
  MessageCircle,
  ChevronDown,
  Phone,
  X,
} from 'lucide-react'
import EvenementsSection from './EvenementsSection'
import StatsSection from './StatsSection'
import BureauSection from './BureauSection'
import BureauSectionCompact from './BureauSectionCompact'
import ProjetsGuineeSection from './ProjetsGuineeSection'
import ActualitesSection from './ActualitesSection'
import GalerieSection from './GalerieSection'
import PartnersCarouselSection from './PartnersCarouselSection'
import ProjetsLocauxSection from './ProjetsLocauxSection'
import SectionDivider from './SectionDivider'
import Footer from './layout/Footer'
import PresidentMessageSection from './PresidentMessageSection'
import DonationSection from './DonationSection'
import { SITE_PUBLIC_DEFAULT_PAYLOAD } from '@/config/site-public-default-payload'
import type { SiteHighlightIcon, SitePublicPayload } from '@/types/site-public'

const LANDING_HASH_SCROLL_OFFSET = 80

const HIGHLIGHT_ICONS: Record<
  SiteHighlightIcon,
  ComponentType<{ className?: string; size?: number }>
> = {
  heart: Heart,
  book: BookOpen,
  globe: Globe2,
}

const HIGHLIGHT_CARD_STYLES = [
  {
    card: 'bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent border border-red-400/30 hover:from-red-500/30 hover:border-red-400/50 hover:shadow-red-500/20',
    iconWrap: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30',
    titleHover: 'group-hover:text-red-200',
  },
  {
    card: 'bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-400/30 hover:from-yellow-500/30 hover:border-yellow-400/50 hover:shadow-yellow-500/20',
    iconWrap: 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/30',
    titleHover: 'group-hover:text-yellow-200',
  },
  {
    card: 'bg-gradient-to-r from-agcm-500/20 via-agcm-500/10 to-transparent border border-agcm-400/30 hover:from-agcm-500/30 hover:border-agcm-400/50 hover:shadow-agcm-500/20',
    iconWrap: 'bg-gradient-to-br from-agcm-500 to-agcm-600 shadow-agcm-500/30',
    titleHover: 'group-hover:text-agcm-200',
  },
] as const

export default function AGCMLanding() {
  const pathname = usePathname()
  const [site, setSite] = useState<SitePublicPayload>(SITE_PUBLIC_DEFAULT_PAYLOAD)

  useEffect(() => {
    let cancelled = false
    fetch('/api/public/site-public-page')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.payload) setSite(data.payload as SitePublicPayload)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Depuis la navbar, liens /#axes et /#dons : défiler vers la section après chargement ou navigation client
  useEffect(() => {
    if (pathname !== '/') return

    const scrollToHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (!hash || hash.length < 2) return
      const id = hash.slice(1)
      const el = document.getElementById(id)
      if (!el) return
      const y = el.getBoundingClientRect().top + window.pageYOffset - LANDING_HASH_SCROLL_OFFSET
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    }

    const t1 = setTimeout(scrollToHash, 0)
    const t2 = setTimeout(scrollToHash, 150)
    window.addEventListener('hashchange', scrollToHash)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [pathname])

  // États pour les modals de formulaires
  const [showContactModal, setShowContactModal] = useState(false)
  const [showAdhesionModal, setShowAdhesionModal] = useState(false)
  const [showPartenaireModal, setShowPartenaireModal] = useState(false)
  const [showEvenementModal, setShowEvenementModal] = useState(false)

  // États pour les formulaires
  const [contactForm, setContactForm] = useState({ nom: '', email: '', telephone: '', message: '' })
  const [adhesionForm, setAdhesionForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '', dateNaissance: '' })
  const [partenaireForm, setPartenaireForm] = useState({ nom: '', entreprise: '', email: '', telephone: '', message: '' })
  const [evenementForm, setEvenementForm] = useState({ titre: '', date: '', lieu: '', description: '', nom: '', email: '', telephone: '' })

  const handleSmooth = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.querySelector(id)
    if (el) {
      const navHeight = 80
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // États pour la soumission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: string; success: boolean; message: string } | null>(null)





  // Fonction générique pour soumettre un formulaire
  const handleSubmitForm = async (type: string, formData: any) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Utiliser les routes spécifiques pour chaque type de formulaire
      let endpoint = '/api/public/contact'
      let body: any = { ...formData }

      if (type === 'adhesion') {
        endpoint = '/api/public/adhesion'
        body = {
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          ville: formData.adresse?.split(',')[0] || '',
          pays: 'France',
          message: '',
        }
      } else if (type === 'partenaire') {
        endpoint = '/api/public/partenariat'
        body = {
          organisation: formData.entreprise,
          contactNom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          typePartenariat: 'AUTRE',
          message: formData.message,
        }
      } else if (type === 'contact') {
        endpoint = '/api/public/contact'
        body = {
          nom: formData.nom,
          email: formData.email,
          sujet: 'Contact depuis le site',
          message: formData.message,
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({ type, success: true, message: 'Formulaire soumis avec succès ! Nous vous répondrons bientôt.' })
        setTimeout(() => {
          if (type === 'contact') setContactForm({ nom: '', email: '', telephone: '', message: '' })
          if (type === 'adhesion') setAdhesionForm({ nom: '', prenom: '', email: '', telephone: '', adresse: '', dateNaissance: '' })
          if (type === 'partenaire') setPartenaireForm({ nom: '', entreprise: '', email: '', telephone: '', message: '' })
          if (type === 'evenement') setEvenementForm({ titre: '', date: '', lieu: '', description: '', nom: '', email: '', telephone: '' })
          setSubmitStatus(null)
          setTimeout(() => {
            if (type === 'contact') setShowContactModal(false)
            if (type === 'adhesion') setShowAdhesionModal(false)
            if (type === 'partenaire') setShowPartenaireModal(false)
            if (type === 'evenement') setShowEvenementModal(false)
          }, 3000)
        }, 2000)
      } else {
        setSubmitStatus({ type, success: false, message: result.error || 'Erreur lors de la soumission' })
      }
    } catch (error) {
      setSubmitStatus({ type, success: false, message: 'Erreur de connexion. Veuillez réessayer.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-b from-agcm-900 via-agcm-800 to-agcm-900">

      {/* Hero */}
      <section id="top" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-45">
          <Image src={site.hero.backgroundUrl} alt="Communauté" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-agcm-900/92 via-agcm-800/90 to-agcm-700/90"></div>
        <div className="max-w-6xl mx-auto landing-safe relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="space-y-5 sm:space-y-6 min-w-0 order-1">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white px-3 sm:px-4 py-2 rounded-full border border-white/20 text-xs uppercase tracking-wide">
              {site.hero.badge}
            </span>
            <h1 className="landing-hero-title text-white">
              {site.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
              {site.hero.paragraph}
            </p>
            <StatsSection />
            <div className="flex flex-wrap gap-3">
              <a href="#contact" onClick={(e) => handleSmooth(e, '#contact')} className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-red-500/30 hover:-translate-y-0.5 transition">
                Nous contacter <ArrowRight size={18} />
              </a>
              <a href="#adhesion" onClick={(e) => handleSmooth(e, '#adhesion')} className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition">
                Adhérer
              </a>
            </div>
          </div>
          <div className="relative min-h-[300px] sm:min-h-[380px] lg:h-[520px] w-full min-w-0 order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-yellow-500/15 to-red-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 border-2 border-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full flex flex-col justify-between shadow-2xl hover:shadow-red-500/20 transition-shadow duration-300">
              <div className="space-y-3 overflow-hidden scrollbar-hide flex-1 min-h-0">
                {site.hero.highlights.map((h, i) => {
                  const st = HIGHLIGHT_CARD_STYLES[i % HIGHLIGHT_CARD_STYLES.length]
                  const Icon = HIGHLIGHT_ICONS[h.icon] ?? Heart
                  return (
                    <div
                      key={`${h.title}-${i}`}
                      className={`group flex items-start gap-4 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${st.card}`}
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${st.iconWrap}`}
                      >
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-white font-bold text-sm mb-1 transition-colors ${st.titleHover}`}>
                          {h.title}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-200">{h.text}</p>
                      </div>
                    </div>
                  )
                })}
                {/* President Message - Put back inside the same component */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <PresidentMessageSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Actualités */}
      <section id="actualites" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-red-600 font-semibold text-sm uppercase">Actualités</span>
            <h2 className="landing-heading text-agcm-900 mt-2">Dernières nouvelles</h2>
            <p className="text-slate-600 text-sm mt-2">Découvrez les dernières actualités de l'association</p>
          </div>
          <ActualitesSection />
        </div>
      </section>

      {/* Séparateur - Actualités → Événements */}
      <SectionDivider variant="dots" />

      {/* Événements */}
      <EvenementsSection onProposerEvenement={() => setShowEvenementModal(true)} />

      {/* Axes */}
      <section id="axes" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-red-600 font-semibold text-sm uppercase">Nos axes</span>
            <h2 className="landing-heading text-agcm-900 mt-2">Les piliers d'action</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {site.axes.map((a, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm hover-lift">
                <h3 className="text-lg font-semibold text-agcm-900 mb-2">{a.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* À propos / Histoire & valeurs */}
      <section id="about" className="py-14 px-4 sm:px-6 lg:px-8 bg-agcm-sand">
        <div className="max-w-6xl mx-auto landing-safe grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start lg:items-center">
          <div className="space-y-4 min-w-0">
            <span className="text-agcm-600 font-semibold text-sm uppercase">{site.history.tagline}</span>
            <h2 className="landing-heading text-agcm-900">{site.history.title}</h2>
            <p className="text-agcm-800 leading-relaxed">
              {site.history.body}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-agcm-900">
              {site.history.valeurLabels.map((v, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-agcm-400/40 rounded-2xl px-3 py-2 shadow-sm">
                  <CheckCircle size={16} className="text-agcm-600" />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-agcm-400/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl w-full min-w-0 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-agcm-900"><Users size={18} /> Bureau exécutif</h3>
            <p className="text-agcm-800 text-sm mb-3">{site.history.bureauTeaser}</p>
            <BureauSectionCompact />
          </div>
        </div>
      </section>

      {/* Adhésion */}
      <section id="adhesion" className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-agcm-900 mb-3 flex items-center gap-2"><Heart className="text-red-600" size={20} /> Adhésion</h3>
            <p className="text-slate-700 mb-4 text-sm leading-relaxed">
              {site.adhesion.intro}
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              {site.adhesion.bullets.map((line, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <CheckCircle size={16} className="text-red-500 mt-0.5" /> {line}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowAdhesionModal(true)}
              className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-lg shadow hover:-translate-y-0.5 transition"
            >
              Adhérer maintenant <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Séparateur 2 */}
      <SectionDivider variant="wave" />

      {/* Jeunesse & intégration */}
      <section id="jeunesse" className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-red-600 font-semibold text-sm uppercase">{site.jeunesse.tagline}</span>
            <h2 className="landing-heading text-agcm-900 mt-2">{site.jeunesse.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
            {site.jeunesse.items.map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex gap-3">
                <CheckCircle size={16} className="text-red-500 mt-1" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Séparateur 2 */}
      <SectionDivider variant="geometric" />

      {/* Projets Guinée */}
      <section id="guinee" className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-red-600 font-semibold text-sm uppercase">{site.guineeSection.eyebrow}</span>
            <h2 className="landing-heading text-agcm-900 mt-2">{site.guineeSection.title}</h2>
            <p className="text-slate-700 text-sm mt-2 max-w-2xl mx-auto">
              {site.guineeSection.intro}
            </p>
          </div>
          <ProjetsGuineeSection />
        </div>
      </section>

      {/* Section Dons */}
      <DonationSection />

      <ProjetsLocauxSection data={site.projetsLocaux} />


      {/* Galerie */}
      <GalerieSection />

      <PartnersCarouselSection
        eyebrow={site.partenaires.eyebrow}
        title={site.partenaires.title}
      />

      {/* FAQ */}
      <section id="faq" className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-agcm-900 via-agcm-800 to-agcm-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-red-300 font-semibold text-xs uppercase tracking-wider">{site.faq.eyebrow}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 mt-1">
              {site.faq.title}
            </h2>
            <p className="text-base text-slate-200 max-w-2xl mx-auto">
              {site.faq.subtitle}
            </p>
          </div>

          <div className="space-y-2">
            {site.faq.items.map((item, idx) => (
              <details key={idx} className="bg-white/10 border border-white/10 rounded-md p-3 text-white">
                <summary className="flex items-center justify-between cursor-pointer text-sm md:text-base">
                  <span className="font-medium text-slate-100 pr-3">{item.q}</span>
                  <ChevronDown size={16} className="text-red-300" />
                </summary>
                <div className="mt-2 text-slate-200 text-sm">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto landing-safe grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <div className="space-y-4 min-w-0">
            <span className="text-red-600 font-semibold text-sm uppercase">{site.contact.eyebrow}</span>
            <h2 className="landing-heading text-agcm-900">{site.contact.title}</h2>
            <p className="text-slate-700 text-sm">{site.contact.lead}</p>
            <div className="space-y-3 text-slate-800 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>{site.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle size={18} />
                <span>{site.contact.whatsappLine}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>{site.contact.regionLine}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <iframe
                src={site.contact.mapEmbedUrl}
                width="100%"
                height="260"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte Charente-Maritime"
                className="w-full min-h-[200px] sm:min-h-[260px] max-h-[50vh] rounded-xl border border-slate-200 aspect-video"
              ></iframe>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <p className="text-slate-700 text-sm mb-4">Utilisez le formulaire ci-dessous pour nous contacter directement.</p>
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition"
              >
                Ouvrir le formulaire de contact
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modal Contact */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-agcm-900">Formulaire de contact</h3>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm('contact', contactForm) }} className="space-y-4">
              <input
                type="text"
                placeholder="Nom *"
                required
                value={contactForm.nom}
                onChange={(e) => setContactForm({ ...contactForm, nom: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={contactForm.telephone}
                onChange={(e) => setContactForm({ ...contactForm, telephone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <textarea
                rows={4}
                placeholder="Votre message *"
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              {submitStatus && submitStatus.type === 'contact' && (
                <div className={`p-3 rounded-lg text-sm ${submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitStatus.message}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adhésion */}
      {showAdhesionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdhesionModal(false)}>
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-agcm-900">Formulaire d'adhésion</h3>
              <button onClick={() => setShowAdhesionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm('adhesion', adhesionForm) }} className="space-y-4">
              <input
                type="text"
                placeholder="Nom *"
                required
                value={adhesionForm.nom}
                onChange={(e) => setAdhesionForm({ ...adhesionForm, nom: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="text"
                placeholder="Prénom *"
                required
                value={adhesionForm.prenom}
                onChange={(e) => setAdhesionForm({ ...adhesionForm, prenom: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={adhesionForm.email}
                onChange={(e) => setAdhesionForm({ ...adhesionForm, email: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="tel"
                placeholder="Téléphone *"
                required
                value={adhesionForm.telephone}
                onChange={(e) => setAdhesionForm({ ...adhesionForm, telephone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="text"
                placeholder="Adresse"
                value={adhesionForm.adresse}
                onChange={(e) => setAdhesionForm({ ...adhesionForm, adresse: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="date"
                placeholder="Date de naissance"
                value={adhesionForm.dateNaissance}
                onChange={(e) => setAdhesionForm({ ...adhesionForm, dateNaissance: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              {submitStatus && submitStatus.type === 'adhesion' && (
                <div className={`p-3 rounded-lg text-sm ${submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitStatus.message}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Soumettre ma demande'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* Modal Partenaire */}
      {showPartenaireModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPartenaireModal(false)}>
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-agcm-900">Devenir partenaire</h3>
              <button onClick={() => setShowPartenaireModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm('partenaire', partenaireForm) }} className="space-y-4">
              <input
                type="text"
                placeholder="Nom *"
                required
                value={partenaireForm.nom}
                onChange={(e) => setPartenaireForm({ ...partenaireForm, nom: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="text"
                placeholder="Entreprise / Organisation *"
                required
                value={partenaireForm.entreprise}
                onChange={(e) => setPartenaireForm({ ...partenaireForm, entreprise: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={partenaireForm.email}
                onChange={(e) => setPartenaireForm({ ...partenaireForm, email: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="tel"
                placeholder="Téléphone *"
                required
                value={partenaireForm.telephone}
                onChange={(e) => setPartenaireForm({ ...partenaireForm, telephone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <textarea
                rows={4}
                placeholder="Message / Proposition de partenariat *"
                required
                value={partenaireForm.message}
                onChange={(e) => setPartenaireForm({ ...partenaireForm, message: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              {submitStatus && submitStatus.type === 'partenaire' && (
                <div className={`p-3 rounded-lg text-sm ${submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitStatus.message}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer ma demande'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Événement */}
      {showEvenementModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowEvenementModal(false)}>
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-agcm-900">Proposer un événement</h3>
              <button onClick={() => setShowEvenementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm('evenement', evenementForm) }} className="space-y-4">
              <input
                type="text"
                placeholder="Titre de l'événement *"
                required
                value={evenementForm.titre}
                onChange={(e) => setEvenementForm({ ...evenementForm, titre: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="date"
                placeholder="Date *"
                required
                value={evenementForm.date}
                onChange={(e) => setEvenementForm({ ...evenementForm, date: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="text"
                placeholder="Lieu *"
                required
                value={evenementForm.lieu}
                onChange={(e) => setEvenementForm({ ...evenementForm, lieu: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <textarea
                rows={3}
                placeholder="Description *"
                required
                value={evenementForm.description}
                onChange={(e) => setEvenementForm({ ...evenementForm, description: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="text"
                placeholder="Votre nom *"
                required
                value={evenementForm.nom}
                onChange={(e) => setEvenementForm({ ...evenementForm, nom: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="email"
                placeholder="Votre email *"
                required
                value={evenementForm.email}
                onChange={(e) => setEvenementForm({ ...evenementForm, email: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              <input
                type="tel"
                placeholder="Votre téléphone"
                value={evenementForm.telephone}
                onChange={(e) => setEvenementForm({ ...evenementForm, telephone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-red-400 outline-none"
              />
              {submitStatus && submitStatus.type === 'evenement' && (
                <div className={`p-3 rounded-lg text-sm ${submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitStatus.message}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Proposer l\'événement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

