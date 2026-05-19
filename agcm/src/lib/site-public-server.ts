import { prisma } from '@/lib/prisma';
import { SITE_PUBLIC_DEFAULT_PAYLOAD } from '@/config/site-public-default-payload';
import type { SitePublicPayload } from '@/types/site-public';

export async function getSitePublicPayload(): Promise<SitePublicPayload> {
  try {
    const row = await prisma.sitePublicPage.findUnique({
      where: { id: 'default' },
    });
    if (
      row?.payload &&
      typeof row.payload === 'object' &&
      !Array.isArray(row.payload)
    ) {
      return row.payload as unknown as SitePublicPayload;
    }
  } catch {
    /* base vide ou migration non appliquée */
  }
  return SITE_PUBLIC_DEFAULT_PAYLOAD;
}
