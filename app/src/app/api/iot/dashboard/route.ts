import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  // Get all active meters with their gateways
  const meters = await prisma.ioTMeter.findMany({
    where: { clientId: result.clientId, isActive: true },
    include: {
      gateway: { select: { id: true, name: true, isOnline: true, lastSeenAt: true, gatewayType: true } },
      energySource: { select: { id: true, name: true, type: true } },
    },
  });

  // Get latest reading for each meter
  const meterStatus = await Promise.all(
    meters.map(async (meter) => {
      const latest = await prisma.meterReading.findFirst({
        where: { meterId: meter.id },
        orderBy: { timestamp: 'desc' },
      });

      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isReceiving = latest && new Date(latest.timestamp) > fiveMinAgo;

      return {
        meter: {
          id: meter.id,
          name: meter.name,
          meterType: meter.meterType,
          make: meter.make,
          model: meter.model,
          panelName: meter.panelName,
          circuitName: meter.circuitName,
          location: meter.location,
          gateway: meter.gateway,
          energySource: meter.energySource,
        },
        latest,
        isReceiving,
      };
    })
  );

  // Aggregate totals
  let totalActivePowerKW = 0;
  let totalApparentPowerKVA = 0;
  let weightedPfSum = 0;
  let pfWeightTotal = 0;
  let onlineMeters = 0;
  let offlineMeters = 0;

  for (const ms of meterStatus) {
    if (ms.latest && ms.isReceiving) {
      onlineMeters++;
      totalActivePowerKW += ms.latest.activePowerKW || 0;
      totalApparentPowerKVA += ms.latest.apparentPowerKVA || 0;
      if (ms.latest.powerFactor && ms.latest.activePowerKW) {
        weightedPfSum += ms.latest.powerFactor * ms.latest.activePowerKW;
        pfWeightTotal += ms.latest.activePowerKW;
      }
    } else {
      offlineMeters++;
    }
  }

  const avgPowerFactor = pfWeightTotal > 0 ? weightedPfSum / pfWeightTotal : null;

  // Get client's contracted demand
  const client = await prisma.client.findUnique({
    where: { id: result.clientId },
    select: { contractDemand: true },
  });

  const demandPct = client?.contractDemand && totalApparentPowerKVA
    ? (totalApparentPowerKVA / client.contractDemand) * 100
    : null;

  // Recent alerts (last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentAlerts = await prisma.meterAlert.findMany({
    where: { clientId: result.clientId, createdAt: { gte: oneDayAgo } },
    include: { meter: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Gateway summary
  const gateways = await prisma.ioTGateway.findMany({
    where: { clientId: result.clientId, isActive: true },
    select: { id: true, name: true, gatewayType: true, isOnline: true, lastSeenAt: true },
  });

  return NextResponse.json({
    summary: {
      totalActivePowerKW,
      totalApparentPowerKVA,
      avgPowerFactor,
      contractedDemandKVA: client?.contractDemand,
      demandPct,
      demandStatus: demandPct === null ? 'UNKNOWN' : demandPct >= 92 ? 'CRITICAL' : demandPct >= 80 ? 'WARNING' : 'NORMAL',
      onlineMeters,
      offlineMeters,
      totalMeters: meters.length,
    },
    gateways,
    meters: meterStatus,
    recentAlerts,
  });
}
