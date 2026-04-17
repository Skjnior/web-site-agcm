'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Calendar,
    ClipboardList,
    ShieldAlert,
    LogOut,
    FolderOpen,
    GraduationCap,
    CheckSquare,
    CircleUser,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
    role: string | undefined;
}

export default function AdminSidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
        { name: 'Mon profil', href: '/admin/profil', icon: CircleUser },
        { name: 'Approbations', href: '/admin/approbations', icon: CheckSquare },
        { name: 'Actualités', href: '/admin/actualites', icon: FileText },
        { name: 'Événements', href: '/admin/evenements', icon: Calendar },
        { name: 'Membres', href: '/admin/membres', icon: Users },
        { name: 'Demandes', href: '/admin/demandes', icon: ClipboardList },
    ];

    if (role === 'SUPER_ADMIN') {
        navigation.push(
            { name: 'Utilisateurs', href: '/admin/users', icon: Users },
            { name: 'Mandats', href: '/admin/mandats', icon: GraduationCap },
            { name: 'Postes', href: '/admin/postes', icon: FolderOpen },
            { name: 'Affectations', href: '/admin/affectations', icon: ClipboardList },
            { name: 'Logs système', href: '/admin/logs', icon: ShieldAlert }
        );
    }

    return (
        <aside className="hidden md:flex flex-col w-64 h-full bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] z-20 transition-all duration-300">
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800/50 bg-slate-900/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-sm">AG</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        AGCM Admin
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4 px-4 custom-scrollbar">
                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-blue-500/10 text-blue-400 shadow-sm border border-blue-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:shadow-sm'
                                    }
                `}
                            >
                                <item.icon
                                    className={`
                    mr-3 h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110
                    ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-slate-500 group-hover:text-slate-300'}
                  `}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800/50 bg-slate-900/20">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 hover:shadow-sm transition-all duration-200"
                >
                    <LogOut className="mr-3 h-5 w-5 shrink-0 text-red-500/70 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0)] group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
