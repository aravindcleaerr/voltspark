import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireIoTApiKey } from '@/lib/iot-auth';

/**
 * PQ waveform-ref ingest — receives a pointer message from the gateway after
 * it uploads a Parquet+zstd waveform blob to S3.
 *
 * MQTT channel: voltspark/v1/<tenant>/<site>/<gw>/<meter>/pq/waveform-ref
 * Payload schema: voltspark.pq.waveform-ref.v1
 *
 * Stores the S3 key on the matching PQEvent so the dashboard can fetch
 * a pre-signed URL for waveform visualisation.
 */

const waveformRefSchema = z.object({
  schema: z.literal('voltspark.pq.waveform-ref.v1'),
  ts: z.string(),
  gw: z.string(),
  meter: z.string(),
  event_id: z.string(),     // gateway-assigned event ID (stored as waveformEventId)
  trigger: z.string(),      // e.g. THD_V_HIGH, VOLTAGE_SAG — maps to PQEvent.type
  phase: z.string().optional(),
  s3_key: z.string(),       // e.g. voltspark-pq/tenant/site/gw/meter/yyyy/mm/dd/evt.parquet
  size_bytes: z.number().optional(),
  sha256: z.string().optional(),
  actual_value: z.number().optional(),
  threshold_value: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireIoTApiKey(request);
  if ('error' in auth) return auth.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = waveformRefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { ts, meter: meterRef, event_id, trigger, phase, s3_key, actual_value, threshold_value } = parsed.data;

  // Resolve meter
  const iotMeter = await prisma.ioTMeter.findFirst({
    where: {
      gatewayId: auth.gatewayId,
      isActive: true,
      OR: [{ meterSerial: meterRef }, { id: meterRef }],
    },
    select: { id: true },
  });
  if (!iotMeter) {
    return NextResponse.json({ error: `Meter not found: ${meterRef}` }, { status: 404 });
  }

  // Try to find an existing PQEvent for this waveform event
  const existingEvent = await prisma.pQEvent.findFirst({
    where: { meterId: iotMeter.id, waveformEventId: event_id },
  });

  if (existingEvent) {
    await prisma.pQEvent.update({
      where: { id: existingEvent.id },
      data: { waveformS3Key: s3_key },
    });
    return NextResponse.json({ updated: existingEvent.id });
  }

  // No existing event — create one with data from the waveform-ref payload
  const pqEvent = await prisma.pQEvent.create({
    data: {
      clientId: auth.clientId,
      meterId: iotMeter.id,
      type: trigger,
      severity: 'WARNING',
      phase: phase ?? null,
      actualValue: actual_value ?? 0,
      thresholdValue: threshold_value ?? 0,
      message: `PQ event captured by gateway (${trigger})`,
      waveformEventId: event_id,
      waveformS3Key: s3_key,
      createdAt: new Date(ts),
    },
  });

  return NextResponse.json({ created: pqEvent.id });
}
