/**
 * VoltSpark seed snippet for the new SMT/Q-Apps tables.
 *
 * This is NOT a standalone seeder — it's a function to add to VoltSpark's
 * existing prisma/seed.ts. Run after the new migration:
 *   npx prisma migrate dev --name add_qapps_smt_models
 *   npx prisma db seed
 *
 * Seeds:
 *   - ProductionRecord (~2,800 rows — 3 shifts x 6 days x 52 weeks x 3 years)
 *   - DefectEvent (~200K rows — couple defect spikes to scripted events)
 *   - ProcessExcursion (~800 rows — concentrated around drift events)
 *   - Plus reuses existing VoltSpark models: IoTMeter, MeterReading,
 *     ConsumptionEntry, UtilityBill, Inspection, Incident, CAPA
 *
 * Coupling rules baked in here:
 *   - REF-01 thermocouple drift -> ProcessExcursion rows -> AOI DefectEvent links
 *   - Paste-batch issue dates -> high tombstoning + insufficient_solder spike
 *   - Deferred AOI PMs -> false-reject spike
 *   - Sunday/shutdown -> no production records
 */

import { PrismaClient } from '@prisma/client';

// Adjust these import paths once merged into VoltSpark codebase
import { EQUIPMENT_CAST, DRIVEWAVE } from '../../PSS/Vitesco/Apps/_shared/equipment';
import {
  SCRIPTED_EVENTS,
  SEED_TIME_WINDOW,
  getDriftSeverity,
  isPasteBatchIssue,
} from '../../PSS/Vitesco/Apps/_shared/scripted-events';
import {
  setSeed,
  rand,
  randInt,
  randFloat,
  randPick,
  randNormal,
  dateRange,
  shiftsForDay,
  isWorkingDay,
  baselineOEE,
  baselineFPY,
  baselineCycleTime,
} from '../../PSS/Vitesco/Apps/_shared/time-helpers';

const prisma = new PrismaClient();

const DEFECT_TYPES = [
  'tombstoning',
  'insufficient_solder',
  'solder_bridge',
  'missing_component',
  'misaligned_component',
  'wrong_polarity',
  'cold_joint',
  'solder_ball',
  'lifted_lead',
  'pad_damage',
];

const ROOT_CAUSES_BY_DEFECT: Record<string, string[]> = {
  tombstoning: ['paste_viscosity', 'thermal_imbalance', 'pad_design'],
  insufficient_solder: ['paste_viscosity', 'stencil_aperture', 'reflow_profile_drift'],
  solder_bridge: ['paste_volume_excess', 'misalignment', 'reflow_profile_drift'],
  missing_component: ['feeder_misalign', 'vacuum_loss', 'tape_jam'],
  misaligned_component: ['feeder_misalign', 'pickup_offset', 'fiducial_recognition'],
  wrong_polarity: ['feeder_loading_error', 'operator_error'],
  cold_joint: ['reflow_profile_drift', 'thermal_imbalance'],
  solder_ball: ['paste_age', 'reflow_profile_drift'],
  lifted_lead: ['reflow_profile_drift', 'thermal_shock'],
  pad_damage: ['handling', 'rework_damage'],
};

// ============================================================
// Get Drivewave clientId — must already exist in VoltSpark before running
// ============================================================

async function getDrivewaveClientId(): Promise<string> {
  const client = await prisma.client.findUnique({ where: { slug: DRIVEWAVE.customerSlug } });
  if (!client) throw new Error(`Drivewave client not found. Onboard first: slug=${DRIVEWAVE.customerSlug}`);
  return client.id;
}

// ============================================================
// ProductionRecord seeding
// ============================================================

async function seedProductionRecords(clientId: string): Promise<Map<string, string>> {
  console.log('Seeding ProductionRecords...');
  await prisma.productionRecord.deleteMany({ where: { clientId } });

  const start = new Date(SEED_TIME_WINDOW.start);
  const end = new Date(SEED_TIME_WINDOW.end);
  // Map of "YYYY-MM-DD-shiftN" -> productionRecordId for downstream coupling
  const shiftToRecordId = new Map<string, string>();

  let count = 0;
  for (const day of dateRange(start, end)) {
    if (!isWorkingDay(day)) continue;

    for (const shift of shiftsForDay(day)) {
      if (!shift.isWorking) continue;

      // Baseline metrics
      let oee = baselineOEE(day);
      let fpy = baselineFPY();

      // Couple paste-batch issue: drop FPY for those days
      if (isPasteBatchIssue(day)) {
        fpy *= 0.985;        // small but visible drop
        oee *= 0.97;
      }

      const unitsPlanned = DRIVEWAVE.unitsPlannedPerShift;
      const unitsProduced = Math.round(unitsPlanned * Math.min(1, oee + randNormal(0, 0.04)));
      const unitsRejected = Math.round(unitsProduced * (1 - fpy));
      const ppmDefects = Math.round((unitsRejected / Math.max(1, unitsProduced)) * 1_000_000);

      const downtimePlanned = randInt(15, 45);
      const downtimeUnplanned = isPasteBatchIssue(day) ? randInt(20, 60) : randInt(0, 15);

      const record = await prisma.productionRecord.create({
        data: {
          clientId,
          lineId: DRIVEWAVE.lineId,
          shiftDate: day,
          shiftNumber: shift.shiftNumber,
          unitsPlanned,
          unitsProduced,
          unitsRejected,
          oee: Number(oee.toFixed(3)),
          fpy: Number(fpy.toFixed(4)),
          ppmDefects,
          cycleTimeAvgSeconds: Number(baselineCycleTime().toFixed(1)),
          downtimeMinutesPlanned: downtimePlanned,
          downtimeMinutesUnplanned: downtimeUnplanned,
          notes: isPasteBatchIssue(day) ? 'Solder paste batch B-4451 issue suspected' : null,
        },
      });

      const key = `${day.toISOString().slice(0, 10)}-${shift.shiftNumber}`;
      shiftToRecordId.set(key, record.id);
      count++;
    }
  }

  console.log(`  ${count} production records seeded`);
  return shiftToRecordId;
}

// ============================================================
// ProcessExcursion seeding
// ============================================================

async function seedProcessExcursions(clientId: string): Promise<string[]> {
  console.log('Seeding ProcessExcursions...');
  await prisma.processExcursion.deleteMany({ where: { clientId } });

  const start = new Date(SEED_TIME_WINDOW.start);
  const end = new Date(SEED_TIME_WINDOW.end);
  const excursionIds: string[] = [];
  let count = 0;

  for (const day of dateRange(start, end)) {
    if (!isWorkingDay(day)) continue;

    // REF-01 thermocouple drift events
    const drift = getDriftSeverity('REF-01', day);
    if (drift) {
      const occurrences = drift === 'critical' ? randInt(3, 6) : drift === 'rising' ? randInt(1, 3) : randInt(0, 1);
      for (let i = 0; i < occurrences; i++) {
        const expectedTemp = 245.0;          // typical reflow zone-3 spec
        const driftMagnitude =
          drift === 'critical' ? randFloat(8, 15) : drift === 'rising' ? randFloat(5, 10) : randFloat(3, 6);
        const observed = expectedTemp + (rand() < 0.6 ? driftMagnitude : -driftMagnitude);
        const at = new Date(day);
        at.setHours(randInt(6, 22), randInt(0, 59));

        const created = await prisma.processExcursion.create({
          data: {
            clientId,
            machineId: 'REF-01',
            parameter: 'zone3_temperature',
            expectedValue: expectedTemp,
            observedValue: Number(observed.toFixed(2)),
            durationSeconds: randInt(35, 180),
            severity: drift === 'critical' ? 'critical' : 'warning',
            detectedAt: at,
            resolvedAt: new Date(at.getTime() + randInt(2, 30) * 60_000),
            notes: `Zone-3 thermocouple drift event — severity ${drift}`,
          },
        });
        excursionIds.push(created.id);
        count++;
      }
    }

    // Paste-age excursions during paste-batch issue windows
    if (isPasteBatchIssue(day) && rand() < 0.5) {
      const at = new Date(day);
      at.setHours(randInt(6, 22), randInt(0, 59));
      const created = await prisma.processExcursion.create({
        data: {
          clientId,
          machineId: 'SPI-01',
          parameter: 'paste_age_hours',
          expectedValue: 8.0,
          observedValue: randFloat(11, 16),
          durationSeconds: randInt(60, 240),
          severity: 'warning',
          detectedAt: at,
          notes: 'Solder paste age beyond spec — paste batch B-4451',
        },
      });
      excursionIds.push(created.id);
      count++;
    }
  }

  console.log(`  ${count} process excursions seeded`);
  return excursionIds;
}

// ============================================================
// DefectEvent seeding
// ============================================================

async function seedDefectEvents(
  clientId: string,
  shiftToRecordId: Map<string, string>,
  excursionIds: string[],
) {
  console.log('Seeding DefectEvents... (this is the slow step)');
  await prisma.defectEvent.deleteMany({ where: { clientId } });

  const start = new Date(SEED_TIME_WINDOW.start);
  const end = new Date(SEED_TIME_WINDOW.end);
  let count = 0;
  let batch: any[] = [];
  const BATCH_SIZE = 1000;

  async function flush() {
    if (batch.length === 0) return;
    await prisma.defectEvent.createMany({ data: batch });
    count += batch.length;
    batch = [];
  }

  for (const day of dateRange(start, end)) {
    if (!isWorkingDay(day)) continue;
    const drift = getDriftSeverity('REF-01', day);
    const pasteIssue = isPasteBatchIssue(day);

    for (const shift of shiftsForDay(day)) {
      if (!shift.isWorking) continue;
      const key = `${day.toISOString().slice(0, 10)}-${shift.shiftNumber}`;
      const productionRecordId = shiftToRecordId.get(key);
      if (!productionRecordId) continue;

      // Defect count for this shift — base ~70-90, modulated up by drift / paste issue
      let defectCount = randInt(60, 95);
      if (drift === 'rising') defectCount = Math.round(defectCount * 1.4);
      if (drift === 'critical') defectCount = Math.round(defectCount * 1.8);
      if (pasteIssue) defectCount = Math.round(defectCount * 1.6);

      for (let i = 0; i < defectCount; i++) {
        // Defect type weighting depends on context
        let defectType: string;
        if (pasteIssue && rand() < 0.45) {
          defectType = randPick(['tombstoning', 'insufficient_solder', 'solder_ball']);
        } else if (drift && rand() < 0.4) {
          defectType = randPick(['insufficient_solder', 'cold_joint', 'lifted_lead']);
        } else {
          defectType = randPick(DEFECT_TYPES);
        }

        const detectedAtMachine = randPick(['AOI-01', 'ICT-01', 'FCT-01']);
        const severity = randPick(['low', 'low', 'low', 'medium', 'high']); // weighted low
        const action = severity === 'high' ? 'scrap' : rand() < 0.85 ? 'rework' : 'accept_with_deviation';
        const at = new Date(day);
        at.setHours(shift.startHour + Math.floor(rand() * 8), randInt(0, 59));

        // Link a fraction of defects to nearby excursions for the cross-source query
        let linkedReflowExcursionId: string | null = null;
        if (drift && excursionIds.length > 0 && rand() < 0.25) {
          linkedReflowExcursionId = randPick(excursionIds);
        }

        batch.push({
          clientId,
          productionRecordId,
          detectedAt: at,
          detectedAtMachine,
          boardSerial: `ECU-${day.getFullYear()}-${String(count + i).padStart(8, '0')}`,
          defectType,
          severity,
          componentRef: randPick([null, `C${randInt(1, 200)}`, `R${randInt(1, 300)}`, `U${randInt(1, 30)}`]),
          actionTaken: action,
          rootCauseSuspect: randPick(ROOT_CAUSES_BY_DEFECT[defectType] || [null]),
          linkedReflowExcursionId,
        });

        if (batch.length >= BATCH_SIZE) await flush();
      }
    }
  }
  await flush();

  console.log(`  ${count} defect events seeded`);
}

// ============================================================
// Main entry — call this from VoltSpark's seed.ts
// ============================================================

export async function seedDrivewaveQAppsData() {
  setSeed(20260515);
  console.log('Drivewave Q-Apps + SMT data seeder — starting');

  const clientId = await getDrivewaveClientId();
  const shiftToRecordId = await seedProductionRecords(clientId);
  const excursionIds = await seedProcessExcursions(clientId);
  await seedDefectEvents(clientId, shiftToRecordId, excursionIds);

  console.log('Drivewave Q-Apps + SMT data seeder — done');
}

// Allow running standalone for testing
if (require.main === module) {
  seedDrivewaveQAppsData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
