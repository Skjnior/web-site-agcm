// components/dashboard/DashboardNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Vue d\'ensemble', href: '/dashboard', icon: '📊' },
  { name: 'Mon profil', href: '/dashboard/profil', icon: '👤' },
  { name: 'Mes formations', href: '/dashboard/mes-formations', icon: '📚' },
  { name: 'Mes événements', href: '/dashboard/mes-evenements', icon: '📅' },
  { name: 'Mes paiements', href: '/dashboard/paiements', icon: '💳' },
];

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-r min-h-screen w-64 p-4 space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive(item.href)
              ? 'bg-guinea-red/10 text-guinea-red font-semibold'
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

