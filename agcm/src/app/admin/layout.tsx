import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/connexion');
    }

    // Vérification stricte du rôle
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        redirect('/dashboard');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            member: true,
        }
    });

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
        <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Background decoration for premium dark feel */}
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
