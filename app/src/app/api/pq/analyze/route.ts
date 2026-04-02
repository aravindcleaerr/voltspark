import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

/**
 * POST /api/pq/analyze
 * Scans MeterReadings for the given date range and generates PQEvents + PQSnapshot.
 * Body: { date?: string (ISO date), days?: number (default 1, max 7) }
 */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'POWER_QUALITY');
  if ('error' in addonCheck) return addonCheck.error;

  const body = await request.json().catch(() => ({}));
  const days = Math.min(Math.max(parseInt(body.days) || 1, 1), 7);
  const endDate = body.date ? new Date(body.date) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  const meters = await prisma.ioTMeter.findMany({
    where: { clientId: result.clientId, isActive: true },
    select: { id: true, name: true, ratedVoltage: true, pfLowThreshold: true },
  });

  if (meters.length === 0) return NextResponse.json({ error: 'No active meters' }, { status: 400 });

  // PQ thresholds (EN 50160 inspired)
  const THD_V_LIMIT = 8.0;    // % voltage THD limit
  const THD_I_LIMIT = 12.0;   // % current THD limit
  const VOLTAGE_SAG_PCT = -10; // % below nominal = sag
  const VOLTAGE_SWELL_PCT = 10; // % above nominal = swell
  const UNBALANCE_LIMIT = 2.0; // % voltage unbalance limit
  const FREQ_LOW = 49.5;
  const FREQ_HIGH = 50.5;

  let eventsCreated = 0;
  let snapshotsCreated = 0;

  for (let d = days - 1; d >= 0; d--) {
    const targetDate = new Date(endDate);
    targetDate.setDate(targetDate.getDate() - d);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    for (const meter of meters) {
      const readings = await prisma.meterReading.findMany({
        where: { meterId: meter.id, timestamp: { gte: dayStart, lte: dayEnd } },
        orderBy: { timestamp: 'asc' },
      });

      if (readings.length === 0) continue;

      const nominal = meter.ratedVoltage || 415;
      const pfTarget = meter.pfLowThreshold || 0.90;
      let voltageMin = Infinity, voltageMax = -Infinity, voltageSum = 0, voltageCount = 0;
      let thdVMax = 0, thdVSum = 0, thdVCount = 0;
      let thdIMax = 0, thdISum = 0, thdICount = 0;
      let pfMin = 1, pfSum = 0, pfCount = 0, pfBelowTarget = 0;
      let freqMin = 100, freqMax = 0, freqSum = 0, freqCount = 0;
      let sagCount = 0, swellCount = 0, thdExceedCount = 0;
      let unbalanceMax = 0;

      const fiveMinAgo = (ts: Date) => new Date(ts.getTime() - 5 * 60 * 1000);

      for (const r of readings) {
        // Voltage analysis
        const vAvg = r.voltageAvg || ((r.voltageR || 0) + (r.voltageY || 0) + (r.voltageB || 0)) / 3;
        if (vAvg > 0) {
          voltageMin = Math.min(voltageMin, vAvg);
          voltageMax = Math.max(voltageMax, vAvg);
          voltageSum += vAvg;
          voltageCount++;

          const devPct = ((vAvg - nominal) / nominal) * 100;
          if (devPct <= VOLTAGE_SAG_PCT) {
            sagCount++;
            const existing = await prisma.pQEvent.findFirst({
              where: { meterId: meter.id, type: 'VOLTAGE_SAG', createdAt: { gte: fiveMinAgo(r.timestamp) } },
            });
            if (!existing) {
              await prisma.pQEvent.create({
                data: {
                  clientId: result.clientId, meterId: meter.id, type: 'VOLTAGE_SAG', severity: devPct <= -15 ? 'CRITICAL' : 'WARNING',
                  actualValue: vAvg, thresholdValue: nominal * (1 + VOLTAGE_SAG_PCT / 100), nominalValue: nominal,
                  message: `Voltage sag: ${vAvg.toFixed(1)}V (${devPct.toFixed(1)}% below ${nominal}V nominal)`,
                  createdAt: r.timestamp,
                },
              });
              eventsCreated++;
            }
          } else if (devPct >= VOLTAGE_SWELL_PCT) {
            swellCount++;
            const existing = await prisma.pQEvent.findFirst({
              where: { meterId: meter.id, type: 'VOLTAGE_SWELL', createdAt: { gte: fiveMinAgo(r.timestamp) } },
            });
            if (!existing) {
              await prisma.pQEvent.create({
                data: {
                  clientId: result.clientId, meterId: meter.id, type: 'VOLTAGE_SWELL', severity: devPct >= 15 ? 'CRITICAL' : 'WARNING',
                  actualValue: vAvg, thresholdValue: nominal * (1 + VOLTAGE_SWELL_PCT / 100), nominalValue: nominal,
                  message: `Voltage swell: ${vAvg.toFixed(1)}V (${devPct.toFixed(1)}% above ${nominal}V nominal)`,
                  createdAt: r.timestamp,
                },
              });
              eventsCreated++;
            }
          }
        }

        // THD analysis
        if (r.thdVoltage !== null && r.thdVoltage !== undefined) {
          thdVMax = Math.max(thdVMax, r.thdVoltage);
          thdVSum += r.thdVoltage;
          thdVCount++;
          if (r.thdVoltage > THD_V_LIMIT) {
            thdExceedCount++;
            const existing = await prisma.pQEvent.findFirst({
              where: { meterId: meter.id, type: 'THD_V_HIGH', createdAt: { gte: fiveMinAgo(r.timestamp) } },
            });
            if (!existing) {
              await prisma.pQEvent.create({
                data: {
                  clientId: result.clientId, meterId: meter.id, type: 'THD_V_HIGH', severity: r.thdVoltage > 12 ? 'CRITICAL' : 'WARNING',
                  actualValue: r.thdVoltage, thresholdValue: THD_V_LIMIT,
                  message: `Voltage THD ${r.thdVoltage.toFixed(1)}% exceeds ${THD_V_LIMIT}% limit`,
                  createdAt: r.timestamp,
                },
              });
              eventsCreated++;
            }
          }
        }
        if (r.thdCurrent !== null && r.thdCurrent !== undefined) {
          thdIMax = Math.max(thdIMax, r.thdCurrent);
          thdISum += r.thdCurrent;
          thdICount++;
        }

        // PF analysis
        if (r.powerFactor !== null && r.powerFactor !== undefined && Math.abs(r.powerFactor) > 0) {
          const pf = Math.abs(r.powerFactor);
          pfMin = Math.min(pfMin, pf);
          pfSum += pf;
          pfCount++;
          if (pf < pfTarget) pfBelowTarget++;
        }

        // Frequency analysis
        if (r.frequencyHz !== null && r.frequencyHz !== undefined) {
          freqMin = Math.min(freqMin, r.frequencyHz);
          freqMax = Math.max(freqMax, r.frequencyHz);
          freqSum += r.frequencyHz;
          freqCount++;
        }

        // Unbalance
        if (r.voltageUnbalance !== null && r.voltageUnbalance !== undefined) {
          unbalanceMax = Math.max(unbalanceMax, r.voltageUnbalance);
        }
      }

      // Calculate compliance score (0-100)
      let score = 100;
      const total = readings.length;
      if (total > 0) {
        // Voltage: -20 if >5% of readings are sags/swells
        if ((sagCount + swellCount) / total > 0.05) score -= 20;
        else if ((sagCount + swellCount) / total > 0.01) score -= 10;
        // THD: -20 if >5% exceed limit
        if (thdExceedCount / total > 0.05) score -= 20;
        else if (thdExceedCount / total > 0.01) score -= 10;
        // PF: -20 if >10% below target
        if (pfCount > 0 && pfBelowTarget / pfCount > 0.1) score -= 20;
        else if (pfCount > 0 && pfBelowTarget / pfCount > 0.05) score -= 10;
        // Frequency: -10 if out of band
        if (freqCount > 0 && (freqMin < FREQ_LOW || freqMax > FREQ_HIGH)) score -= 10;
        // Unbalance: -10 if exceeds limit
        if (unbalanceMax > UNBALANCE_LIMIT) score -= 10;
      }

      // Upsert PQSnapshot
      const dateKey = new Date(dayStart.toISOString().slice(0, 10));
      const existing = await prisma.pQSnapshot.findUnique({
        where: { meterId_date: { meterId: meter.id, date: dateKey } },
      });

      const snapshotData = {
        clientId: result.clientId,
        meterId: meter.id,
        date: dateKey,
        voltageAvgMin: voltageCount > 0 ? voltageMin : null,
        voltageAvgMax: voltageCount > 0 ? voltageMax : null,
        voltageAvgMean: voltageCount > 0 ? voltageSum / voltageCount : null,
        voltageSagCount: sagCount,
        voltageSwellCount: swellCount,
        voltageUnbalanceMax: unbalanceMax || null,
        thdVoltageMax: thdVCount > 0 ? thdVMax : null,
        thdVoltageMean: thdVCount > 0 ? thdVSum / thdVCount : null,
        thdCurrentMax: thdICount > 0 ? thdIMax : null,
        thdCurrentMean: thdICount > 0 ? thdISum / thdICount : null,
        thdExceedanceCount: thdExceedCount,
        pfMin: pfCount > 0 ? pfMin : null,
        pfMean: pfCount > 0 ? pfSum / pfCount : null,
        pfBelowTarget,
        freqMin: freqCount > 0 ? freqMin : null,
        freqMax: freqCount > 0 ? freqMax : null,
        freqMean: freqCount > 0 ? freqSum / freqCount : null,
        complianceScore: Math.max(score, 0),
        totalReadings: total,
      };

      if (existing) {
        await prisma.pQSnapshot.update({ where: { id: existing.id }, data: snapshotData });
      } else {
        await prisma.pQSnapshot.create({ data: snapshotData });
      }
      snapshotsCreated++;
    }
  }

  return NextResponse.json({ eventsCreated, snapshotsCreated, metersAnalyzed: meters.length, daysAnalyzed: days });
}
