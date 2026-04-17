'use client';

import { Bell, Menu, Search, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminHeaderProps {
    user: {
        name: string;
        email: string;
        role: string;
        photoUrl?: string;
    };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const pathname = usePathname();

    // Simple breadcrumb logic based on pathname
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        return { name, isLast };
    });

    return (
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl px-4 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)] sm:gap-x-6 sm:px-6 lg:px-8 transition-all duration-300">

            {/* Mobile menu button */}
            <button type="button" className="-m-2.5 p-2.5 text-slate-300 md:hidden hover:bg-slate-800 rounded-lg transition-colors">
                <span className="sr-only">Ouvrir le menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-800 md:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
                {/* Breadcrumb / Title area */}
                <div className="flex flex-1 items-center">
                    <nav className="hidden sm:flex" aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-2">
                            {breadcrumbs.map((crumb, idx) => (
                                <li key={crumb.name} className="flex items-center text-sm">
                                    {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-600 mx-1" />}
                                    <span className={`font-medium ${crumb.isLast ? 'text-slate-100' : 'text-slate-400'}`}>
                                        {crumb.name}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>

                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Notifications */}
                    <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-all relative group">
                        <span className="sr-only">Voir les notifications</span>
                        <Bell className="h-5 w-5 group-hover:animate-pulse" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-900 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    </button>

                    {/* Separator */}
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-800" aria-hidden="true" />

                    {/* Profil — lien vers /admin/profil */}
                    <Link
                        href="/admin/profil"
                        className="-m-1.5 flex items-center p-1.5 group hover:bg-slate-800/50 rounded-lg transition-all pr-2 border border-transparent hover:border-slate-800"
                    >
                        <span className="sr-only">Mon profil</span>
                        <div className="relative h-9 w-9 rounded-full bg-slate-800 overflow-hidden shadow-sm border border-slate-700 ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all">
                            {user.photoUrl ? (
                                <Image
                                    className="h-full w-full object-cover"
                                    src={user.photoUrl}
                                    alt={user.name}
                                    fill
                                    unoptimized={user.photoUrl.startsWith('http') || user.photoUrl.startsWith('/')}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs uppercase">
                                    {user.name.substring(0, 2)}
                                </div>
                            )}
                        </div>
                        <span className="hidden lg:flex lg:items-center">
                            <span className="ml-3 text-sm font-semibold leading-6 text-slate-200 transition-colors group-hover:text-blue-400" aria-hidden="true">
                                {user.name}
                            </span>
                            <span className="ml-2 rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                                {user.role}
                            </span>
                        </span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
