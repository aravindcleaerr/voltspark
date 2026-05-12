import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireIoTApiKey } from '@/lib/iot-auth';
import { rateLimit } from '@/lib/rate-limit';
import { canonicalToMeterReading } from '@/lib/iot-canonical';
import { maybeCreateAutoIncident } from '@/lib/auto-incident';

/**
 * MQTT telemetry ingest — accepts the VS-Meter Profile canonical payload format.
 * Topic: voltspark/v1/<tenant>/<site>/<gw>/<meter>/telemetry
 * The MQTT broker (EMQX / AWS IoT Core) forwards this channel to this endpoint via webhook.
 *
 * Payload schema: voltspark.telemetry.v1
 */

const telemetryPayloadSchema = z.object({
  schema: z.literal('voltspark.telemetry.v1'),
  ts: z.string(),
  gw: z.string(),           // gateway identifier (matches gateway serialNumber or mqttClientId)
  meter: z.string(),        // meter identifier (matches IoTMeter meterSerial)
  tenant: z.string().optional(),
  site: z.string().optional(),
  tier: z.enum(['basic', 'standard', 'advanced', 'power_quality']).optional(),
  readings: z.record(z.string(), z.number()),
});

export async function POST(request: NextRequest) {
  const auth = await requireIoTApiKey(request);
  if ('error' in auth) return auth.error;

  const rl = rateLimit(`iot-mqtt:${auth.gatewayId}`, 120);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = telemetryPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { ts, gw, meter: meterRef, readings } = parsed.data;

  // Verify the gw field matches the authenticated gateway
  const gateway = await prisma.ioTGateway.findUnique({
    where: { id: auth.gatewayId },
    select: { id: true, serialNumber: true, mqttClientId: true },
  });
  if (!gateway) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
  if (gw !== gateway.serialNumber && gw !== gateway.mqttClientId && gw !== gateway.id) {
    return NextResponse.json({ error: 'Gateway identifier mismatch' }, { status: 403 });
  }

  // Resolve meter by meterSerial (field-engineering: meter IDs are stored as meterSerial)
  const iotMeter = await prisma.ioTMeter.findFirst({
    where: {
      gatewayId: auth.gatewayId,
      isActive: true,
      OR: [{ meterSerial: meterRef }, { id: meterRef }],
    },
    select: { id: true, name: true, location: true, demandWarningPct: true, demandCriticalPct: true, pfLowThreshold: true },
  });
  if (!iotMeter) {
    return NextResponse.json({ error: `Meter not found: ${meterRef}` }, { status: 404 });
  }

  // Map canonical names → MeterReading fields
  const readingData = canonicalToMeterReading(readings);

  const client = await prisma.client.findUnique({
    where: { id: auth.clientId },
    select: { contractDemand: true },
  });

  await prisma.meterReading.create({
    data: {
      meterId: iotMeter.id,
      timestamp: new Date(ts),
      ...readingData,
    },
  });

  // Alert checks (reuse same logic as /api/iot/ingest)
  const contractedKVA = client?.contractDemand;
  const alertsToCreate: Array<{ clientId: string; meterId: string; type: string; severity: string; parameterName: string; actualValue: number; thresholdValue: number; message: string }> = [];

  if (contractedKVA && readingData.demandKVA) {
    const demandPct = (readingData.demandKVA / contractedKVA) * 100;
    const criticalPct = iotMeter.demandCriticalPct ?? 92;
    const warningPct = iotMeter.demandWarningPct ?? 80;
    if (demandPct >= criticalPct) {
      alertsToCreate.push({ clientId: auth.clientId, meterId: iotMeter.id, type: demandPct >= 100 ? 'DEMAND_BREACH' : 'DEMAND_CRITICAL', severity: 'CRITICAL', parameterName: 'demandKVA', actualValue: readingData.demandKVA, thresholdValue: contractedKVA * (criticalPct / 100), message: `Demand ${readingData.demandKVA.toFixed(1)} kVA (${demandPct.toFixed(0)}% of ${contractedKVA} kVA contracted)` });
    } else if (demandPct >= warningPct) {
      alertsToCreate.push({ clientId: auth.clientId, meterId: iotMeter.id, type: 'DEMAND_WARNING', severity: 'WARNING', parameterName: 'demandKVA', actualValue: readingData.demandKVA, thresholdValue: contractedKVA * (warningPct / 100), message: `Demand ${readingData.demandKVA.toFixed(1)} kVA (${demandPct.toFixed(0)}% of ${contractedKVA} kVA contracted)` });
    }
  }

  if (readingData.powerFactor !== undefined) {
    const pfThreshold = iotMeter.pfLowThreshold ?? 0.85;
    if (Math.abs(readingData.powerFactor) < pfThreshold && Math.abs(readingData.powerFactor) > 0) {
      alertsToCreate.push({ clientId: auth.clientId, meterId: iotMeter.id, type: 'PF_LOW', severity: 'WARNING', parameterName: 'powerFactor', actualValue: readingData.powerFactor, thresholdValue: pfThreshold, message: `Power factor ${readingData.powerFactor.toFixed(3)} below threshold ${pfThreshold}` });
    }
  }

  if (alertsToCreate.length > 0) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    for (const alert of alertsToCreate) {
      const existing = await prisma.meterAlert.findFirst({ where: { meterId: alert.meterId, type: alert.type, createdAt: { gte: fiveMinAgo } } });
      if (!existing) {
        const created = await prisma.meterAlert.create({ data: alert }).catch(() => null);
        if (created) {
          maybeCreateAutoIncident(
            { id: created.id, clientId: created.clientId, meterId: created.meterId, type: created.type, message: created.message },
            { name: iotMeter.name, location: iotMeter.location }
          ).catch(() => {});
        }
      }
    }
  }

  // Update gateway last-seen
  prisma.ioTGateway.update({ where: { id: auth.gatewayId }, data: { isOnline: true, lastSeenAt: new Date() } }).catch(() => {});

  return NextResponse.json({ accepted: 1 });
}
