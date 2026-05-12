import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { AlertTriangle, ArrowLeft, Waves, Info } from 'lucide-react';
import WaveformContextChart from './WaveformContextChart';

export const dynamic = 'force-dynamic';

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  WARNING: 'bg-amber-100 text-amber-700',
  INFO: 'bg-blue-100 text-blue-700',
};

export default async function PQEventDetailPage({ params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) redirect('/login');

  const event = await prisma.pQEvent.findFirst({
    where: { id: params.id, clientId: result.clientId },
    include: { meter: { select: { id: true, name: true, meterType: true, meterSerial: true } } },
  });
  if (!event) notFound();

  // ±5 minute reading context for the chart
  const eventTime = event.createdAt;
  const windowStart = new Date(eventTime.getTime() - 5 * 60 * 1000);
  const windowEnd = new Date(eventTime.getTime() + 5 * 60 * 1000);
  const readings = await prisma.meterReading.findMany({
    where: {
      meterId: event.meterId,
      timestamp: { gte: windowStart, lte: windowEnd },
    },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, voltageAvg: true, currentAvg: true, powerFactor: true },
    take: 200,
  });

  const chartData = readings.map(r => ({
    ts: r.timestamp.toISOString().slice(11, 19),
    voltageAvg: r.voltageAvg,
    currentAvg: r.currentAvg,
    powerFactor: r.powerFactor,
  }));
  const eventTsLabel = eventTime.toISOString().slice(11, 19);

  return (
    <div>
      <Link href="/pq/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to events
      </Link>
      <PageHeader
        title={event.type.replace(/_/g, ' ')}
        subtitle={`${event.meter?.name ?? 'Unknown meter'} · ${eventTime.toLocaleString('en-IN')}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${event.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLOR[event.severity] ?? ''}`}>{event.severity}</span>
                {event.phase && <span className="text-xs text-gray-500">Phase {event.phase}</span>}
              </div>
              <p className="text-sm text-gray-900">{event.message}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                <dt className="text-gray-500">Measured</dt>
                <dd className="font-mono text-right">{event.actualValue.toFixed(2)}</dd>
                <dt className="text-gray-500">Threshold</dt>
                <dd className="font-mono text-right text-gray-600">{event.thresholdValue.toFixed(2)}</dd>
                {event.nominalValue !== null && (
                  <>
                    <dt className="text-gray-500">Nominal</dt>
                    <dd className="font-mono text-right text-gray-600">{event.nominalValue.toFixed(2)}</dd>
                  </>
                )}
                {event.durationMs !== null && (
                  <>
                    <dt className="text-gray-500">Duration</dt>
                    <dd className="font-mono text-right text-gray-600">{event.durationMs} ms</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-medium text-gray-500 mb-2">Waveform Capture</p>
          {event.waveformS3Key ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 mb-2">
                <Waves className="h-3.5 w-3.5" /> Captured by gateway
              </div>
              <dl className="text-xs space-y-1">
                {event.waveformEventId && (
                  <div className="flex gap-2">
                    <dt className="text-gray-500 w-20 flex-shrink-0">Event ID</dt>
                    <dd className="font-mono text-gray-700 truncate">{event.waveformEventId}</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-20 flex-shrink-0">S3 key</dt>
                  <dd className="font-mono text-gray-700 truncate break-all">{event.waveformS3Key}</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>S3 fetch + Parquet decode not yet wired. The blob exists at the key above — wire AWS S3 pre-signed URL endpoint to complete the loop.</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              <p>No waveform attached to this event.</p>
              <p className="mt-2 text-gray-400">Waveform capture requires PQ-tier metering (Janitza UMG, EM6400NG+) on a Class-2 gateway with S3 upload enabled.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Reading context (±5 min around event)</p>
          <p className="text-xs text-gray-400">{readings.length} samples · vertical line = event time {eventTsLabel}</p>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500 py-12 text-center">No meter readings in the ±5 min window. Likely because this event predates the meter's data retention.</p>
        ) : (
          <WaveformContextChart data={chartData} eventTimeIso={eventTsLabel} />
        )}
      </div>
    </div>
  );
}
