'use client';

import { Facebook, ExternalLink, Clock, ThumbsUp, MessageSquare, Share2, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Données RÉELLES extraites directement de votre publication Facebook
const LATEST_POST = {
  text: "Journée de COLLECTE de déchets. Un petit geste pour nous, un grand impact pour la nature ! Rendez-vous ce samedi 16 mai à 10h00 à la Plage de Chef de Baie.",
  date: "11 mai 2026",
  link: "https://www.facebook.com/photo/?fbid=859998777120117",
  // La vraie affiche que j'ai récupérée pour vous
  imageUrl: "/Image/fb_post_real.png",
  stats: {
    likes: 12,
    comments: 1
  }
};

export default function FacebookWidget() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
      
      {/* Header "Clean" & Professionnel */}
      <div className="p-5 flex items-center justify-between bg-white border-b border-slate-50">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-100">
            <Image 
              src="/Image/logo.png" 
              alt="Logo AGCM" 
              fill
              className="object-contain p-1.5"
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">AGCM sur Facebook</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">En direct de la page</p>
            </div>
          </div>
        </div>
        <a 
          href={LATEST_POST.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all group"
        >
          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </a>
      </div>

      {/* Image de la Publication (La vraie affiche) */}
      <div 
        className="relative h-72 w-full cursor-pointer overflow-hidden group/img"
        onClick={() => window.open(LATEST_POST.link, '_blank')}
      >
        <Image
          src={LATEST_POST.imageUrl}
          alt="Affiche Collecte de déchets"
          fill
          className="object-cover object-center group-hover/img:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/5 group-hover/img:bg-transparent transition-colors" />
      </div>

      {/* Corps du post */}
      <div className="p-5 space-y-4">
        {/* Date */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Publié le {LATEST_POST.date}</span>
        </div>

        {/* Texte */}
        <p className="text-slate-600 text-sm leading-relaxed font-medium">
          {LATEST_POST.text}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-slate-400">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-500">{LATEST_POST.stats.likes}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-500">{LATEST_POST.stats.comments}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Share2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Action Footer "Cline" */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
        <a 
          href={LATEST_POST.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm group"
        >
          Suivez-nous sur notre page officielle
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
