// components/admin/AdminNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Membres', href: '/admin/membres', icon: '👥' },
  { name: 'Formations', href: '/admin/formations', icon: '📚' },
  { name: 'Événements', href: '/admin/evenements', icon: '📅' },
  { name: 'Actualités', href: '/admin/actualites', icon: '📰' },
  { name: 'Ressources', href: '/admin/ressources', icon: '📁' },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-r min-h-screen w-64 p-4 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Administration</h2>
        <p className="text-xs text-gray-500 mt-1">Interface de gestion</p>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive(item.href)
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}

