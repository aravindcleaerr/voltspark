import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const bills = await prisma.utilityBill.findMany({
    where: { clientId: result.clientId },
    include: { enteredBy: { select: { name: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  // Summary stats
  const client = await prisma.client.findUnique({
    where: { id: result.clientId },
    select: { contractDemand: true, powerFactorTarget: true },
  });

  const totalPfPenalty = bills.reduce((sum, b) => sum + (b.pfPenalty || 0), 0);
  const avgPowerFactor = bills.length > 0 ? bills.reduce((sum, b) => sum + (b.powerFactor || 0), 0) / bills.length : 0;
  const totalAmount = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const monthsWithPenalty = bills.filter(b => b.hasPfPenalty).length;
  const monthsWithOvershoot = bills.filter(b => b.hasDemandOvershoot).length;
  const anomalyMonths = bills.filter(b => b.hasAnomaly).length;

  return NextResponse.json({
    bills,
    summary: {
      totalBills: bills.length,
      totalAmount,
      totalPfPenalty,
      avgPowerFactor: Math.round(avgPowerFactor * 100) / 100,
      monthsWithPenalty,
      monthsWithOvershoot,
      anomalyMonths,
      contractDemand: client?.contractDemand || null,
      pfTarget: client?.powerFactorTarget || null,
    },
  });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  if (result.user.clientRole === 'VIEWER' || result.user.clientRole === 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { month, year, provider, tariffCategory, unitsConsumed, demandKVA, powerFactor, energyCharges, demandCharges, pfPenalty, pfIncentive, fuelSurcharge, electricityDuty, otherCharges, totalAmount } = body;

  if (!month || !year || !unitsConsumed || !totalAmount) {
    return NextResponse.json({ error: 'month, year, unitsConsumed, and totalAmount are required' }, { status: 400 });
  }

  // Auto-calculate flags
  const client = await prisma.client.findUnique({
    where: { id: result.clientId },
    select: { contractDemand: true, powerFactorTarget: true },
  });

  const hasPfPenalty = (pfPenalty || 0) > 0;
  const hasDemandOvershoot = client?.contractDemand ? (demandKVA || 0) > client.contractDemand : false;

  // Check for anomaly (>20% change from previous month)
  const prevBill = await prisma.utilityBill.findFirst({
    where: {
      clientId: result.clientId,
      OR: [
        { year, month: month - 1 },
        ...(month === 1 ? [{ year: year - 1, month: 12 }] : []),
      ],
    },
  });
  const hasAnomaly = prevBill ? Math.abs(totalAmount - prevBill.totalAmount) / prevBill.totalAmount > 0.2 : false;

  const bill = await prisma.utilityBill.create({
    data: {
      clientId: result.clientId,
      month, year,
      provider: provider || undefined,
      tariffCategory: tariffCategory || undefined,
      unitsConsumed, demandKVA: demandKVA || undefined,
      powerFactor: powerFactor || undefined,
      energyCharges: energyCharges || undefined,
      demandCharges: demandCharges || undefined,
      pfPenalty: pfPenalty || undefined,
      pfIncentive: pfIncentive || undefined,
      fuelSurcharge: fuelSurcharge || undefined,
      electricityDuty: electricityDuty || undefined,
      otherCharges: otherCharges || undefined,
      totalAmount,
      hasPfPenalty, hasDemandOvershoot, hasAnomaly,
      anomalyNote: hasAnomaly ? `${Math.round((totalAmount / (prevBill?.totalAmount || totalAmount) - 1) * 100)}% change from previous month` : undefined,
      enteredById: result.user.id,
    },
  });

  return NextResponse.json(bill, { status: 201 });
}
