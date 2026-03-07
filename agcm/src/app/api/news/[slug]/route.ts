import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Context = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { slug } = await params;
    const news = await prisma.content.findUnique({ where: { id: slug } });
    if (!news) return NextResponse.json({ success: false, error: 'News not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('News detail error:', error);
    return NextResponse.json({ success: false, error: 'Unable to fetch news' }, { status: 500 });
  }
}
