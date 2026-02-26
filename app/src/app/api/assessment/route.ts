import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/** GET — fetch current baseline data for assessment wizard */
export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      name: true, industry: true, employeeCount: true, address: true,
      gridTariffRate: true, solarTariffRate: true, dgTariffRate: true,
      contractDemand: true, powerFactorTarget: true,
      baselineYear: true, baselineMonth: true,
    },
  });

  const energySources = await prisma.energySource.findMany({
    where: { clientId },
    select: { id: true, name: true, type: true, unit: true, location: true, meterNumber: true, costPerUnit: true, isActive: true },
    orderBy: { name: 'asc' },
  });

  // Check if assessment is complete
  const isComplete = !!(client?.baselineYear && client?.baselineMonth && energySources.length > 0);

  return NextResponse.json({ client, energySources, isComplete });
}

/** POST — save baseline assessment data */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const body = await request.json();
  const { step, data } = body;

  if (step === 'company') {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        industry: data.industry || undefined,
        employeeCount: data.employeeCount ? parseInt(data.employeeCount) : undefined,
        address: data.address || undefined,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (step === 'tariffs') {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        gridTariffRate: data.gridTariffRate ? parseFloat(data.gridTariffRate) : null,
        solarTariffRate: data.solarTariffRate ? parseFloat(data.solarTariffRate) : null,
        dgTariffRate: data.dgTariffRate ? parseFloat(data.dgTariffRate) : null,
        contractDemand: data.contractDemand ? parseFloat(data.contractDemand) : null,
        powerFactorTarget: data.powerFactorTarget ? parseFloat(data.powerFactorTarget) : null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (step === 'baseline') {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        baselineYear: data.baselineYear ? parseInt(data.baselineYear) : null,
        baselineMonth: data.baselineMonth ? parseInt(data.baselineMonth) : null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (step === 'energy-source') {
    const source = await prisma.energySource.create({
      data: {
        clientId,
        name: data.name,
        type: data.type,
        unit: data.unit || 'kWh',
        description: data.description || null,
        location: data.location || null,
        meterNumber: data.meterNumber || null,
        costPerUnit: data.costPerUnit ? parseFloat(data.costPerUnit) : null,
      },
    });
    return NextResponse.json(source, { status: 201 });
  }

  if (step === 'complete') {
    // Mark assessment as complete in AppSettings
    await prisma.appSetting.upsert({
      where: { clientId_key: { clientId, key: 'assessment_completed' } },
      update: { value: new Date().toISOString() },
      create: { clientId, key: 'assessment_completed', value: new Date().toISOString() },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
}
