'use client';

import { Facebook, Twitter, Link2, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 sticky top-32">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Partager</p>
      <div className="flex lg:flex-col gap-2">
        <button
          onClick={shareOnFacebook}
          className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          title="Partager sur Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        <button
          onClick={shareOnTwitter}
          className="p-3 rounded-full bg-sky-50 text-sky-500 hover:bg-sky-500 hover:text-white transition-colors"
          title="Partager sur X"
        >
          <Twitter className="w-5 h-5" />
        </button>
        <button
          onClick={shareOnWhatsApp}
          className="p-3 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
          title="Partager sur WhatsApp"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={copyToClipboard}
          className={`p-3 rounded-full bg-slate-50 transition-colors ${
            copied ? 'text-green-600' : 'text-slate-600 hover:bg-slate-200'
          }`}
          title="Copier le lien"
        >
          <Link2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
