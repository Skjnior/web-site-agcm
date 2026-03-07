'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle,
  MapPin,
  ArrowUp,
  Users,
  Heart,
  BookOpen,
  Globe2,
  Calendar,
  HeartHandshake,
  MessageCircle,
  Clock,
  ChevronDown,
  Facebook,
  Tag,
  Phone,
  X,
} from 'lucide-react'
import Logo from './Logo'
import Link from 'next/link'
import EvenementsSection from './EvenementsSection'
import StatsSection from './StatsSection'
import BureauSection from './BureauSection'
import BureauSectionCompact from './BureauSectionCompact'
import ProjetsGuineeSection from './ProjetsGuineeSection'
import ActualitesSection from './ActualitesSection'
import GalerieSection from './GalerieSection'
import SectionDivider from './SectionDivider'
import Footer from './layout/Footer'
import PresidentMessageSection from './PresidentMessageSection'
import DonationSection from './DonationSection'

const axes = [
  { title: 'Intégration & solidarité locale', text: 'Accompagnement des nouveaux arrivants, soutien administratif, aide à l\'orientation et mentorat.' },
  { title: 'Culture & cohésion communautaire', text: 'Événements, sport, cuisine et musique pour rassembler la communauté guinéenne et ses amis.' },
  { title: 'Projets humanitaires en Guinée', text: 'Soutien aux écoles, centres de santé, environnement et aide matérielle sur le terrain.' },
]

// Les données suivantes sont maintenant chargées depuis la base de données :
// - stats : via StatsSection
// - bureau : via BureauSection
// - projetsGuinee : via ProjetsGuineeSection
// - evenements : via EvenementsSection
// - actualites : via ActualitesSection

const faq = [
  { q: 'Comment adhérer ?', a: 'Remplissez le formulaire d\'adhésion et réglez la cotisation annuelle (montant indiqué lors de l\'inscription).' },
  { q: 'Faut-il être guinéen ?', a: 'L\'association est ouverte à tous. La plupart des membres sont guinéens, mais les soutiens extérieurs sont bienvenus.' },
  { q: 'Puis-je faire un don ?', a: 'Oui, les dons soutiennent directement les projets en Guinée et les actions locales. Une page transparence présente l\'usage des fonds.' },
  { q: 'Comment participer aux activités ?', a: 'Consultez le calendrier des événements et inscrivez-vous. Les infos pratiques sont partagées aux membres.' },
]

// Les événements sont maintenant chargés depuis l'API

const bureau = [
  { nom: 'Nom à compléter', role: 'Président', mandat: '2024 - 2026' },
  { nom: 'Nom à compléter', role: 'Vice-président', mandat: '2024 - 2026' },
  { nom: 'Nom à compléter', role: 'Secrétaire général', mandat: '2024 - 2026' },
  { nom: 'Nom à compléter', role: 'Trésorier', mandat: '2024 - 2026' },
]

const socialPosts = [
  {
    title: 'Solidarité et culture — AGCM',
    excerpt: 'Nos actions de cohésion et de soutien pour la communauté guinéenne en Charente-Maritime.',
    date: '2025',
    network: 'Facebook',
    icon: Facebook,
    link: 'https://www.facebook.com/share/14NXh1YLUkc/?mibextid=wwXIfr'
  },
  {
    title: 'Échanges et rencontres',
    excerpt: 'Moments partagés, intégration, sport et culture au service du vivre-ensemble.',
    date: '2025',
    network: 'Facebook',
    icon: Facebook,
    link: 'https://www.facebook.com/share/14NXh1YLUkc/?mibextid=wwXIfr'
  },
  {
    title: 'Projets solidaires',
    excerpt: 'Actions en Guinée et en France : kits scolaires, santé, environnement.',
    date: '2025',
    network: 'Facebook',
    icon: Facebook,
    link: 'https://www.facebook.com/share/14NXh1YLUkc/?mibextid=wwXIfr'
  },
]



export default function AGCMLanding() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

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
    <div className="min-h-screen bg-gradient-to-b from-agcm-900 via-agcm-800 to-agcm-900">

      {/* Hero */}
      <section id="top" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-45">
          <Image src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80" alt="Communauté" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-agcm-900/92 via-agcm-800/90 to-agcm-700/90"></div>
        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full border border-white/20 text-xs uppercase tracking-wide">
              AGCM-GCM
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
              Unis par nos racines, engagés pour notre avenir.
            </h1>
            <p className="text-lg text-slate-200">
              L'AGCM fédère et accompagne les Guinéens de La Charente-Maritime, valorise notre culture et porte des projets solidaires ici et en Guinée.
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
          <div className="relative lg:h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-yellow-500/15 to-red-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 border-2 border-white/20 backdrop-blur-xl rounded-3xl p-6 h-full flex flex-col justify-between shadow-2xl hover:shadow-red-500/20 transition-shadow duration-300">
              <div className="space-y-3 overflow-hidden scrollbar-hide flex-1 min-h-0">
                <div className="group flex items-start gap-4 bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent border border-red-400/30 rounded-2xl p-4 hover:from-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm mb-1 group-hover:text-red-200 transition-colors">Solidarité & accueil</p>
                    <p className="text-slate-200 text-xs leading-relaxed">Mentorat, aide administrative, accompagnement.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-4 bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-400/30 rounded-2xl p-4 hover:from-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/20">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm mb-1 group-hover:text-yellow-200 transition-colors">Jeunesse & insertion</p>
                    <p className="text-slate-200 text-xs leading-relaxed">Orientation, stages, ateliers pro.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-4 bg-gradient-to-r from-agcm-500/20 via-agcm-500/10 to-transparent border border-agcm-400/30 rounded-2xl p-4 hover:from-agcm-500/30 hover:border-agcm-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-agcm-500/20">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-agcm-500 to-agcm-600 rounded-xl flex items-center justify-center shadow-lg shadow-agcm-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Globe2 className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm mb-1 group-hover:text-agcm-200 transition-colors">Projets en Guinée</p>
                    <p className="text-slate-200 text-xs leading-relaxed">Éducation, santé, environnement.</p>
                  </div>
                </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mt-2">Dernières nouvelles</h2>
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
            <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mt-2">Les piliers d'action</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {axes.map((a, i) => (
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
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-agcm-600 font-semibold text-sm uppercase">Histoire & valeurs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-agcm-900">Née pour fédérer et soutenir</h2>
            <p className="text-agcm-800 leading-relaxed">
              L'AGCM est née de la volonté de Guinéens de La Rochelle de créer un espace d'entraide et d'intégration.
              Depuis 2023, nous accompagnons la communauté, renforçons les liens sociaux, valorisons notre culture et soutenons des projets humanitaires.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-agcm-900">
              {['Solidarité', 'Respect', 'Engagement', 'Cohésion', 'Culture & Identité'].map((v, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-agcm-400/40 rounded-2xl px-3 py-2 shadow-sm">
                  <CheckCircle size={16} className="text-agcm-600" />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-agcm-400/40 rounded-3xl p-6 shadow-xl lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-agcm-900"><Users size={18} /> Bureau exécutif</h3>
            <p className="text-agcm-800 text-sm mb-3">Une équipe engagée pour coordonner projets locaux et humanitaires.</p>
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
              Rejoignez l'association pour participer aux activités, recevoir les infos et soutenir les projets.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-red-500 mt-0.5" /> Accès aux événements et groupes</li>
              <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-red-500 mt-0.5" /> Info en priorité et accompagnement</li>
              <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-red-500 mt-0.5" /> Cotisation annuelle (montant à préciser)</li>
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
            <span className="text-red-600 font-semibold text-sm uppercase">Jeunesse & intégration</span>
            <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mt-2">Accompagner les jeunes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
            {[
              'Aide aux démarches (CAF, préfecture, école)',
              'Orientation / réussite scolaire',
              'Recherche de stage / job étudiant',
              'Mentorat par les anciens',
              'Ateliers insertion professionnelle',
              'Soutien moral aux nouveaux arrivants',
            ].map((item, i) => (
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
            <span className="text-red-600 font-semibold text-sm uppercase">Projets en Guinée</span>
            <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mt-2">Agir sur le terrain</h2>
            <p className="text-slate-700 text-sm mt-2 max-w-2xl mx-auto">
              Nous soutenons des actions concrètes pour l'éducation, la santé et l'environnement.
            </p>
          </div>
          <ProjetsGuineeSection />
        </div>
      </section>

      {/* Section Dons */}
      <DonationSection />

      {/* Projets locaux */}
      <section id="projets-locaux" className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-agcm-900 via-agcm-800 to-agcm-900 text-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative h-72">
            <Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" alt="Projets locaux" fill className="object-cover rounded-3xl shadow-2xl" />
          </div>
          <div className="space-y-4">
            <span className="text-red-300 font-semibold text-sm uppercase">Projets locaux</span>
            <h2 className="text-3xl font-bold">Agir en Charente-Maritime</h2>
            <p className="text-slate-200 text-sm leading-relaxed">
              Actions solidaires, événements culturels, activités sportives et soutien aux jeunes sur le territoire.
            </p>
            <ul className="space-y-2 text-sm text-slate-100">
              <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-red-300 mt-0.5" /> Événements culturels et cohésion</li>
              <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-red-300 mt-0.5" /> Actions solidaires locales</li>
              <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-red-300 mt-0.5" /> Sport, rencontres et intégration</li>
            </ul>
          </div>
        </div>
      </section>


      {/* Galerie */}
      <GalerieSection />

      {/* Partenaires & mécènes */}
      <section id="partenaires" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-red-600 font-semibold text-sm uppercase">Partenaires & mécènes</span>
            <h2 className="text-3xl font-bold text-agcm-900">Construire ensemble</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-700">
            {['Associations locales', 'Entreprises solidaires', 'Mairies / structures municipales', 'Clubs sportifs', 'Organisations guinéennes', 'Mécènes individuels'].map((p, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex gap-2">
                <HeartHandshake size={16} className="text-red-500 mt-1" />
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => setShowPartenaireModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-lg shadow hover:-translate-y-0.5 transition"
            >
              Devenir partenaire <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-agcm-900 via-agcm-800 to-agcm-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-red-300 font-semibold text-xs uppercase tracking-wider">Questions fréquentes</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 mt-1">
              Besoin de réponses ?
            </h2>
            <p className="text-base text-slate-200 max-w-2xl mx-auto">
              Réponses aux questions les plus fréquentes
            </p>
          </div>

          <div className="space-y-2">
            {faq.map((item, idx) => (
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
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-red-600 font-semibold text-sm uppercase">Contact</span>
            <h2 className="text-3xl md:text-4xl font-bold text-agcm-900">On reste en lien</h2>
            <p className="text-slate-700 text-sm">Horaires d'échange (indicatif) : Lundi - Vendredi, 18h-21h. Lien WhatsApp / Messenger sur demande.</p>
            <div className="space-y-3 text-slate-800 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>06 00 00 00 00</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle size={18} />
                <span>WhatsApp / Messenger (sur demande)</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>Charente-Maritime • France</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2687.674410555554!2d-1.1511393239070596!3d46.161579279053004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x480153c0fc4d4f73%3A0x40d37521e0dec60!2sLa%20Rochelle!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
                width="100%"
                height="260"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl border border-slate-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdhesionModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPartenaireModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowEvenementModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

