import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireIoTApiKey } from '@/lib/iot-auth';
import { ingestBatchSchema } from '@/lib/iot-validations';

export async function POST(request: NextRequest) {
  const auth = await requireIoTApiKey(request);
  if ('error' in auth) return auth.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = ingestBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { readings } = parsed.data;

  // Resolve meters for this gateway
  const meters = await prisma.ioTMeter.findMany({
    where: { gatewayId: auth.gatewayId, isActive: true },
    select: { id: true, meterSerial: true, modbusAddress: true, demandWarningPct: true, demandCriticalPct: true, pfLowThreshold: true },
  });

  const meterBySerial = new Map(meters.filter(m => m.meterSerial).map(m => [m.meterSerial!, m]));
  const meterByAddress = new Map(meters.filter(m => m.modbusAddress).map(m => [m.modbusAddress!, m]));
  const meterById = new Map(meters.map(m => [m.id, m]));

  // Get client's contracted demand for threshold checks
  const client = await prisma.client.findUnique({
    where: { id: auth.clientId },
    select: { contractDemand: true },
  });
  const contractedKVA = client?.contractDemand;

  let accepted = 0;
  let rejected = 0;
  const errors: string[] = [];
  const alertsToCreate: Array<{ clientId: string; meterId: string; type: string; severity: string; parameterName: string; actualValue: number; thresholdValue: number; message: string }> = [];

  for (const reading of readings) {
    // Resolve meter
    let meter = reading.meterId ? meterById.get(reading.meterId) : undefined;
    if (!meter && reading.meterSerial) meter = meterBySerial.get(reading.meterSerial);
    if (!meter && reading.modbusAddress) meter = meterByAddress.get(reading.modbusAddress);

    if (!meter) {
      rejected++;
      errors.push(`Meter not found: serial=${reading.meterSerial} addr=${reading.modbusAddress} id=${reading.meterId}`);
      continue;
    }

    try {
      await prisma.meterReading.create({
        data: {
          meterId: meter.id,
          timestamp: new Date(reading.timestamp),
          activePowerKW: reading.activePowerKW,
          apparentPowerKVA: reading.apparentPowerKVA,
          reactivePowerKVAR: reading.reactivePowerKVAR,
          powerFactor: reading.powerFactor,
          voltageR: reading.voltageR,
          voltageY: reading.voltageY,
          voltageB: reading.voltageB,
          voltageAvg: reading.voltageAvg,
          currentR: reading.currentR,
          currentY: reading.currentY,
          currentB: reading.currentB,
          currentAvg: reading.currentAvg,
          energyKwh: reading.energyKwh,
          energyKwhExport: reading.energyKwhExport,
          energyKvarhImport: reading.energyKvarhImport,
          energyKvarhExport: reading.energyKvarhExport,
          demandKW: reading.demandKW,
          demandKVA: reading.demandKVA,
          maxDemandKW: reading.maxDemandKW,
          maxDemandKVA: reading.maxDemandKVA,
          frequencyHz: reading.frequencyHz,
          thdVoltage: reading.thdVoltage,
          thdCurrent: reading.thdCurrent,
          voltageUnbalance: reading.voltageUnbalance,
          currentUnbalance: reading.currentUnbalance,
          extraDataJson: reading.extraDataJson,
        },
      });
      accepted++;

      // Check demand thresholds
      if (contractedKVA && reading.demandKVA) {
        const demandPct = (reading.demandKVA / contractedKVA) * 100;
        const criticalPct = meter.demandCriticalPct ?? 92;
        const warningPct = meter.demandWarningPct ?? 80;

        if (demandPct >= criticalPct) {
          alertsToCreate.push({
            clientId: auth.clientId,
            meterId: meter.id,
            type: demandPct >= 100 ? 'DEMAND_BREACH' : 'DEMAND_CRITICAL',
            severity: 'CRITICAL',
            parameterName: 'demandKVA',
            actualValue: reading.demandKVA,
            thresholdValue: contractedKVA * (criticalPct / 100),
            message: `Demand ${reading.demandKVA.toFixed(1)} kVA (${demandPct.toFixed(0)}% of ${contractedKVA} kVA contracted)`,
          });
        } else if (demandPct >= warningPct) {
          alertsToCreate.push({
            clientId: auth.clientId,
            meterId: meter.id,
            type: 'DEMAND_WARNING',
            severity: 'WARNING',
            parameterName: 'demandKVA',
            actualValue: reading.demandKVA,
            thresholdValue: contractedKVA * (warningPct / 100),
            message: `Demand ${reading.demandKVA.toFixed(1)} kVA (${demandPct.toFixed(0)}% of ${contractedKVA} kVA contracted)`,
          });
        }
      }

      // Check power factor threshold
      if (reading.powerFactor !== undefined) {
        const pfThreshold = meter.pfLowThreshold ?? 0.85;
        if (Math.abs(reading.powerFactor) < pfThreshold && Math.abs(reading.powerFactor) > 0) {
          alertsToCreate.push({
            clientId: auth.clientId,
            meterId: meter.id,
            type: 'PF_LOW',
            severity: 'WARNING',
            parameterName: 'powerFactor',
            actualValue: reading.powerFactor,
            thresholdValue: pfThreshold,
            message: `Power factor ${reading.powerFactor.toFixed(3)} below threshold ${pfThreshold}`,
          });
        }
      }
    } catch {
      rejected++;
      errors.push(`Failed to store reading for meter ${meter.id}`);
    }
  }

  // Batch create alerts (fire-and-forget, deduplicate by 5 min window)
  if (alertsToCreate.length > 0) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    for (const alert of alertsToCreate) {
      const existing = await prisma.meterAlert.findFirst({
        where: { meterId: alert.meterId, type: alert.type, createdAt: { gte: fiveMinAgo } },
      });
      if (!existing) {
        prisma.meterAlert.create({ data: alert }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ accepted, rejected, errors: errors.length > 0 ? errors : undefined });
}
