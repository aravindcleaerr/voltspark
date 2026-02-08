import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with real Unnathi CNC data...');

  // Clean existing data
  await prisma.cAPAComment.deleteMany();
  await prisma.cAPA.deleteMany();
  await prisma.auditFinding.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.trainingAttendance.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.consumptionEntry.deleteMany();
  await prisma.energyTarget.deleteMany();
  await prisma.energySource.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('unnathi123', 10);

  // ============================================================
  // USERS — Real employees from Training Record (08/03/2025)
  // ============================================================
  const suresh = await prisma.user.create({
    data: { employeeId: 'UCNC-001', name: 'Suresh Kumar S', email: 'sureshkumar@unnathicnc.com', passwordHash: hash, role: 'ADMIN', department: 'Management' },
  });
  const sandeep = await prisma.user.create({
    data: { employeeId: 'UCNC-002', name: 'Sandeep G. Parvatikar', email: 'sandeep@unnathicnc.com', passwordHash: hash, role: 'ADMIN', department: 'Management' },
  });
  const murali = await prisma.user.create({
    data: { employeeId: 'UCNC-003', name: 'Murali', email: 'murali@unnathicnc.com', passwordHash: hash, role: 'MANAGER', department: 'Production' },
  });
  const rajaseKharkin = await prisma.user.create({
    data: { employeeId: 'UCNC-004', name: 'Rajase Kharkin', email: 'rajase@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Marketing' },
  });
  const naveenDB = await prisma.user.create({
    data: { employeeId: 'UCNC-005', name: 'Naveen DB', email: 'naveen@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Design' },
  });
  const nandanKumar = await prisma.user.create({
    data: { employeeId: 'UCNC-006', name: 'Nandan Kumar', email: 'nandan@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Quality' },
  });
  const saadnasukh = await prisma.user.create({
    data: { employeeId: 'UCNC-007', name: 'Saadnasukh M', email: 'saadnasukh@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Turning' },
  });
  const prashant = await prisma.user.create({
    data: { employeeId: 'UCNC-008', name: 'Prashant UG PD', email: 'prashant@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Milling' },
  });
  const aral = await prisma.user.create({
    data: { employeeId: 'UCNC-009', name: 'M. Aral', email: 'aral@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Development' },
  });
  const nadhiya = await prisma.user.create({
    data: { employeeId: 'UCNC-010', name: 'Nadhiya S', email: 'nadhiya@unnathicnc.com', passwordHash: hash, role: 'MANAGER', department: 'Sales' },
  });
  const vilas = await prisma.user.create({
    data: { employeeId: 'UCNC-011', name: 'Vilas M.B', email: 'vilas@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Maintenance' },
  });
  const sumithra = await prisma.user.create({
    data: { employeeId: 'UCNC-012', name: 'Sumithra', email: 'sumithra@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Polish' },
  });
  const anilThakur = await prisma.user.create({
    data: { employeeId: 'UCNC-013', name: 'Anil Thakur', email: 'anil@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Pressing' },
  });
  const jyothiPrasad = await prisma.user.create({
    data: { employeeId: 'UCNC-014', name: 'Jyothi Prasad P', email: 'jyothi@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Grinding' },
  });
  const niranjana = await prisma.user.create({
    data: { employeeId: 'UCNC-015', name: 'Niranjana C', email: 'niranjana@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Milling' },
  });
  const raviKumar = await prisma.user.create({
    data: { employeeId: 'UCNC-016', name: 'Ravi Kumar', email: 'ravikumar@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Wirecut' },
  });

  console.log('16 users created (real employee data from training records)');

  // ============================================================
  // ENERGY SOURCES — From Energy Management Plan & Visit
  // ============================================================
  const mainGrid = await prisma.energySource.create({
    data: {
      name: 'Main Grid Supply (EB)',
      type: 'ELECTRICITY',
      unit: 'kWh',
      description: 'BESCOM electricity supply — CNC machines, lighting, HVAC, pumps, and ancillary equipment',
      location: 'Main Factory — Peenya Industrial Area',
      meterNumber: 'EB-MAIN-001',
    },
  });
  const solarPV = await prisma.energySource.create({
    data: {
      name: 'Solar PV Installation',
      type: 'ELECTRICITY',
      unit: 'kWh',
      description: 'Rooftop solar panel installation — renewable energy source supplementing grid power',
      location: 'Factory Rooftop',
      meterNumber: 'SOL-001',
    },
  });
  const compressedAir = await prisma.energySource.create({
    data: {
      name: 'Compressed Air System',
      type: 'COMPRESSED_AIR',
      unit: 'm³',
      description: 'Air compressor system — tool changes, work holding, cleaning operations',
      location: 'Compressor Room',
      meterNumber: 'CA-001',
    },
  });
  const hydraulics = await prisma.energySource.create({
    data: {
      name: 'Hydraulic System',
      type: 'OTHER',
      unit: 'kWh',
      description: 'Hydraulic power for clamps and certain CNC equipment',
      location: 'CNC Machine Shop',
      meterNumber: 'HYD-001',
    },
  });
  const hvac = await prisma.energySource.create({
    data: {
      name: 'HVAC System',
      type: 'ELECTRICITY',
      unit: 'kWh',
      description: 'Heating, ventilation and air conditioning for factory and office areas',
      location: 'Factory & Office',
      meterNumber: 'HVAC-001',
    },
  });

  console.log('5 energy sources created (real data from Energy Management Plan)');

  // ============================================================
  // TARGETS — From actual records: Solar 8000 kWh/mo +5% yearly,
  //           Grid target 10% reduction yearly
  // ============================================================

  // Solar targets — monthly 8,000 kWh target, 5% yearly increase
  // Baseline from data: avg 8,772 kWh/month (Jul-24 to Jun-25)
  await prisma.energyTarget.create({
    data: {
      energySourceId: solarPV.id, period: '2024-Q3', periodType: 'QUARTERLY',
      targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0,
      actualValue: 24706, isActive: false,
      notes: 'Jul-24: 9136, Aug-24: 7498, Sep-24: 8572. Target 8000/month. Aug below target due to monsoon.',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: solarPV.id, period: '2024-Q4', periodType: 'QUARTERLY',
      targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0,
      actualValue: 24137, isActive: false,
      notes: 'Oct-24: 9110, Nov-24: 8060, Dec-24: 6967. Dec below target due to cyclone weather.',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: solarPV.id, period: '2025-Q1', periodType: 'QUARTERLY',
      targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0,
      actualValue: 25205, isActive: false,
      notes: 'Jan-25: 7456, Feb-25: 8815, Mar-25: 8934. Jan below target (winter overcast).',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: solarPV.id, period: '2025-Q2', periodType: 'QUARTERLY',
      targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0,
      actualValue: 30718, isActive: false,
      notes: 'Apr-25: 10866, May-25: 10301, Jun-25: 9551. Strong solar months — all exceeded target.',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: solarPV.id, period: '2025-Q3', periodType: 'QUARTERLY',
      targetValue: 25200, unit: 'kWh', baselineValue: 24000, reductionPercent: -5,
      isActive: true,
      notes: 'Target increased 5% yearly as per energy management plan. 8400 kWh/month.',
    },
  });

  // Grid targets — target 10% reduction yearly
  // Baseline from data: avg 17,084 kWh/month (Jul-24 to Jun-25) = ~51,252/quarter
  await prisma.energyTarget.create({
    data: {
      energySourceId: mainGrid.id, period: '2024-Q3', periodType: 'QUARTERLY',
      targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0,
      actualValue: 46212, isActive: false,
      notes: 'Jul-24: 13683, Aug-24: 16360, Sep-24: 16169. All months below 22kWh target — LESS.',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: mainGrid.id, period: '2024-Q4', periodType: 'QUARTERLY',
      targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0,
      actualValue: 48342, isActive: false,
      notes: 'Oct-24: 14929, Nov-24: 15999, Dec-24: 17414. All months LESS than target.',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: mainGrid.id, period: '2025-Q1', periodType: 'QUARTERLY',
      targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0,
      actualValue: 54845, isActive: false,
      notes: 'Jan-25: 20645 (highest), Feb-25: 17100, Mar-25: 17683. Jan spike — low solar + high demand.',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: mainGrid.id, period: '2025-Q2', periodType: 'QUARTERLY',
      targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0,
      actualValue: 55030, isActive: false,
      notes: 'Apr-25: 19061, May-25: 19783, Jun-25: 16186. Summer high production months.',
    },
  });
  await prisma.energyTarget.create({
    data: {
      energySourceId: mainGrid.id, period: '2025-Q3', periodType: 'QUARTERLY',
      targetValue: 59400, unit: 'kWh', baselineValue: 66000, reductionPercent: 10,
      isActive: true,
      notes: 'Target reduced 10% yearly as per energy management plan. ~19,800 kWh/month target.',
    },
  });

  console.log('Targets created (real data from consumption records)');

  // ============================================================
  // CONSUMPTION ENTRIES — Real monthly data Jul-24 to Jun-25
  // ============================================================
  const consumptionData: any[] = [];

  // Solar PV monthly production (from document 12.2.1)
  const solarMonthly = [
    { date: '2024-07-31', value: 9136, notes: 'Above 8000 target' },
    { date: '2024-08-31', value: 7498, notes: 'Below target — monsoon rain, less sunlight' },
    { date: '2024-09-30', value: 8572, notes: 'Above target' },
    { date: '2024-10-31', value: 9110, notes: 'Above target' },
    { date: '2024-11-30', value: 8060, notes: 'Above target (marginal)' },
    { date: '2024-12-31', value: 6967, notes: 'Below target — cyclone effect, overcast weather' },
    { date: '2025-01-31', value: 7456, notes: 'Below target — winter overcast, shorter days' },
    { date: '2025-02-28', value: 8815, notes: 'Above target' },
    { date: '2025-03-31', value: 8934, notes: 'Above target' },
    { date: '2025-04-30', value: 10866, notes: 'Excellent solar month — peak production' },
    { date: '2025-05-31', value: 10301, notes: 'Strong solar production' },
    { date: '2025-06-30', value: 9551, notes: 'Above target' },
  ];

  for (const entry of solarMonthly) {
    const target = 8000;
    const deviation = ((entry.value - target) / target) * 100;
    const hasDeviation = entry.value < target;
    consumptionData.push({
      energySourceId: solarPV.id,
      recordedById: sandeep.id,
      date: new Date(entry.date),
      value: entry.value,
      unit: 'kWh',
      notes: entry.notes,
      hasDeviation,
      deviationPercent: hasDeviation ? Math.round(deviation * 10) / 10 : null,
      deviationSeverity: hasDeviation ? (Math.abs(deviation) > 10 ? 'CRITICAL' : 'WARNING') : null,
      deviationNote: hasDeviation ? `Solar production ${Math.abs(Math.round(deviation * 10) / 10)}% below target — ${entry.notes}` : null,
    });
  }

  // Grid (EB) monthly consumption (from document 12.2.2)
  const gridMonthly = [
    { date: '2024-07-31', value: 13683, notes: 'Lowest month — good solar offset' },
    { date: '2024-08-31', value: 16360, notes: 'Higher grid — monsoon reduced solar' },
    { date: '2024-09-30', value: 16169, notes: 'Normal consumption' },
    { date: '2024-10-31', value: 14929, notes: 'Below average' },
    { date: '2024-11-30', value: 15999, notes: 'Normal consumption' },
    { date: '2024-12-31', value: 17414, notes: 'Higher — low solar + cyclone period' },
    { date: '2025-01-31', value: 20645, notes: 'HIGHEST month — lowest solar + high demand. Needs RCA.' },
    { date: '2025-02-28', value: 17100, notes: 'Normal range' },
    { date: '2025-03-31', value: 17683, notes: 'Normal range' },
    { date: '2025-04-30', value: 19061, notes: 'High production month — summer' },
    { date: '2025-05-31', value: 19783, notes: 'High production month — summer' },
    { date: '2025-06-30', value: 16186, notes: 'Returned to normal' },
  ];

  // Grid monthly target: 22,000 kWh (from document heading "HIGHEST POWER CONSUMPTION - 22Kwh")
  for (const entry of gridMonthly) {
    const target = 22000;
    const deviation = ((entry.value - target) / target) * 100;
    // All months marked as "LESS" in the document (below 22,000 target)
    consumptionData.push({
      energySourceId: mainGrid.id,
      recordedById: sandeep.id,
      date: new Date(entry.date),
      value: entry.value,
      unit: 'kWh',
      notes: entry.notes,
      hasDeviation: false,
      deviationPercent: null,
      deviationSeverity: null,
      deviationNote: null,
    });
  }

  // Also add some daily entries for recent months to show daily recording capability
  // Simulate Jan-2026 daily grid readings (approx 600-700 kWh/day based on ~18,000 kWh/month)
  const operators = [vilas.id, saadnasukh.id, prashant.id, murali.id];
  for (let day = 1; day <= 31; day++) {
    const date = new Date(`2026-01-${day.toString().padStart(2, '0')}`);
    if (date.getDay() === 0) continue; // Skip Sundays
    const baseValue = 620;
    const value = Math.round((baseValue + (Math.random() - 0.5) * 120) * 10) / 10;
    const dailyTarget = 22000 / 26; // ~846 kWh/working day
    const deviation = ((value - dailyTarget) / dailyTarget) * 100;
    const hasDeviation = Math.abs(deviation) > 10;
    consumptionData.push({
      energySourceId: mainGrid.id,
      recordedById: operators[day % operators.length],
      date,
      value,
      unit: 'kWh',
      shift: ['MORNING', 'AFTERNOON', 'NIGHT'][day % 3],
      notes: day === 15 ? 'Higher than usual — overtime shift for urgent order' : undefined,
      hasDeviation,
      deviationPercent: hasDeviation ? Math.round(deviation * 10) / 10 : null,
      deviationSeverity: hasDeviation ? (Math.abs(deviation) > 20 ? 'CRITICAL' : 'WARNING') : null,
      deviationNote: hasDeviation ? `${Math.abs(Math.round(deviation * 10) / 10)}% deviation from daily target` : null,
    });
  }

  for (const entry of consumptionData) {
    await prisma.consumptionEntry.create({ data: entry });
  }

  console.log(`${consumptionData.length} consumption entries created (12 months solar + 12 months grid + daily Jan-26)`);

  // ============================================================
  // TRAINING — Real training from 08/03/2025 + upcoming
  // ============================================================
  const training1 = await prisma.trainingProgram.create({
    data: {
      title: 'Energy Management — Awareness & Best Practices',
      description: 'Purpose, Scope, Energy Sources, Targets for Energy Efficiency, Action Plan, Monitoring & Verification, Continual Improvement',
      type: 'AWARENESS',
      trainer: 'Suresh Kumar S',
      scheduledDate: new Date('2025-03-08'),
      duration: 4,
      location: 'Unnathi CNC Technologies Pvt Ltd, Peenya',
      maxParticipants: 20,
      status: 'COMPLETED',
      completionDate: new Date('2025-03-08'),
      notes: 'All 14 attendees rated Satisfactory. Effectiveness assessed by Demonstration/Test (B) and On-the-job Assessment (C). Assessed by Sandeep G. Parvatikar on 28/03/2025.',
    },
  });

  // Attendance for completed training — all 14 employees from the training record
  const trainingAttendees = [
    { userId: rajaseKharkin.id, score: 80, feedback: 'Good understanding of basics' },
    { userId: naveenDB.id, score: 82, feedback: 'Good grasp of energy sources' },
    { userId: nandanKumar.id, score: 85, feedback: 'Quality perspective on energy' },
    { userId: saadnasukh.id, score: 78, feedback: 'Satisfactory' },
    { userId: prashant.id, score: 80, feedback: 'Satisfactory' },
    { userId: aral.id, score: 83, feedback: 'Good questions during session' },
    { userId: murali.id, score: 88, feedback: 'Strong understanding as manager' },
    { userId: nadhiya.id, score: 81, feedback: 'Satisfactory' },
    { userId: vilas.id, score: 86, feedback: 'Good practical knowledge from maintenance' },
    { userId: sumithra.id, score: 79, feedback: 'Satisfactory' },
    { userId: anilThakur.id, score: 77, feedback: 'Satisfactory' },
    { userId: jyothiPrasad.id, score: 80, feedback: 'Satisfactory' },
    { userId: niranjana.id, score: 81, feedback: 'Satisfactory' },
    { userId: raviKumar.id, score: 79, feedback: 'Satisfactory' },
  ];

  await prisma.trainingAttendance.createMany({
    data: trainingAttendees.map(a => ({
      trainingProgramId: training1.id,
      userId: a.userId,
      attended: true,
      score: a.score,
      feedback: a.feedback,
      certificateIssued: true,
    })),
  });

  // Upcoming training — Akshaya Createch workshop
  const training2 = await prisma.trainingProgram.create({
    data: {
      title: 'Energy Management for ZED Certification — Practical Workshop',
      description: 'One-day workshop covering ZED energy requirements, systematic energy recording, target setting, internal energy audits, RCA/CAPA for energy deviations, and digital energy management tools.',
      type: 'SKILL_BUILDING',
      trainer: 'Akshaya Createch (Lakshminarasimhan K & Aravind)',
      scheduledDate: new Date('2026-03-01'),
      duration: 6,
      location: 'Unnathi CNC Technologies Pvt Ltd, Peenya',
      maxParticipants: 20,
      status: 'SCHEDULED',
      notes: 'Proposed by Akshaya Createch following site visit on 07/02/2026. Will use real Unnathi energy data for exercises.',
    },
  });

  await prisma.trainingProgram.create({
    data: {
      title: 'Energy Monitoring System — User Training',
      description: 'Hands-on training for daily use of the digital energy management system — consumption recording, deviation analysis, report generation.',
      type: 'SKILL_BUILDING',
      trainer: 'Akshaya Createch (Aravind)',
      scheduledDate: new Date('2026-04-01'),
      duration: 3,
      location: 'Unnathi CNC Technologies Pvt Ltd',
      maxParticipants: 16,
      status: 'SCHEDULED',
      notes: 'Post-implementation training. To be scheduled after system deployment.',
    },
  });

  console.log('Training programs created (1 completed with 14 attendees, 2 scheduled)');

  // ============================================================
  // AUDITS — From Energy Management Audit Checklist (16/04/2025)
  // ============================================================
  const audit1 = await prisma.audit.create({
    data: {
      title: 'Energy Management Audit — April 2025',
      type: 'INTERNAL',
      auditDate: new Date('2025-04-16'),
      leadAuditorId: nadhiya.id,
      scope: 'Comprehensive energy management audit covering: General Information, Energy Data Monitoring, Lighting Systems, HVAC Systems, Motors/Pumps/Compressors, Process Energy Use, Building Envelope, Water & Steam Management, Employee Awareness & Training, Energy Performance Improvement.',
      status: 'COMPLETED',
      summary: 'Overall satisfactory compliance. 2 Opportunities for Improvement identified: (1) Motion sensors/timers not installed for lighting, (2) Thermostat not set at energy-efficient range. Solar panels installed (renewable). IE3/IE4 energy-efficient motors in place. VFDs installed. Employee training conducted.',
      completedDate: new Date('2025-04-16'),
      nextAuditDate: new Date('2025-07-16'),
    },
  });

  // Audit reviewed by Suresh Kumar S on 16/04/2025
  const audit2 = await prisma.audit.create({
    data: {
      title: 'Q3 2025 Internal Energy Audit',
      type: 'INTERNAL',
      auditDate: new Date('2025-07-16'),
      leadAuditorId: nadhiya.id,
      scope: 'Follow-up on April 2025 findings. Review Q2/Q3 consumption data vs targets. Verify OI implementation status.',
      status: 'COMPLETED',
      summary: 'Follow-up audit. Motion sensor OI still open. Thermostat adjustment partially implemented. Solar production excellent in Q2. Grid consumption within targets.',
      completedDate: new Date('2025-07-18'),
      nextAuditDate: new Date('2026-01-16'),
    },
  });

  await prisma.audit.create({
    data: {
      title: 'Q1 2026 Internal Energy Audit',
      type: 'INTERNAL',
      auditDate: new Date('2026-03-15'),
      leadAuditorId: nadhiya.id,
      scope: 'Periodic energy audit. Follow-up on all open findings. Review annual consumption trends. Prepare for ZED assessment.',
      status: 'PLANNED',
      nextAuditDate: new Date('2026-06-15'),
    },
  });

  // Audit Findings — from the actual audit checklist
  const finding1 = await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingNumber: 1,
      category: 'OPPORTUNITY',
      area: 'Lighting Systems',
      description: 'Motion sensors/timers are NOT installed in applicable areas. LED lights are installed throughout but there is no automated control for occupancy-based lighting in low-traffic areas (stores, corridors, washrooms).',
      evidence: 'Physical inspection of lighting controls across factory. No motion sensors or timer controls found.',
      recommendation: 'Install motion sensors/timers in low-traffic areas (corridors, stores, washrooms, office common areas). Estimated 5-8% reduction in lighting energy.',
      status: 'OPEN',
      dueDate: new Date('2026-03-31'),
    },
  });

  const finding2 = await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingNumber: 2,
      category: 'OPPORTUNITY',
      area: 'HVAC Systems',
      description: 'Thermostat is NOT set at energy-efficient range. HVAC units running but temperature settings not optimized for energy efficiency.',
      recommendation: 'Set thermostat to 24-26°C range as per BEE recommendations. Implement zone-based temperature control.',
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-02-28'),
    },
  });

  await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingNumber: 3,
      category: 'OBSERVATION',
      area: 'Energy Data Monitoring',
      description: 'Energy consumption monitoring is claimed as real-time but is actually done through manual registers and monthly EB bill analysis. No automatic metering or digital monitoring system in place.',
      recommendation: 'Implement digital energy management system for systematic recording. Consider IoT energy meters for automated data capture at key load points.',
      status: 'OPEN',
      dueDate: new Date('2026-06-30'),
    },
  });

  await prisma.auditFinding.create({
    data: {
      auditId: audit2.id,
      findingNumber: 1,
      category: 'OBSERVATION',
      area: 'Follow-up',
      description: 'Motion sensor installation (Finding #1 from April audit) still pending. Thermostat adjustment partially done for office area but not for factory floor.',
      recommendation: 'Expedite motion sensor procurement and installation. Complete thermostat optimization for all zones.',
      status: 'OPEN',
      dueDate: new Date('2026-01-31'),
    },
  });

  console.log('Audits and findings created (real data from audit checklist 16/04/2025)');

  // ============================================================
  // CAPAs — Based on real deviations and audit findings
  // ============================================================
  const capa1 = await prisma.cAPA.create({
    data: {
      capaNumber: 'CAPA-EN-001',
      type: 'PREVENTIVE',
      source: 'DEVIATION',
      sourceReference: 'Solar production below target — Aug 2024, Dec 2024, Jan 2025',
      title: 'Solar Power Production Shortfall Analysis',
      description: 'Solar PV production fell below the 8,000 kWh/month target in 3 out of 12 months: Aug-24 (7,498 kWh), Dec-24 (6,967 kWh), Jan-25 (7,456 kWh). Analysis required per ZED Parameter 12.2.',
      raisedById: sandeep.id,
      assignedToId: sandeep.id,
      priority: 'LOW',
      status: 'CLOSED',
      rcaMethod: 'FIVE_WHY',
      rcaDetails: 'Why 1: Why was solar production below target? — Weather conditions reduced solar irradiance.\nWhy 2: Why did weather affect production? — Aug-24: Heavy monsoon rain. Dec-24: Cyclone effect. Jan-25: Winter overcast skies.\nWhy 3: Are these controllable factors? — No, weather is an external uncontrollable factor.\nWhy 4: Is the solar system underperforming? — No, 9 out of 12 months exceeded target. Annual average (8,772 kWh) exceeds target (8,000 kWh).\nWhy 5: Is the target realistic? — Yes, annual average confirms target is achievable. Seasonal variation is expected.',
      rootCause: 'External weather conditions (monsoon rain, cyclone, winter overcast). Not a system or operational issue. Solar PV panels performing as expected — annual average exceeds target.',
      correctiveAction: 'No corrective action required. Deviation is due to natural weather patterns and is within expected seasonal variation.',
      preventiveAction: 'Continue monitoring monthly. If production falls below target for 3+ consecutive months, inspect solar panels for degradation. Annual cleaning of solar panels scheduled.',
      actionDueDate: new Date('2025-07-01'),
      actionCompletedDate: new Date('2025-06-30'),
      verificationMethod: 'Review of Q2 2025 solar production data',
      verificationDate: new Date('2025-06-30'),
      verificationResult: 'Q2 2025 solar production: Apr 10,866 kWh, May 10,301 kWh, Jun 9,551 kWh — all significantly above target. Confirms no systemic issue. CAPA closed.',
      verifiedBy: 'Suresh Kumar S',
    },
  });

  const capa2 = await prisma.cAPA.create({
    data: {
      capaNumber: 'CAPA-EN-002',
      type: 'CORRECTIVE',
      source: 'DEVIATION',
      sourceReference: 'Grid consumption spike — January 2025 (20,645 kWh)',
      title: 'Grid Consumption Spike Investigation — Jan 2025',
      description: 'January 2025 grid consumption (20,645 kWh) was the highest in 12 months — 21% above the 12-month average of 17,084 kWh. This coincided with the lowest solar month (7,456 kWh). Investigation required.',
      raisedById: sandeep.id,
      assignedToId: murali.id,
      priority: 'MEDIUM',
      status: 'CLOSED',
      rcaMethod: 'FIVE_WHY',
      rcaDetails: 'Why 1: Why was grid consumption highest in Jan-25? — Solar generation was at its lowest (7,456 kWh), so grid had to compensate.\nWhy 2: Why was solar so low? — Winter overcast weather conditions.\nWhy 3: Why did grid spike so much (21% above average)? — Production demand remained same while solar contribution dropped by ~15%.\nWhy 4: Why was production not adjusted for lower solar? — No mechanism to link production scheduling with solar availability.\nWhy 5: Why is there no such mechanism? — Energy availability and production planning are managed independently.',
      rootCause: 'Grid consumption spiked because solar generation dropped (weather) while production demand stayed constant. No mechanism to adjust production load based on energy availability.',
      correctiveAction: 'Reviewed Jan-25 data. Grid spike is explainable by solar shortfall + constant production. No waste or inefficiency identified.',
      preventiveAction: 'Consider scheduling energy-intensive operations during peak solar hours (10 AM - 3 PM). Share monthly solar forecast with production planning team. Review load scheduling during low-solar months.',
      actionDueDate: new Date('2025-04-01'),
      actionCompletedDate: new Date('2025-03-28'),
      verificationMethod: 'Review Q2 2025 grid consumption pattern',
      verificationDate: new Date('2025-06-30'),
      verificationResult: 'Q2 2025 grid: Apr 19,061, May 19,783, Jun 16,186. Higher production but with better solar offset. No anomalous spikes. CAPA closed.',
      verifiedBy: 'Suresh Kumar S',
    },
  });

  const capa3 = await prisma.cAPA.create({
    data: {
      capaNumber: 'CAPA-EN-003',
      type: 'CORRECTIVE',
      source: 'AUDIT_FINDING',
      sourceReference: 'Audit Finding #2 — HVAC thermostat not at energy-efficient range',
      title: 'HVAC Thermostat Optimization',
      description: 'Internal audit (16/04/2025) found that HVAC thermostats are not set at energy-efficient ranges. Marked as Opportunity for Improvement.',
      raisedById: nadhiya.id,
      assignedToId: vilas.id,
      priority: 'MEDIUM',
      status: 'IN_IMPLEMENTATION',
      rcaMethod: 'FIVE_WHY',
      rcaDetails: 'Why 1: Why is the thermostat not at efficient range? — Set at 20-22°C for comfort.\nWhy 2: Why is 20-22°C not efficient? — BEE recommends 24-26°C for energy efficiency.\nWhy 3: Why was BEE recommendation not followed? — Employees preferred cooler temperatures.\nWhy 4: Why was employee preference prioritized over efficiency? — No energy policy guideline on HVAC settings.\nWhy 5: Why was there no guideline? — HVAC was not included in the energy management plan at that detail level.',
      rootCause: 'No specific HVAC temperature guidelines in the energy management plan. Employee comfort preference overrode energy efficiency without a documented standard.',
      correctiveAction: 'Set all office thermostats to 24°C. Factory floor HVAC adjusted based on process requirements with minimum 24°C baseline.',
      preventiveAction: 'Add HVAC temperature guidelines to Energy Management Plan. Display temperature setting signage near all AC units. Include in monthly energy audit checklist.',
      actionDueDate: new Date('2026-02-28'),
    },
  });

  // Link finding to CAPA
  await prisma.auditFinding.update({
    where: { id: finding2.id },
    data: { capaId: capa3.id },
  });

  // CAPA Comments
  await prisma.cAPAComment.createMany({
    data: [
      { capaId: capa1.id, userId: sandeep.id, comment: 'CAPA raised for solar production shortfall analysis as per ZED 12.2 requirement. 3 months below 8000 kWh target.', createdAt: new Date('2025-07-01T10:00:00') },
      { capaId: capa1.id, userId: sandeep.id, comment: 'RCA completed. All 3 low months attributable to weather (monsoon, cyclone, winter). Annual average 8,772 kWh exceeds 8,000 target. No corrective action needed.', createdAt: new Date('2025-07-05T14:00:00') },
      { capaId: capa1.id, userId: suresh.id, comment: 'Reviewed and agreed. Weather is external factor. Solar system performing well overall. CAPA can be closed.', createdAt: new Date('2025-07-06T11:00:00') },

      { capaId: capa2.id, userId: sandeep.id, comment: 'Jan-25 grid consumption 20,645 kWh — highest in 12 months. Investigating correlation with low solar output.', createdAt: new Date('2025-02-05T09:00:00') },
      { capaId: capa2.id, userId: murali.id, comment: 'Production logs confirm Jan-25 had normal production volume. No overtime or special orders. Grid spike is purely from solar shortfall compensation.', createdAt: new Date('2025-02-15T14:00:00') },
      { capaId: capa2.id, userId: sandeep.id, comment: 'Proposed preventive action: schedule energy-intensive operations during peak solar hours. Discussing with production.', createdAt: new Date('2025-03-01T10:00:00') },
      { capaId: capa2.id, userId: suresh.id, comment: 'Good analysis. Approved preventive action. Let us verify in Q2 results.', createdAt: new Date('2025-03-05T16:00:00') },
      { capaId: capa2.id, userId: sandeep.id, comment: 'Q2 verification complete. No anomalous spikes despite high production. CAPA effective. Closing.', createdAt: new Date('2025-06-30T15:00:00') },

      { capaId: capa3.id, userId: nadhiya.id, comment: 'CAPA raised from internal audit finding. HVAC thermostat not at BEE-recommended energy-efficient range.', createdAt: new Date('2025-04-20T10:00:00') },
      { capaId: capa3.id, userId: vilas.id, comment: 'Office thermostats adjusted to 24°C. Factory floor assessment in progress — need to check process temperature requirements.', createdAt: new Date('2025-05-15T14:00:00') },
      { capaId: capa3.id, userId: vilas.id, comment: 'Factory floor HVAC adjusted. Some areas need 22°C for dimensional stability during precision machining. Documented as exceptions.', createdAt: new Date('2026-01-10T09:00:00') },
    ],
  });

  console.log('CAPAs created (real data — solar deviation, grid spike, HVAC audit finding)');

  // ============================================================
  // APP SETTINGS
  // ============================================================
  await prisma.appSetting.createMany({
    data: [
      { key: 'company_name', value: 'Unnathi CNC Technologies Pvt Ltd' },
      { key: 'company_address', value: 'No. 487, D1 & D2, 13th Cross, 4th Phase, Peenya Industrial Area, Bangalore-560 058' },
      { key: 'company_certifications', value: 'AS9100D, ISO 9001:2015' },
      { key: 'deviation_threshold_warning', value: '10' },
      { key: 'deviation_threshold_critical', value: '20' },
      { key: 'certification', value: 'ZED (Zero Defect Zero Effect)' },
      { key: 'consultant', value: 'Akshaya Createch' },
      { key: 'energy_policy_approved_by', value: 'Sandeep G. Parvatikar' },
      { key: 'energy_policy_date', value: '2025-01-10' },
      { key: 'solar_monthly_target', value: '8000' },
      { key: 'grid_monthly_target', value: '22000' },
    ],
  });

  console.log('App settings created');
  console.log('');
  console.log('=== Seeding complete! ===');
  console.log('Login credentials:');
  console.log('  Admin:   sureshkumar@unnathicnc.com / unnathi123');
  console.log('  Admin:   sandeep@unnathicnc.com / unnathi123');
  console.log('  Manager: murali@unnathicnc.com / unnathi123');
  console.log('  Any employee email / unnathi123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
