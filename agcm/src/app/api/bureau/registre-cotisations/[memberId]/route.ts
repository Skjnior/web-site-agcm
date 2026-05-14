import { NextRequest, NextResponse } from 'next/server';
import { requireRegistreCotisationsAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { registreCotisationPatchSchema } from '@/lib/validators/registre-cotisations';
import { parseDateParamYYYYMMDD } from '@/lib/registre-cotisations-utils';
import { z } from 'zod';

type RouteContext = { params: Promise<{ memberId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error, session } = await requireRegistreCotisationsAccess();
  if (error) return error;

  const { memberId } = await context.params;
  if (!memberId) {
    return NextResponse.json({ error: 'memberId manquant' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 });
  }

  let parsed: z.infer<typeof registreCotisationPatchSchema>;
  try {
    parsed = registreCotisationPatchSchema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: e.issues }, { status: 400 });
    }
    throw e;
  }

  const dateReference = parseDateParamYYYYMMDD(parsed.dateReference);
  if (!dateReference) {
    return NextResponse.json({ error: 'dateReference invalide' }, { status: 400 });
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true },
  });
  if (!member) {
    return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
  }

  const situationText = parsed.situationText !== undefined ? parsed.situationText : undefined;
  const absencesText =
    parsed.absencesText !== undefined ? parsed.absencesText : undefined;

  const upserted = await prisma.memberRegistreCotisation.upsert({
    where: {
      memberId_dateReference: {
        memberId,
        dateReference,
      },
    },
    create: {
      memberId,
      dateReference,
      situationText: situationText ?? '',
      absencesText: absencesText === undefined ? null : absencesText,
      updatedByUserId: session!.user!.id!,
    },
    update: {
      ...(situationText !== undefined ? { situationText } : {}),
      ...(absencesText !== undefined ? { absencesText } : {}),
      updatedByUserId: session!.user!.id!,
    },
  });

  return NextResponse.json({
    id: upserted.id,
    memberId: upserted.memberId,
    dateReference: parsed.dateReference,
    situationText: upserted.situationText,
    absencesText: upserted.absencesText,
    updatedAt: upserted.updatedAt,
  });
}
