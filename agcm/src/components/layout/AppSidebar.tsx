'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Calendar,
  FolderOpen,
  Users,
  User,
  Shield,
  CheckCircle,
  Briefcase,
  Settings,
  Bell,
  UserCheck,
  ClipboardList,
  XCircle,
  BookOpen,
  Newspaper,
  Database,
  History,
  Mail,
  Handshake,
  Heart,
  X,
  Images,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ALL_BUREAU_MODULES,
  isBureauSidebarHrefAllowed,
  type BureauModule,
} from '@/lib/bureau-poste-perimetre';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: SidebarItem[];
  section?: string; // Pour organiser par sections
}

interface AppSidebarProps {
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  isBureau?: boolean;
  posteNom?: string;
  /** Modules bureau autorisés (membres du bureau) ; absent = tout */
  allowedBureauModules?: BureauModule[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AppSidebar({
  userRole,
  isBureau,
  posteNom,
  allowedBureauModules,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Extraire le chemin sans les query strings
    const hrefPath = href.split('?')[0];

    // Cas spécial pour la racine du dashboard (routeur)
    if (hrefPath === '/dashboard') {
      return pathname === '/dashboard';
    }

    if (hrefPath === '/super-admin') {
      return pathname === '/super-admin';
    }

    if (hrefPath === '/admin') {
      return pathname === '/admin';
    }

    if (hrefPath === '/bureau') {
      return pathname === '/bureau';
    }

    // Ancien chemin : conservé pour compat éventuelle des favoris
    if (hrefPath === '/app/dashboard') {
      return pathname === '/app/dashboard';
    }

    // Pour les chemins exacts
    if (pathname === hrefPath) return true;

    // Pour les autres chemins, vérifier si le pathname commence par le href
    return pathname.startsWith(hrefPath + '/') || pathname === hrefPath;
  };

  // Menu commun à tous
  const getDashboardHref = () => {
    if (userRole === 'SUPER_ADMIN') return '/admin';
    if (userRole === 'ADMIN') return '/admin';
    if (isBureau) return '/bureau';
    return '/';
  };

  // Salon chat : bureau = privé, admin = privé, membre = pas d'accès
  const chatItem: SidebarItem = {
    label: isBureau || userRole !== 'MEMBER' ? 'Salon privé bureau' : 'Salon public',
    href: '/app/chat',
    icon: MessageSquare,
  };

  const commonMenu: SidebarItem[] = [
    {
      label: 'Accueil',
      href: getDashboardHref(),
      icon: LayoutDashboard,
    },
    ...(isBureau || userRole !== 'MEMBER' ? [chatItem] : []),
    {
      label: 'Notifications',
      href: '/app/notifications',
      icon: Bell,
    },
  ];

  // Menu Super Admin - TOUTES les options disponibles avec CRUD complet
  const superAdminMenu: SidebarItem[] = [
    // ========== SECTION 1: GESTION SYSTÈME ==========
    {
      label: 'Utilisateurs',
      href: '/admin/users',
      icon: Users,
      section: 'Système',
    },
    {
      label: 'Mandats',
      href: '/admin/mandats',
      icon: Calendar,
      section: 'Système',
    },
    {
      label: 'Postes',
      href: '/admin/postes',
      icon: Briefcase,
      section: 'Système',
    },
    {
      label: 'Affectations',
      href: '/admin/affectations',
      icon: UserCheck,
      section: 'Système',
    },
    {
      label: 'Logs d\'Audit',
      href: '/admin/logs',
      icon: History,
      section: 'Système',
    },

    // ========== SECTION 2: GESTION ADMINISTRATIVE (NOUVEAU PANEL) ==========
    {
      label: 'Panel d\'Administration',
      href: '/admin',
      icon: Shield,
      section: 'Administration',
    },
  ];

  // Menu Admin/Président
  const adminMenu: SidebarItem[] = [
    {
      label: 'Panel d\'Administration',
      href: '/admin',
      icon: Shield,
    },
  ];

  // Menu Bureau
  const bureauMenu: SidebarItem[] = [
    {
      label: 'Salon privé bureau',
      href: '/app/chat',
      icon: MessageSquare,
    },
    {
      label: 'Mon profil',
      href: '/admin/profil',
      icon: User,
    },
    {
      label: 'Mes activités',
      href: '/bureau/contents',
      icon: FileText,
    },
    {
      label: 'Contenus rejetés',
      href: '/bureau/contents/rejetes',
      icon: XCircle,
      badge: 0, // Sera mis à jour dynamiquement
    },
    {
      label: 'Projets',
      href: '/bureau/projets',
      icon: FolderOpen,
    },
    {
      label: 'Événements',
      href: '/bureau/evenements',
      icon: Calendar,
    },
    {
      label: 'Galerie site',
      href: '/bureau/galerie',
      icon: Images,
    },
    {
      label: 'Partenaires',
      href: '/bureau/partenaires',
      icon: Handshake,
    },
    {
      label: 'Historique des actions',
      href: '/bureau/traces',
      icon: History,
    },
    {
      label: 'Paiements',
      href: '/dashboard/paiements',
      icon: Settings,
    },
    {
      label: 'Registre cotisations',
      href: '/bureau/registre-cotisations',
      icon: ClipboardList,
    },
  ];

  // Menu Membre simple (non utilisé en pratique : les MEMBER sans bureau sont renvoyés au site public)
  const memberMenu: SidebarItem[] = [
    {
      label: 'Mon profil',
      href: '/dashboard/profil',
      icon: User,
    },
    {
      label: 'Événements',
      href: '/evenements',
      icon: Calendar,
    },
    {
      label: 'Formations',
      href: '/formations',
      icon: FileText,
    },
    {
      label: 'Paiements',
      href: '/dashboard/paiements',
      icon: Settings,
    },
  ];

  // Construire le menu selon le rôle
  let menuItems: SidebarItem[] = [];

  if (userRole === 'SUPER_ADMIN') {
    // Pour SUPER_ADMIN, remplacer "Salon public" par "Salon privé bureau" dans le menu
    const commonMenuForSuperAdmin = commonMenu.map(item =>
      item.href === '/app/chat'
        ? { ...item, label: 'Salon privé bureau' }
        : item
    );
    // Le Super Admin a accès à TOUT, donc on combine tout
    menuItems = [...commonMenuForSuperAdmin, ...superAdminMenu];
  } else if (userRole === 'ADMIN') {
    menuItems = [...commonMenu, ...adminMenu];
  } else if (isBureau) {
    const modSet = new Set(allowedBureauModules ?? ALL_BUREAU_MODULES);
    const commonMenuForBureau = commonMenu
      .filter((item) => item.href !== '/app/chat')
      .filter((item) => isBureauSidebarHrefAllowed(item.href, modSet));
    const bureauMenuFiltered = bureauMenu.filter((item) =>
      isBureauSidebarHrefAllowed(item.href, modSet),
    );
    menuItems = [...commonMenuForBureau, ...bureauMenuFiltered];
  } else {
    menuItems = [...commonMenu, ...memberMenu];
  }

  const renderSidebarContent = (showCloseButton: boolean) => (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/30">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {userRole === 'SUPER_ADMIN' ? 'Super Administration' : userRole === 'ADMIN' ? 'Administration' : isBureau ? `Bureau - ${posteNom || ''}` : 'Espace Membre'}
        </h2>
        {showCloseButton && onMobileClose && (
          <button onClick={onMobileClose} className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg transition-colors" aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4 px-4 custom-scrollbar">
        <nav className="flex-1 space-y-1">
          {(() => {
            if (userRole === 'SUPER_ADMIN') {
              const sections: Record<string, SidebarItem[]> = {};
              const itemsWithoutSection: SidebarItem[] = [];

              menuItems.forEach(item => {
                if (item.section) {
                  if (!sections[item.section]) sections[item.section] = [];
                  sections[item.section].push(item);
                } else {
                  itemsWithoutSection.push(item);
                }
              });

              return (
                <>
                  {itemsWithoutSection.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={`${item.href}-${item.label}-${index}`}
                        href={item.href}
                        onClick={showCloseButton ? onMobileClose : undefined}
                        className={cn(
                          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                          active ? 'bg-blue-500/10 text-blue-400 shadow-sm border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:shadow-sm'
                        )}
                      >
                        <Icon className={cn('mr-3 h-5 w-5 shrink-0', active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">{item.badge > 9 ? '9+' : item.badge}</span>
                        )}
                      </Link>
                    );
                  })}
                  {Object.entries(sections).map(([sectionName, sectionItems]) => (
                    <div key={sectionName} className="mt-6 first:mt-0">
                      <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{sectionName}</h3>
                      {sectionItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={`${item.href}-${item.label}-${index}`}
                            href={item.href}
                            onClick={showCloseButton ? onMobileClose : undefined}
                            className={cn(
                              'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                              active ? 'bg-blue-500/10 text-blue-400 shadow-sm border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:shadow-sm'
                            )}
                          >
                            <Icon className={cn('mr-3 h-5 w-5 shrink-0', active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
                            <span className="flex-1">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">{item.badge > 9 ? '9+' : item.badge}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </>
              );
            }
            return menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={`${item.href}-${item.label}-${index}`}
                  href={item.href}
                  onClick={showCloseButton ? onMobileClose : undefined}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    active ? 'bg-blue-500/10 text-blue-400 shadow-sm border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:shadow-sm'
                  )}
                >
                  <Icon className={cn('mr-3 h-5 w-5 shrink-0', active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">{item.badge > 9 ? '9+' : item.badge}</span>
                  )}
                </Link>
              );
            });
          })()}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && onMobileClose && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onMobileClose} aria-hidden="true" />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-slate-900 backdrop-blur-xl border-r border-slate-800/50 shadow-2xl md:hidden">
            {renderSidebarContent(true)}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] z-20 transition-all duration-300">
        {renderSidebarContent(false)}
      </aside>
    </>
  );
}

