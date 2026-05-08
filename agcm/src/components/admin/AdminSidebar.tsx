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
    Activity,
    Mail,
    Bell,
    MessageSquare,
    XCircle,
    History,
    Settings,
} from 'lucide-react';
import { signOutWithConfirmation } from '@/lib/sign-out-confirm';
import {
    ALL_BUREAU_MODULES,
    isBureauSidebarHrefAllowed,
    type BureauModule,
} from '@/lib/bureau-poste-perimetre';

interface SidebarProps {
    role: string | undefined;
    allowedBureauModules?: BureauModule[];
}

function navItemIsActive(pathname: string, href: string) {
    const hrefPath = href.split('?')[0];
    if (hrefPath === '/bureau') return pathname === '/bureau';
    if (hrefPath === '/admin') return pathname === '/admin';
    if (pathname === hrefPath) return true;
    return pathname.startsWith(`${hrefPath}/`);
}

export default function AdminSidebar({ role, allowedBureauModules }: SidebarProps) {
    const pathname = usePathname();

    const fullNavigation = [
        { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
        { name: 'Mon profil', href: '/admin/profil', icon: CircleUser },
        { name: 'Approbations', href: '/admin/approbations', icon: CheckSquare },
        { name: 'Actualités', href: '/admin/actualites', icon: FileText },
        { name: 'Événements', href: '/admin/evenements', icon: Calendar },
        { name: 'Membres', href: '/admin/membres', icon: Users },
        { name: 'Demandes', href: '/admin/demandes', icon: ClipboardList },
        { name: 'Messages contact', href: '/admin/messages-contact', icon: Mail },
    ];

    /** Même menu que AppSidebar (branche bureau) pour les MEMBER actifs au bureau — y compris sur /admin/* */
    const memberBureauNavigation = [
        { name: 'Accueil', href: '/bureau', icon: LayoutDashboard },
        { name: 'Notifications', href: '/app/notifications', icon: Bell },
        { name: 'Salon privé bureau', href: '/app/chat', icon: MessageSquare },
        { name: 'Mon profil', href: '/admin/profil', icon: CircleUser },
        { name: 'Mes activités', href: '/bureau/contents', icon: FileText },
        { name: 'Contenus rejetés', href: '/bureau/contents/rejetes', icon: XCircle },
        { name: 'Projets', href: '/bureau/projets', icon: FolderOpen },
        { name: 'Événements', href: '/bureau/evenements', icon: Calendar },
        { name: 'Historique des actions', href: '/bureau/traces', icon: History },
        { name: 'Paiements', href: '/dashboard/paiements', icon: Settings },
    ];

    const superAdminExtras = [
        { name: 'Utilisateurs', href: '/admin/users', icon: Users },
        { name: 'Mandats', href: '/admin/mandats', icon: GraduationCap },
        { name: 'Postes', href: '/admin/postes', icon: FolderOpen },
        { name: 'Affectations', href: '/admin/affectations', icon: ClipboardList },
        { name: 'Logs système', href: '/admin/logs', icon: ShieldAlert },
        { name: 'Visites', href: '/admin/logs/visits', icon: Activity },
    ];

    const navigation =
        role === 'MEMBER'
            ? memberBureauNavigation.filter((item) =>
                  isBureauSidebarHrefAllowed(
                      item.href,
                      new Set(allowedBureauModules ?? ALL_BUREAU_MODULES),
                  ),
              )
            : role === 'SUPER_ADMIN'
              ? [...fullNavigation, ...superAdminExtras]
              : fullNavigation;
    return (
        <aside className="z-20 hidden h-full w-64 flex-col border-r border-slate-800/50 bg-slate-900/40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 md:flex">
            <div className="flex h-16 shrink-0 items-center border-b border-slate-800/50 bg-slate-900/30 px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-sm">AG</span>
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
                        AGCM Admin
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4 px-4 custom-scrollbar">
                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => {
                        const isActive =
                            role === 'MEMBER'
                                ? navItemIsActive(pathname, item.href)
                                : pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={`${item.href}-${item.name}`}
                                href={item.href}
                                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm'
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

            <div className="border-t border-slate-800/50 bg-slate-900/20 p-4">
                <button
                    onClick={() => void signOutWithConfirmation({ callbackUrl: '/' })}
                    className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 hover:shadow-sm transition-all duration-200"
                >
                    <LogOut className="mr-3 h-5 w-5 shrink-0 text-red-500/70 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0)] group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
