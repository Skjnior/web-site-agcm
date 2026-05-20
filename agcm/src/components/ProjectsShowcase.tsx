// src/components/ProjectsShowcase.tsx
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

type Project = {
  id: string;
  titre: string;
  description: string;
  imageUrl: string | null;
};

export default function ProjectsShowcase() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projets')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-agcm-500" />
      </div>
    );
  }

  if (!projects.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(p => (
        <div key={p.id} className="rounded-xl overflow-hidden shadow-lg bg-white/80 dark:bg-slate-800/80">
          {p.imageUrl ? (
            <Image src={p.imageUrl} alt={p.titre} width={400} height={250} className="object-cover w-full h-48" />
          ) : (
            <div className="h-48 bg-slate-200 flex items-center justify-center">
              <span className="text-slate-500">Pas d'image</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-agcm-900 dark:text-slate-100">{p.titre}</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-3">{p.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
