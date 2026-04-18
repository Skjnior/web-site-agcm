'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ApprobationsList from '@/components/admin/ApprobationsList';

interface Content {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  statutWorkflow: string;
  visibiliteCible: string;
  createdAt: Date;
  auteurPoste: {
    nom: string;
    affectations: Array<{
      member: {
        prenom: string;
        nom: string;
        user: { email: string };
      };
    }>;
  };
  mandat: { titre: string };
  approvedBy: { email: string } | null;
  rejectionReason: string | null;
  canApprove: boolean;
}

interface ApprobationsPageClientProps {
  initialContents: Content[];
  initialPage: number;
  initialTotalPages: number;
  initialTotal: number;
  initialStatus: string;
}

export default function ApprobationsPageClient({
  initialContents,
  initialPage,
  initialTotalPages,
  initialTotal,
  initialStatus,
}: ApprobationsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contents, setContents] = useState(initialContents);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = parseInt(searchParams.get('page') || '1');
    const s = searchParams.get('status') || 'SOUMIS';
    setPage(p);
    setStatus(s);
  }, [searchParams]);

  useEffect(() => {
    const p = parseInt(searchParams.get('page') || '1');
    const s = searchParams.get('status') || 'SOUMIS';
    if (p === initialPage && s === initialStatus) {
      setContents(initialContents);
      setTotal(initialTotal);
      setTotalPages(initialTotalPages);
    } else {
      fetchContents();
    }
  }, [searchParams]);

  const fetchContents = async () => {
    setLoading(true);
    const p = parseInt(searchParams.get('page') || '1');
    const s = searchParams.get('status') || 'SOUMIS';
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: '10',
        status: s,
      });
      const res = await fetch(`/api/admin/approbations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContents((data.data || []).map((c: Content) => ({ ...c, canApprove: true })));
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/admin/approbations?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['SOUMIS', 'REJETE', 'APPROUVE', 'PUBLIE'].map((s) => (
          <Link key={s} href={`/admin/approbations?status=${s}&page=1`}>
            <Button
              variant={status === s ? 'default' : 'outline'}
              size="sm"
              className={status === s ? 'bg-slate-700' : ''}
            >
              {s === 'SOUMIS' ? 'En attente' : s === 'REJETE' ? 'Rejetés' : s === 'APPROUVE' ? 'Approuvés' : 'Publiés'}
            </Button>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
        </div>
      ) : (
        <div className="admin-panel overflow-hidden rounded-xl">
          <ApprobationsList
            contents={contents}
            currentPage={page}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
            onContentDeleted={fetchContents}
          />
        </div>
      )}
    </div>
  );
}
