'use client';

import { FileText, BookOpen, ShieldCheck } from 'lucide-react';

export default function AboutDocuments() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Documents Officiels
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Consultez les textes fondamentaux qui régissent le fonctionnement et l'organisation de l'Association des Guinéens de La Charente-Maritime.
          </p>
        </div>

        <div className="space-y-24">
          
          {/* Statuts Section */}
          <div id="statuts" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-8 h-8 text-green-600 dark:text-green-500" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Statuts de l'Association</h3>
            </div>
            
            <div className="w-full h-[800px] border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 flex flex-col shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">statuts-agcm-nov-2025-signed.pdf</span>
                <a 
                  href="/documents/statuts-agcm-nov-2025-signed.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  Ouvrir en plein écran
                </a>
              </div>
              <iframe 
                src="/documents/statuts-agcm-nov-2025-signed.pdf#view=FitH" 
                className="w-full flex-grow"
                title="Statuts de l'Association"
              />
            </div>
          </div>

          {/* Reglement Interieur Section */}
          <div id="reglement-interieur" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-500" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Règlement Intérieur</h3>
            </div>
            
            <div className="w-full h-[800px] border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 flex flex-col shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">reglement-interieur-ajgcm-juillet.pdf</span>
                <a 
                  href="/documents/reglement-interieur-ajgcm-juillet.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  Ouvrir en plein écran
                </a>
              </div>
              <iframe 
                src="/documents/reglement-interieur-ajgcm-juillet.pdf#view=FitH" 
                className="w-full flex-grow"
                title="Règlement Intérieur"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
