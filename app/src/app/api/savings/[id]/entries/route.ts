import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  // Verify measure belongs to client
  const measure = await prisma.savingsMeasure.findFirst({
    where: { id: params.id, clientId },
  });
  if (!measure) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const entry = await prisma.savingsEntry.create({
    data: {
      measureId: params.id,
      month: body.month,
      year: body.year,
      savingsAmount: body.savingsAmount,
      kwhSaved: body.kwhSaved || null,
      method: body.method || 'MANUAL',
      notes: body.notes || null,
    },
  });

  // Update measure's actual monthly savings (average of all entries)
  const allEntries = await prisma.savingsEntry.findMany({ where: { measureId: params.id } });
  const avgSavings = allEntries.reduce((s, e) => s + e.savingsAmount, 0) / allEntries.length;
  const totalSavings = allEntries.reduce((s, e) => s + e.savingsAmount, 0);
  const avgKwh = allEntries.reduce((s, e) => s + (e.kwhSaved || 0), 0) / allEntries.length;
  const payback = avgSavings > 0 ? measure.investmentCost / avgSavings : null;

  await prisma.savingsMeasure.update({
    where: { id: params.id },
    data: {
      actualMonthlySavings: Math.round(avgSavings),
      actualKwhSavings: Math.round(avgKwh),
      cumulativeSavings: Math.round(totalSavings),
      paybackMonths: payback ? Math.round(payback * 10) / 10 : null,
      status: measure.status === 'PLANNED' ? 'IMPLEMENTED' : measure.status,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
