/**
 * Drivewave Automotive seed — for the Vitesco / Schaeffler demo on 15 May 2026.
 *
 * This module is invoked from prisma/seed.ts. It provisions the entire Drivewave
 * tenant: Client + admin user + 8 SMT energy sources + IoT meters + 3 years of
 * hourly meter readings + daily consumption summaries + monthly utility bills +
 * a handful of Inspection/Incident/CAPA/Audit rows + the new Q-Apps tables
 * (ProductionRecord, ProcessExcursion, DefectEvent).
 *
 * Coupling rules (from scripted-events.ts) feed into:
 *   - PF / THD dips on REF-01 during drift windows
 *   - PF-penalty + demand-overshoot UtilityBills in the months touched by drift
 *   - ProcessExcursion zone3_temperature rows clustered in drift windows
 *   - DefectEvent.linkedReflowExcursionId populated for ~25% of defects in those windows
 */

import bcrypt from 'bcryptjs';

import { EQUIPMENT_CAST, DRIVEWAVE } from './_shared/equipment';
import { SEED_TIME_WINDOW, getDriftSeverity, isPasteBatchIssue } from './_shared/scripted-events';
import {
  setSeed, rand, randInt, randFloat, randPick, randNormal,
  dateRange, shiftsForDay, isWorkingDay,
  baselineOEE, baselineFPY, baselineCycleTime,
  hourlyKwh, powerFactor, thd,
} from './_shared/time-helpers';

const DEFECT_TYPES = [
  'tombstoning', 'insufficient_solder', 'solder_bridge', 'missing_component',
  'misaligned_component', 'wrong_polarity', 'cold_joint', 'solder_ball',
  'lifted_lead', 'pad_damage',
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

export async function seedDrivewave(prisma: any, organizationId: string, consultantUserId: string) {
  setSeed(20260515);
  console.log('\n=== Seeding Drivewave Automotive (Vitesco demo) ===');

  // ============================================================
  // 1. Client + admin user
  // ============================================================
  const drivewaveClient = await prisma.client.create({
    data: {
      organizationId,
      name: DRIVEWAVE.customerName,
      slug: DRIVEWAVE.customerSlug,
      address: DRIVEWAVE.plantAddress,
      industry: DRIVEWAVE.industry,
      employeeCount: 180,
      accessMode: 'COLLABORATIVE',
      gridTariffRate: DRIVEWAVE.gridTariffRateInr,
      contractDemand: DRIVEWAVE.contractDemandKva,
      powerFactorTarget: DRIVEWAVE.powerFactorTarget,
      baselineYear: 2024,
      baselineMonth: 1,
      enabledAddons: JSON.stringify(['IOT_METERING', 'POWER_QUALITY', 'Q_APPS']),
    },
  });
  console.log(`  Client: ${DRIVEWAVE.customerName} (slug=${DRIVEWAVE.customerSlug})`);

  const drivewaveAdminHash = await bcrypt.hash('drivewave123', 10);
  const drivewaveAdmin = await prisma.user.create({
    data: {
      employeeId: 'DW-001',
      name: 'Rohit Deshmukh',
      email: 'admin@drivewave.com',
      passwordHash: drivewaveAdminHash,
      role: 'USER',
      department: 'Operations',
    },
  });
  await prisma.clientAccess.create({ data: { userId: drivewaveAdmin.id, clientId: drivewaveClient.id, role: 'CLIENT_ADMIN' } });
  await prisma.clientAccess.create({ data: { userId: consultantUserId, clientId: drivewaveClient.id, role: 'CLIENT_ADMIN' } });

  // ============================================================
  // 2. EnergySource ×8 (one per SMT machine)
  // ============================================================
  const energySources: Record<string, any> = {};
  for (const eq of EQUIPMENT_CAST) {
    const source = await prisma.energySource.create({
      data: {
        clientId: drivewaveClient.id,
        name: `${eq.code} — ${eq.name}`,
        type: 'GRID',
        unit: 'kWh',
        location: `${DRIVEWAVE.plantName} / ${eq.category}`,
        meterNumber: eq.code,
        costPerUnit: DRIVEWAVE.gridTariffRateInr,
        kwAvg: eq.kwAvg,
        kwPeak: eq.kwPeak,
        criticality: eq.criticality,
        manufacturer: eq.manufacturer,
        purchasePriceInr: eq.purchasePriceInr,
        lifespanYears: eq.lifespanYears,
        pmFreqDays: eq.pmFreqDays,
        installedDate: new Date(eq.installedDate),
      },
    });
    energySources[eq.code] = source;
  }
  console.log(`  EnergySources: ${Object.keys(energySources).length}`);

  // ============================================================
  // 3. IoTGateway ×1 + IoTMeter ×8
  // ============================================================
  const gateway = await prisma.ioTGateway.create({
    data: {
      clientId: drivewaveClient.id,
      name: 'Pune SMT-1 Main Gateway',
      serialNumber: 'ESX-DW-001',
      gatewayType: 'ESX_UNIVERSAL',
      make: 'SCHNEIDER',
      firmwareVersion: '2.4.1',
      location: `${DRIVEWAVE.plantName} / Main Panel`,
      protocol: 'MQTT_WEBHOOK',
      pushIntervalSeconds: 60,
      isOnline: true,
      lastSeenAt: new Date(SEED_TIME_WINDOW.end),
    },
  });

  const meters: Record<string, any> = {};
  let modbusAddr = 1;
  for (const eq of EQUIPMENT_CAST) {
    const meter = await prisma.ioTMeter.create({
      data: {
        clientId: drivewaveClient.id,
        gatewayId: gateway.id,
        energySourceId: energySources[eq.code].id,
        name: `${eq.code} Meter`,
        meterSerial: `EM6400NG-${eq.code}`,
        modbusAddress: modbusAddr++,
        make: 'SCHNEIDER',
        model: 'EM6400NG',
        meterType: eq.code === 'REF-01' || eq.code.startsWith('PNP') ? 'SUBMETER' : 'SUBMETER',
        ratedVoltage: 415,
        panelName: 'SMT-1 Main Panel',
        circuitName: eq.code,
        location: `${DRIVEWAVE.plantName} / ${eq.category}`,
      },
    });
    meters[eq.code] = meter;
  }
  console.log(`  IoTGateway + IoTMeters: 1 + ${Object.keys(meters).length}`);

  // ============================================================
  // 4. MeterReading — hourly, 3 years × 8 meters ≈ 210K
  // ============================================================
  console.log('  MeterReadings (this is slow — ~210K rows)...');
  const start = new Date(SEED_TIME_WINDOW.start);
  const end = new Date(SEED_TIME_WINDOW.end);
  const cumulativeKwh: Record<string, number> = Object.fromEntries(EQUIPMENT_CAST.map(e => [e.code, 0]));
  const READING_BATCH = 2000;
  let readingBatch: any[] = [];
  let readingCount = 0;

  const flushReadings = async () => {
    if (readingBatch.length === 0) return;
    await prisma.meterReading.createMany({ data: readingBatch });
    readingCount += readingBatch.length;
    readingBatch = [];
  };

  for (const day of dateRange(start, end)) {
    const driftRef = getDriftSeverity('REF-01', day);
    for (let h = 0; h < 24; h++) {
      const ts = new Date(day);
      ts.setHours(h, 0, 0, 0);
      for (const eq of EQUIPMENT_CAST) {
        const meter = meters[eq.code];
        const kw = hourlyKwh(eq, day, h);
        cumulativeKwh[eq.code] += kw; // 1 hour = kWh equals kW for the hour
        let pf = powerFactor(eq.code, day);
        let thdVal = thd(eq.code);
        // REF-01 PF dips during drift; THD climbs
        if (eq.code === 'REF-01' && driftRef) {
          const sev = driftRef === 'critical' ? 0.06 : driftRef === 'rising' ? 0.04 : 0.02;
          pf = Math.max(0.72, pf - sev);
          thdVal = Math.min(20, thdVal + (driftRef === 'critical' ? 4 : 2));
        }
        const v = 415 + randNormal(0, 1.5);
        readingBatch.push({
          meterId: meter.id,
          timestamp: ts,
          activePowerKW: Number(kw.toFixed(3)),
          apparentPowerKVA: Number((kw / Math.max(0.5, pf)).toFixed(3)),
          reactivePowerKVAR: Number((kw * Math.tan(Math.acos(pf))).toFixed(3)),
          powerFactor: Number(pf.toFixed(3)),
          voltageR: Number(v.toFixed(1)),
          voltageY: Number((v + randNormal(0, 0.8)).toFixed(1)),
          voltageB: Number((v + randNormal(0, 0.8)).toFixed(1)),
          voltageAvg: Number(v.toFixed(1)),
          currentR: Number((kw * 1000 / (Math.sqrt(3) * v * pf)).toFixed(2)),
          energyKwh: Number(cumulativeKwh[eq.code].toFixed(2)),
          frequencyHz: Number((50 + randNormal(0, 0.05)).toFixed(2)),
          thdVoltage: Number(thdVal.toFixed(2)),
          thdCurrent: Number((thdVal * 1.3).toFixed(2)),
          demandKW: Number(kw.toFixed(3)),
        });
        if (readingBatch.length >= READING_BATCH) await flushReadings();
      }
    }
  }
  await flushReadings();
  console.log(`    ${readingCount} meter readings`);

  // ============================================================
  // 5. ConsumptionEntry — daily summary per source
  // ============================================================
  console.log('  ConsumptionEntries (daily per source)...');
  const CE_BATCH = 1000;
  let ceBatch: any[] = [];
  let ceCount = 0;
  const flushCE = async () => {
    if (ceBatch.length === 0) return;
    await prisma.consumptionEntry.createMany({ data: ceBatch });
    ceCount += ceBatch.length;
    ceBatch = [];
  };

  // Re-iterate days, sum hourly kWh per source for the day
  const cumulativeKwh2: Record<string, number> = Object.fromEntries(EQUIPMENT_CAST.map(e => [e.code, 0]));
  setSeed(20260515); // re-seed so values track meter readings deterministically
  for (const day of dateRange(start, end)) {
    for (const eq of EQUIPMENT_CAST) {
      let dayKwh = 0;
      for (let h = 0; h < 24; h++) {
        dayKwh += hourlyKwh(eq, day, h);
      }
      cumulativeKwh2[eq.code] += dayKwh;
      const cost = dayKwh * DRIVEWAVE.gridTariffRateInr;
      ceBatch.push({
        clientId: drivewaveClient.id,
        energySourceId: energySources[eq.code].id,
        recordedById: drivewaveAdmin.id,
        date: new Date(day),
        value: Number(dayKwh.toFixed(2)),
        unit: 'kWh',
        cost: Number(cost.toFixed(2)),
        meterReading: Number(cumulativeKwh2[eq.code].toFixed(2)),
        shift: 'DAY_TOTAL',
      });
      if (ceBatch.length >= CE_BATCH) await flushCE();
    }
  }
  await flushCE();
  console.log(`    ${ceCount} consumption entries`);

  // ============================================================
  // 6. UtilityBill — 36 monthly bills with PF penalty + demand overshoot in 2 months
  // ============================================================
  console.log('  UtilityBills (monthly)...');
  // Build monthly aggregates from cumulativeKwh2 trajectory; simpler — recompute from EQUIPMENT_CAST kwAvg.
  const monthsSeed = (() => {
    const ms: { y: number; m: number }[] = [];
    let y = start.getFullYear(); let m = start.getMonth() + 1;
    while (y < end.getFullYear() || (y === end.getFullYear() && m <= end.getMonth() + 1)) {
      ms.push({ y, m }); m++; if (m > 12) { m = 1; y++; }
    }
    return ms;
  })();

  // Months with PF penalty + demand overshoot:
  //  - Oct 2025 (PNP-02 deferral / breakdown month)
  //  - Feb 2026 (REF-01 drift acceleration / failure)
  const PENALTY_MONTHS = new Set(['2025-10', '2026-02']);

  let billCount = 0;
  for (const { y, m } of monthsSeed) {
    const daysInMonth = new Date(y, m, 0).getDate();
    let totalKwh = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(y, m - 1, d);
      for (const eq of EQUIPMENT_CAST) {
        for (let h = 0; h < 24; h++) totalKwh += hourlyKwh(eq, day, h);
      }
    }
    const isPenalty = PENALTY_MONTHS.has(`${y}-${String(m).padStart(2, '0')}`);
    const pf = isPenalty ? 0.88 : randFloat(0.93, 0.97);
    const demandKVA = isPenalty ? DRIVEWAVE.contractDemandKva * 1.08 : randFloat(180, 235);
    const energyCharges = totalKwh * DRIVEWAVE.gridTariffRateInr;
    const demandCharges = demandKVA * 350; // ₹350/kVA/month rough
    const pfPenalty = isPenalty ? Math.round((DRIVEWAVE.powerFactorTarget - pf) * 100 * 0.005 * energyCharges) : 0;
    const overshootCost = demandKVA > DRIVEWAVE.contractDemandKva
      ? Math.round((demandKVA - DRIVEWAVE.contractDemandKva) * 350 * 1.0) // 2× penalty already in demandCharges via demandKVA above; this captures overshoot premium
      : 0;
    const fuelSurcharge = energyCharges * 0.05;
    const electricityDuty = energyCharges * 0.09;
    const totalAmount = energyCharges + demandCharges + pfPenalty + overshootCost + fuelSurcharge + electricityDuty;

    await prisma.utilityBill.create({
      data: {
        clientId: drivewaveClient.id,
        month: m, year: y,
        provider: 'MSEDCL',
        tariffCategory: 'HT_INDUSTRIAL',
        unitsConsumed: Number(totalKwh.toFixed(0)),
        demandKVA: Number(demandKVA.toFixed(1)),
        powerFactor: Number(pf.toFixed(3)),
        energyCharges: Number(energyCharges.toFixed(2)),
        demandCharges: Number(demandCharges.toFixed(2)),
        pfPenalty: Number(pfPenalty.toFixed(2)),
        fuelSurcharge: Number(fuelSurcharge.toFixed(2)),
        electricityDuty: Number(electricityDuty.toFixed(2)),
        otherCharges: Number(overshootCost.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        hasPfPenalty: pfPenalty > 0,
        hasDemandOvershoot: demandKVA > DRIVEWAVE.contractDemandKva,
        hasAnomaly: isPenalty,
        anomalyNote: isPenalty ? `PF dropped to ${pf.toFixed(2)} (target ${DRIVEWAVE.powerFactorTarget}) and demand exceeded contracted ${DRIVEWAVE.contractDemandKva} kVA` : null,
        enteredById: drivewaveAdmin.id,
      },
    });
    billCount++;
  }
  console.log(`    ${billCount} utility bills`);

  // ============================================================
  // 7. Inspection / Incident / CAPA / Audit — handful for UI cred
  // ============================================================
  console.log('  Inspection / Incident / CAPA / Audit (handful)...');

  const inspTemplate = await prisma.inspectionTemplate.create({
    data: {
      name: 'SMT Line Daily Safety Walkthrough',
      category: 'GENERAL_SAFETY',
      description: 'Daily safety + ESD + housekeeping check for SMT line',
      isBuiltIn: false,
      organizationId,
    },
  });
  await prisma.inspectionTemplateItem.createMany({
    data: [
      { templateId: inspTemplate.id, section: 'ESD', itemText: 'ESD wrist straps in use at all stations', type: 'PASS_FAIL', isCritical: true, sortOrder: 1 },
      { templateId: inspTemplate.id, section: 'ESD', itemText: 'ESD floor mats grounded', type: 'PASS_FAIL', isCritical: true, sortOrder: 2 },
      { templateId: inspTemplate.id, section: 'Reflow', itemText: 'Reflow oven exhaust functioning', type: 'PASS_FAIL', sortOrder: 3 },
      { templateId: inspTemplate.id, section: 'Housekeeping', itemText: 'Solder paste fridge temp <8°C', type: 'NUMERIC', sortOrder: 4 },
      { templateId: inspTemplate.id, section: 'PPE', itemText: 'Safety glasses + closed-toe shoes', type: 'PASS_FAIL', sortOrder: 5 },
    ],
  });

  for (let i = 0; i < 6; i++) {
    const insDate = new Date(end);
    insDate.setDate(insDate.getDate() - i * 14);
    await prisma.inspection.create({
      data: {
        clientId: drivewaveClient.id,
        templateId: inspTemplate.id,
        inspectorId: drivewaveAdmin.id,
        inspectionDate: insDate,
        location: DRIVEWAVE.plantName,
        status: 'COMPLETED',
        overallResult: i === 2 ? 'PARTIAL' : 'PASS',
        score: i === 2 ? 80 : randFloat(92, 100, 1),
        completedDate: insDate,
      },
    });
  }

  // Incidents — mostly near-miss
  const incidentSeeds = [
    { type: 'ELECTRICAL', severity: 'NEAR_MISS', title: 'Loose contactor in reflow panel detected during PM', daysAgo: 48 },
    { type: 'ELECTRICAL', severity: 'MINOR', title: 'PNP-02 controller fan failure — line halted 4 hours', daysAgo: 215, rootCause: 'Worn bearing in cooling fan; fan replaced.' },
    { type: 'MECHANICAL', severity: 'MAJOR', title: 'REF-01 zone-3 thermocouple complete failure — 8h downtime', daysAgo: 90, rootCause: 'Thermocouple drift not actioned despite repeat alerts.' },
    { type: 'CHEMICAL', severity: 'NEAR_MISS', title: 'Solder paste batch B-4451 viscosity out of spec', daysAgo: 67 },
  ];
  for (const inc of incidentSeeds) {
    const dt = new Date(end);
    dt.setDate(dt.getDate() - inc.daysAgo);
    await prisma.incident.create({
      data: {
        clientId: drivewaveClient.id,
        type: inc.type,
        severity: inc.severity,
        title: inc.title,
        description: inc.title,
        location: `${DRIVEWAVE.plantName} / SMT Line 1`,
        incidentDate: dt,
        reportedById: drivewaveAdmin.id,
        rootCause: inc.rootCause || null,
        status: inc.severity === 'NEAR_MISS' ? 'CLOSED' : 'CORRECTIVE_ACTION',
      },
    });
  }

  // CAPA — link to drift incident
  await prisma.cAPA.create({
    data: {
      clientId: drivewaveClient.id,
      capaNumber: 'CAPA-DW-2026-001',
      type: 'CORRECTIVE',
      source: 'INCIDENT',
      title: 'Install REF-01 zone thermocouple redundancy + automated drift alerting',
      description: 'After the 14-Feb-2026 zone-3 thermocouple failure, plant lost 8 hours of production. Need redundant TC + automated drift alert via VoltSpark thresholds.',
      raisedById: drivewaveAdmin.id,
      assignedToId: drivewaveAdmin.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      rootCause: 'Single-point thermocouple with no automated drift detection. Manual log review missed gradual drift.',
      correctiveAction: 'Install redundant thermocouple + wire drift alert into VoltSpark.',
      preventiveAction: 'Add zone3_temperature drift to standard PQ alert templates for all reflow ovens.',
      actionDueDate: new Date('2026-06-15'),
    },
  });

  // Audit — Q1 quality audit
  await prisma.audit.create({
    data: {
      clientId: drivewaveClient.id,
      title: 'Q1 2026 Internal Quality Audit — SMT Line',
      type: 'INTERNAL',
      auditDate: new Date('2026-04-08'),
      leadAuditorId: drivewaveAdmin.id,
      scope: 'Full SMT line — paste handling, placement, reflow, AOI/ICT/FCT, defect tracking',
      status: 'COMPLETED',
      summary: 'Drift in REF-01 zone-3 thermocouple identified as systemic risk. AOI false-reject rate climbing post-deferred PMs. Recommended actions tracked under CAPA-DW-2026-001.',
      completedDate: new Date('2026-04-12'),
    },
  });

  // ============================================================
  // 8. Q-APPS — ProductionRecord, ProcessExcursion, DefectEvent
  // ============================================================
  setSeed(20260515);
  console.log('  Q-Apps: ProductionRecords...');
  const shiftToRecordId = new Map<string, string>();
  let prCount = 0;
  for (const day of dateRange(start, end)) {
    if (!isWorkingDay(day)) continue;
    for (const shift of shiftsForDay(day)) {
      if (!shift.isWorking) continue;
      let oee = baselineOEE(day);
      let fpy = baselineFPY();
      if (isPasteBatchIssue(day)) {
        fpy *= 0.985;
        oee *= 0.97;
      }
      const unitsPlanned = DRIVEWAVE.unitsPlannedPerShift;
      const unitsProduced = Math.round(unitsPlanned * Math.min(1, oee + randNormal(0, 0.04)));
      const unitsRejected = Math.round(unitsProduced * (1 - fpy));
      const ppmDefects = Math.round((unitsRejected / Math.max(1, unitsProduced)) * 1_000_000);
      const downtimePlanned = randInt(15, 45);
      const downtimeUnplanned = isPasteBatchIssue(day) ? randInt(20, 60) : randInt(0, 15);
      const rec = await prisma.productionRecord.create({
        data: {
          clientId: drivewaveClient.id,
          lineId: DRIVEWAVE.lineId,
          shiftDate: new Date(day),
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
      shiftToRecordId.set(key, rec.id);
      prCount++;
    }
  }
  console.log(`    ${prCount} production records`);

  console.log('  Q-Apps: ProcessExcursions...');
  const excursionIds: string[] = [];
  for (const day of dateRange(start, end)) {
    if (!isWorkingDay(day)) continue;
    const drift = getDriftSeverity('REF-01', day);
    if (drift) {
      const occurrences = drift === 'critical' ? randInt(3, 6) : drift === 'rising' ? randInt(1, 3) : randInt(0, 1);
      for (let i = 0; i < occurrences; i++) {
        const expectedTemp = 245.0;
        const driftMagnitude = drift === 'critical' ? randFloat(8, 15) : drift === 'rising' ? randFloat(5, 10) : randFloat(3, 6);
        const observed = expectedTemp + (rand() < 0.6 ? driftMagnitude : -driftMagnitude);
        const at = new Date(day);
        at.setHours(randInt(6, 22), randInt(0, 59));
        const created = await prisma.processExcursion.create({
          data: {
            clientId: drivewaveClient.id,
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
      }
    }
    if (isPasteBatchIssue(day) && rand() < 0.5) {
      const at = new Date(day);
      at.setHours(randInt(6, 22), randInt(0, 59));
      const created = await prisma.processExcursion.create({
        data: {
          clientId: drivewaveClient.id,
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
    }
  }
  console.log(`    ${excursionIds.length} process excursions`);

  console.log('  Q-Apps: DefectEvents (slow — ~225K rows)...');
  const DEFECT_BATCH = 1500;
  let defectBatch: any[] = [];
  let defectCount = 0;
  const flushDefects = async () => {
    if (defectBatch.length === 0) return;
    await prisma.defectEvent.createMany({ data: defectBatch });
    defectCount += defectBatch.length;
    defectBatch = [];
  };

  for (const day of dateRange(start, end)) {
    if (!isWorkingDay(day)) continue;
    const drift = getDriftSeverity('REF-01', day);
    const pasteIssue = isPasteBatchIssue(day);
    for (const shift of shiftsForDay(day)) {
      if (!shift.isWorking) continue;
      const key = `${day.toISOString().slice(0, 10)}-${shift.shiftNumber}`;
      const productionRecordId = shiftToRecordId.get(key);
      if (!productionRecordId) continue;

      let defectsThisShift = randInt(60, 95);
      if (drift === 'rising') defectsThisShift = Math.round(defectsThisShift * 1.4);
      if (drift === 'critical') defectsThisShift = Math.round(defectsThisShift * 1.8);
      if (pasteIssue) defectsThisShift = Math.round(defectsThisShift * 1.6);

      for (let i = 0; i < defectsThisShift; i++) {
        let defectType: string;
        if (pasteIssue && rand() < 0.45) defectType = randPick(['tombstoning', 'insufficient_solder', 'solder_ball']);
        else if (drift && rand() < 0.4) defectType = randPick(['insufficient_solder', 'cold_joint', 'lifted_lead']);
        else defectType = randPick(DEFECT_TYPES);

        const detectedAtMachine = randPick(['AOI-01', 'ICT-01', 'FCT-01']);
        const severity = randPick(['low', 'low', 'low', 'medium', 'high']);
        const action = severity === 'high' ? 'scrap' : rand() < 0.85 ? 'rework' : 'accept_with_deviation';
        const at = new Date(day);
        at.setHours(shift.startHour + Math.floor(rand() * 8), randInt(0, 59));

        let linkedReflowExcursionId: string | null = null;
        if (drift && excursionIds.length > 0 && rand() < 0.25) {
          linkedReflowExcursionId = randPick(excursionIds);
        }

        defectBatch.push({
          clientId: drivewaveClient.id,
          productionRecordId,
          detectedAt: at,
          detectedAtMachine,
          boardSerial: `ECU-${day.getFullYear()}-${String(defectCount + defectBatch.length).padStart(8, '0')}`,
          defectType,
          severity,
          componentRef: randPick([null, `C${randInt(1, 200)}`, `R${randInt(1, 300)}`, `U${randInt(1, 30)}`]),
          actionTaken: action,
          rootCauseSuspect: randPick(ROOT_CAUSES_BY_DEFECT[defectType] || [null]),
          linkedReflowExcursionId,
        });
        if (defectBatch.length >= DEFECT_BATCH) await flushDefects();
      }
    }
  }
  await flushDefects();
  console.log(`    ${defectCount} defect events`);

  console.log('=== Drivewave seed complete ===\n');
}
