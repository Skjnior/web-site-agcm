// src/app/api/super-admin/page-views/route.ts
// API pour consulter les visites de pages (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';
  const country = searchParams.get('country') || '';
  const userId = searchParams.get('userId') || '';
  const visitorType = searchParams.get('visitorType') || 'all'; // 'all' | 'members' | 'visitors'
  const search = searchParams.get('search') || ''; // recherche IP ou User-Agent
  const { page, limit, offset } = parsePagination(request);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (path) where.path = { contains: path, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (visitorType === 'members') where.userId = { not: null };
    if (visitorType === 'visitors') where.userId = null;
    if (search) {
      where.OR = [
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { userAgent: { contains: search, mode: 'insensitive' } },
        { isp: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { member: { prenom: { contains: search, mode: 'insensitive' } } } },
        { user: { member: { nom: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [total, views, stats] = await Promise.all([
      prisma.pageView.count({ where }),
      prisma.pageView.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              member: { select: { prenom: true, nom: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      // Stats globales (sans filtre pour le résumé)
      prisma.pageView.groupBy({
        by: ['path'],
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
    ]);

    // Stats complémentaires
    const [uniqueIPs, totalVisitors, totalMembers, topCountries] = await Promise.all([
      prisma.pageView.findMany({
        where: {},
        select: { ipAddress: true },
        distinct: ['ipAddress'],
      }),
      prisma.pageView.count({ where: { userId: null } }),
      prisma.pageView.count({ where: { userId: { not: null } } }),
      prisma.pageView.groupBy({
        by: ['country', 'countryCode'],
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10,
        where: { country: { not: null } },
      }),
    ]);

    return NextResponse.json({
      ...createPaginatedResponse(views, total, page, limit),
      summary: {
        total: await prisma.pageView.count(),
        uniqueIPs: uniqueIPs.length,
        totalVisitors,
        totalMembers,
        topPages: stats.map(s => ({ path: s.path, count: s._count.path })),
        topCountries: topCountries.map(c => ({
          country: c.country,
          countryCode: c.countryCode,
          count: c._count.country,
        })),
      },
    });
  } catch (error: any) {
    console.error('Erreur page-views full:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      message: error.message 
    }, { status: 500 });
  }
}
