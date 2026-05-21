import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma, prismaRetry } from '@/lib/prisma';
import { isBureauActif, getBureauMandatContext } from '@/lib/rbac';
import { getBureauPerimetreForPostes, type BureauModule, ALL_BUREAU_MODULES } from '@/lib/bureau-poste-perimetre';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

function DbUnavailableScreen({ reason }: { reason: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
                <h1 className="text-2xl font-bold text-white">Espace admin temporairement indisponible</h1>
                <p className="mt-3 text-sm text-slate-300">
                    Impossible de joindre la base de données ({reason}). C&apos;est généralement
                    passager : le pool de connexions Prisma est saturé. Réessayez dans quelques
                    secondes.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/admin"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
                    >
                        Réessayer
                    </Link>
                    <Link
                        href="/"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    >
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/connexion');
    }

    const role = session.user.role;

    if (role === 'MEMBER') {
        let bureau: boolean;
        try {
            bureau = await prismaRetry(() => isBureauActif(session.user.id));
        } catch (err) {
            console.error('[AdminLayout] isBureauActif a échoué :', err);
            return (
                <DbUnavailableScreen reason={err instanceof Error ? err.message : 'erreur DB'} />
            );
        }
        if (!bureau) {
            redirect('/dashboard');
        }

        let user;
        try {
            user = await prismaRetry(() =>
                prisma.user.findUnique({
                    where: { id: session.user.id },
                    include: { member: true },
                }),
            );
        } catch (err) {
            console.error('[AdminLayout] findUnique(user) a échoué :', err);
            return (
                <DbUnavailableScreen reason={err instanceof Error ? err.message : 'erreur DB'} />
            );
        }
        if (!user) {
            redirect('/connexion');
        }

        const userInfo = {
            name: user.member ? `${user.member.prenom} ${user.member.nom}` : user.email,
            email: user.email,
            role: user.roleSysteme,
            photoUrl: user.member?.photoUrl || undefined,
        };

        let ctx: Awaited<ReturnType<typeof getBureauMandatContext>>;
        try {
            ctx = await prismaRetry(() => getBureauMandatContext(session.user.id));
        } catch (err) {
            console.error('[AdminLayout] getBureauMandatContext a échoué :', err);
            ctx = null;
        }
        const allowedBureauModules: BureauModule[] = ctx
            ? Array.from(getBureauPerimetreForPostes(ctx.affectations.map((a) => a.poste.nom)).modules)
            : [...ALL_BUREAU_MODULES];

        return (
            <div className="dark flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-blue-500/30">
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-purple-900/20 blur-[100px]" />
                    <div className="absolute top-[40%] left-[60%] w-[20vw] h-[20vw] rounded-full bg-emerald-900/10 blur-[80px]" />
                </div>

                <AdminSidebar role={user.roleSysteme} allowedBureauModules={allowedBureauModules} />

                <div className="relative z-10 flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden">
                    <AdminHeader user={userInfo} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 md:p-8">
                        <div className="mx-auto max-w-7xl">{children}</div>
                    </main>
                </div>
            </div>
        );
    }

    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        redirect('/dashboard');
    }

    let user;
    try {
        user = await prismaRetry(() =>
            prisma.user.findUnique({
                where: { id: session.user.id },
                include: { member: true },
            }),
        );
    } catch (err) {
        console.error('[AdminLayout] findUnique(user, ADMIN) a échoué :', err);
        return <DbUnavailableScreen reason={err instanceof Error ? err.message : 'erreur DB'} />;
    }

    if (!user) {
        redirect('/connexion');
    }

    const userInfo = {
        name: user.member ? `${user.member.prenom} ${user.member.nom}` : user.email,
        email: user.email,
        role: user.roleSysteme,
        photoUrl: user.member?.photoUrl || undefined,
    };

    return (
        <div className="dark flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-blue-500/30">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-purple-900/20 blur-[100px]" />
                <div className="absolute top-[40%] left-[60%] w-[20vw] h-[20vw] rounded-full bg-emerald-900/10 blur-[80px]" />
            </div>

            <AdminSidebar role={user.roleSysteme} />

            <div className="flex flex-col flex-1 w-full h-full overflow-hidden relative z-10">
                <AdminHeader user={userInfo} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 md:p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
