// app/api/admin/members/generate-number/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { generateMemberNumber } from '@/lib/member-number';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberNumber = await generateMemberNumber();

    return NextResponse.json({ success: true, memberNumber });
  } catch (error) {
    console.error('Error generating member number:', error);
    return NextResponse.json({ error: 'Failed to generate member number' }, { status: 500 });
  }
}

