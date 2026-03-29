import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'KITCHEN');
  if ('error' in addonCheck) return addonCheck.error;

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

  const where: any = { kitchenId: kitchen.id };
  if (year) where.year = year;

  const summaries = await prisma.monthlyKitchenSummary.findMany({
    where,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 12,
  });

  return NextResponse.json(summaries);
}
