import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

function createPrisma() {
  if (process.env.TURSO_DATABASE_URL) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  } else {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
    return new PrismaClient({ adapter });
  }
}

const prisma = createPrisma();

async function main() {
  console.log('Seeding database with multi-tenant structure...\n');

  // Clean existing data (reverse dependency order)
  // Phase 5+
  await prisma.recurringSchedule.deleteMany();
  // Phase 4
  await prisma.notification.deleteMany();
  await prisma.schemeApplication.deleteMany();
  await prisma.governmentScheme.deleteMany();
  await prisma.shareableView.deleteMany();
  // Phase 3
  await prisma.document.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.actionPlan.deleteMany();
  await prisma.rOICalculation.deleteMany();
  await prisma.savingsEntry.deleteMany();
  await prisma.savingsMeasure.deleteMany();
  // Phase 2
  await prisma.utilityBill.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.inspectionResponse.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.inspectionTemplateItem.deleteMany();
  await prisma.inspectionTemplate.deleteMany();
  await prisma.requirementStatus.deleteMany();
  await prisma.clientFramework.deleteMany();
  await prisma.frameworkRequirement.deleteMany();
  await prisma.complianceFramework.deleteMany();
  // Phase 1
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
  await prisma.clientAccess.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.client.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // ORGANIZATION — Akshaya Createch (consulting firm)
  // ============================================================
  const org = await prisma.organization.create({
    data: {
      name: 'Akshaya Createch',
      slug: 'akshaya-createch',
      website: 'https://akshayacreatech.vercel.app',
      plan: 'PRO',
    },
  });
  console.log('Organization created: Akshaya Createch');

  // ============================================================
  // CONSULTANT USERS
  // ============================================================
  const consultantHash = await bcrypt.hash('akshaya123', 10);
  const consultant = await prisma.user.create({
    data: { name: 'Aravind', email: 'aravind@akshayacreatech.com', passwordHash: consultantHash, role: 'USER' },
  });
  const lnk = await prisma.user.create({
    data: { name: 'Lakshminarasimhan K', email: 'lnk@akshayacreatech.com', passwordHash: consultantHash, role: 'USER' },
  });

  await prisma.membership.create({ data: { userId: consultant.id, organizationId: org.id, role: 'OWNER' } });
  await prisma.membership.create({ data: { userId: lnk.id, organizationId: org.id, role: 'ADMIN' } });
  console.log('Consultant users created: Aravind (Owner), LNK (Admin)');

  // ============================================================
  // CLIENT — Unnathi CNC Technologies
  // ============================================================
  const unnathiClient = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: 'Unnathi CNC Technologies Pvt Ltd',
      slug: 'unnathi-cnc',
      address: 'No. 487, D1 & D2, 13th Cross, 4th Phase, Peenya Industrial Area, Bangalore-560 058',
      industry: 'CNC Precision Machining',
      employeeCount: 16,
      accessMode: 'COLLABORATIVE',
      gridTariffRate: 7.5,
      solarTariffRate: 0,
      contractDemand: 100,
      powerFactorTarget: 0.95,
      baselineYear: 2024,
      baselineMonth: 7,
    },
  });
  console.log('Client created: Unnathi CNC Technologies');

  // Consultant access to client
  await prisma.clientAccess.create({ data: { userId: consultant.id, clientId: unnathiClient.id, role: 'CLIENT_ADMIN' } });
  await prisma.clientAccess.create({ data: { userId: lnk.id, clientId: unnathiClient.id, role: 'CLIENT_ADMIN' } });

  // ============================================================
  // CLIENT USERS — Real Unnathi CNC employees
  // ============================================================
  const hash = await bcrypt.hash('unnathi123', 10);

  const suresh = await prisma.user.create({ data: { employeeId: 'UCNC-001', name: 'Suresh Kumar S', email: 'sureshkumar@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Management' } });
  const sandeep = await prisma.user.create({ data: { employeeId: 'UCNC-002', name: 'Sandeep G. Parvatikar', email: 'sandeep@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Management' } });
  const murali = await prisma.user.create({ data: { employeeId: 'UCNC-003', name: 'Murali', email: 'murali@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Production' } });
  const rajaseKharkin = await prisma.user.create({ data: { employeeId: 'UCNC-004', name: 'Rajase Kharkin', email: 'rajase@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Marketing' } });
  const naveenDB = await prisma.user.create({ data: { employeeId: 'UCNC-005', name: 'Naveen DB', email: 'naveen@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Design' } });
  const nandanKumar = await prisma.user.create({ data: { employeeId: 'UCNC-006', name: 'Nandan Kumar', email: 'nandan@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Quality' } });
  const saadnasukh = await prisma.user.create({ data: { employeeId: 'UCNC-007', name: 'Saadnasukh M', email: 'saadnasukh@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Turning' } });
  const prashant = await prisma.user.create({ data: { employeeId: 'UCNC-008', name: 'Prashant UG PD', email: 'prashant@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Milling' } });
  const aral = await prisma.user.create({ data: { employeeId: 'UCNC-009', name: 'M. Aral', email: 'aral@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Development' } });
  const nadhiya = await prisma.user.create({ data: { employeeId: 'UCNC-010', name: 'Nadhiya S', email: 'nadhiya@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Sales' } });
  const vilas = await prisma.user.create({ data: { employeeId: 'UCNC-011', name: 'Vilas M.B', email: 'vilas@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Maintenance' } });
  const sumithra = await prisma.user.create({ data: { employeeId: 'UCNC-012', name: 'Sumithra', email: 'sumithra@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Polish' } });
  const anilThakur = await prisma.user.create({ data: { employeeId: 'UCNC-013', name: 'Anil Thakur', email: 'anil@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Pressing' } });
  const jyothiPrasad = await prisma.user.create({ data: { employeeId: 'UCNC-014', name: 'Jyothi Prasad P', email: 'jyothi@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Grinding' } });
  const niranjana = await prisma.user.create({ data: { employeeId: 'UCNC-015', name: 'Niranjana C', email: 'niranjana@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Milling' } });
  const raviKumar = await prisma.user.create({ data: { employeeId: 'UCNC-016', name: 'Ravi Kumar', email: 'ravikumar@unnathicnc.com', passwordHash: hash, role: 'USER', department: 'Wirecut' } });

  console.log('16 Unnathi CNC users created');

  // Client access
  for (const u of [suresh, sandeep]) {
    await prisma.clientAccess.create({ data: { userId: u.id, clientId: unnathiClient.id, role: 'CLIENT_ADMIN' } });
  }
  for (const u of [murali, rajaseKharkin, naveenDB, nandanKumar, saadnasukh, prashant, aral, nadhiya, vilas, sumithra, anilThakur, jyothiPrasad, niranjana, raviKumar]) {
    await prisma.clientAccess.create({ data: { userId: u.id, clientId: unnathiClient.id, role: 'EMPLOYEE' } });
  }

  // ============================================================
  // ENERGY SOURCES (client-scoped)
  // ============================================================
  const mainGrid = await prisma.energySource.create({
    data: { clientId: unnathiClient.id, name: 'Main Grid Supply (EB)', type: 'ELECTRICITY', unit: 'kWh', description: 'BESCOM electricity supply — CNC machines, lighting, HVAC, pumps, and ancillary equipment', location: 'Main Factory — Peenya Industrial Area', meterNumber: 'EB-MAIN-001', costPerUnit: 7.5 },
  });
  const solarPV = await prisma.energySource.create({
    data: { clientId: unnathiClient.id, name: 'Solar PV Installation', type: 'ELECTRICITY', unit: 'kWh', description: 'Rooftop solar panel installation — renewable energy source', location: 'Factory Rooftop', meterNumber: 'SOL-001', costPerUnit: 0 },
  });
  await prisma.energySource.create({
    data: { clientId: unnathiClient.id, name: 'Compressed Air System', type: 'COMPRESSED_AIR', unit: 'm³', description: 'Air compressor system', location: 'Compressor Room', meterNumber: 'CA-001' },
  });
  await prisma.energySource.create({
    data: { clientId: unnathiClient.id, name: 'Hydraulic System', type: 'OTHER', unit: 'kWh', description: 'Hydraulic power for clamps and CNC equipment', location: 'CNC Machine Shop', meterNumber: 'HYD-001' },
  });
  await prisma.energySource.create({
    data: { clientId: unnathiClient.id, name: 'HVAC System', type: 'ELECTRICITY', unit: 'kWh', description: 'Heating, ventilation and air conditioning', location: 'Factory & Office', meterNumber: 'HVAC-001' },
  });
  console.log('5 energy sources created');

  // ============================================================
  // TARGETS
  // ============================================================
  const targetData = [
    { energySourceId: solarPV.id, period: '2024-Q3', periodType: 'QUARTERLY', targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0, actualValue: 24706, isActive: false, notes: 'Jul-24 to Sep-24' },
    { energySourceId: solarPV.id, period: '2024-Q4', periodType: 'QUARTERLY', targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0, actualValue: 24137, isActive: false, notes: 'Oct-24 to Dec-24' },
    { energySourceId: solarPV.id, period: '2025-Q1', periodType: 'QUARTERLY', targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0, actualValue: 25205, isActive: false, notes: 'Jan-25 to Mar-25' },
    { energySourceId: solarPV.id, period: '2025-Q2', periodType: 'QUARTERLY', targetValue: 24000, unit: 'kWh', baselineValue: 24000, reductionPercent: 0, actualValue: 30718, isActive: false, notes: 'Apr-25 to Jun-25' },
    { energySourceId: solarPV.id, period: '2025-Q3', periodType: 'QUARTERLY', targetValue: 25200, unit: 'kWh', baselineValue: 24000, reductionPercent: -5, isActive: true, notes: '5% yearly increase target' },
    { energySourceId: mainGrid.id, period: '2024-Q3', periodType: 'QUARTERLY', targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0, actualValue: 46212, isActive: false, notes: 'Jul-24 to Sep-24' },
    { energySourceId: mainGrid.id, period: '2024-Q4', periodType: 'QUARTERLY', targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0, actualValue: 48342, isActive: false, notes: 'Oct-24 to Dec-24' },
    { energySourceId: mainGrid.id, period: '2025-Q1', periodType: 'QUARTERLY', targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0, actualValue: 54845, isActive: false, notes: 'Jan-25 to Mar-25' },
    { energySourceId: mainGrid.id, period: '2025-Q2', periodType: 'QUARTERLY', targetValue: 66000, unit: 'kWh', baselineValue: 66000, reductionPercent: 0, actualValue: 55030, isActive: false, notes: 'Apr-25 to Jun-25' },
    { energySourceId: mainGrid.id, period: '2025-Q3', periodType: 'QUARTERLY', targetValue: 59400, unit: 'kWh', baselineValue: 66000, reductionPercent: 10, isActive: true, notes: '10% yearly reduction target' },
  ];
  for (const t of targetData) { await prisma.energyTarget.create({ data: t }); }
  console.log('Targets created');

  // ============================================================
  // CONSUMPTION ENTRIES (client-scoped with cost)
  // ============================================================
  const consumptionData: any[] = [];

  const solarMonthly = [
    { date: '2024-07-31', value: 9136 }, { date: '2024-08-31', value: 7498 },
    { date: '2024-09-30', value: 8572 }, { date: '2024-10-31', value: 9110 },
    { date: '2024-11-30', value: 8060 }, { date: '2024-12-31', value: 6967 },
    { date: '2025-01-31', value: 7456 }, { date: '2025-02-28', value: 8815 },
    { date: '2025-03-31', value: 8934 }, { date: '2025-04-30', value: 10866 },
    { date: '2025-05-31', value: 10301 }, { date: '2025-06-30', value: 9551 },
    { date: '2025-07-31', value: 8732 }, { date: '2025-08-31', value: 7180 },
    { date: '2025-09-30', value: 9015 }, { date: '2025-10-31', value: 9540 },
    { date: '2025-11-30', value: 8250 }, { date: '2025-12-31', value: 7350 },
    { date: '2026-01-31', value: 7810 }, { date: '2026-02-28', value: 8920 },
  ];

  for (const entry of solarMonthly) {
    const target = 8000;
    const deviation = ((entry.value - target) / target) * 100;
    const hasDeviation = entry.value < target;
    consumptionData.push({
      clientId: unnathiClient.id, energySourceId: solarPV.id, recordedById: sandeep.id,
      date: new Date(entry.date), value: entry.value, unit: 'kWh', cost: 0,
      hasDeviation,
      deviationPercent: hasDeviation ? Math.round(deviation * 10) / 10 : null,
      deviationSeverity: hasDeviation ? (Math.abs(deviation) > 10 ? 'CRITICAL' : 'WARNING') : null,
      deviationNote: hasDeviation ? `Solar ${Math.abs(Math.round(deviation * 10) / 10)}% below target` : null,
    });
  }

  const gridMonthly = [
    { date: '2024-07-31', value: 13683 }, { date: '2024-08-31', value: 16360 },
    { date: '2024-09-30', value: 16169 }, { date: '2024-10-31', value: 14929 },
    { date: '2024-11-30', value: 15999 }, { date: '2024-12-31', value: 17414 },
    { date: '2025-01-31', value: 20645 }, { date: '2025-02-28', value: 17100 },
    { date: '2025-03-31', value: 17683 }, { date: '2025-04-30', value: 19061 },
    { date: '2025-05-31', value: 19783 }, { date: '2025-06-30', value: 16186 },
    { date: '2025-07-31', value: 15200 }, { date: '2025-08-31', value: 15800 },
    { date: '2025-09-30', value: 14900 }, { date: '2025-10-31', value: 15500 },
    { date: '2025-11-30', value: 14600 }, { date: '2025-12-31', value: 15100 },
    { date: '2026-01-31', value: 14800 }, { date: '2026-02-28', value: 14200 },
  ];

  for (const entry of gridMonthly) {
    consumptionData.push({
      clientId: unnathiClient.id, energySourceId: mainGrid.id, recordedById: sandeep.id,
      date: new Date(entry.date), value: entry.value, unit: 'kWh', cost: entry.value * 7.5,
      hasDeviation: false, deviationPercent: null, deviationSeverity: null, deviationNote: null,
    });
  }

  // Daily entries Jan-2026
  const operators = [vilas.id, saadnasukh.id, prashant.id, murali.id];
  for (let day = 1; day <= 31; day++) {
    const date = new Date(`2026-01-${day.toString().padStart(2, '0')}`);
    if (date.getDay() === 0) continue;
    const value = Math.round((620 + (Math.random() - 0.5) * 120) * 10) / 10;
    const dailyTarget = 22000 / 26;
    const deviation = ((value - dailyTarget) / dailyTarget) * 100;
    const hasDeviation = Math.abs(deviation) > 10;
    consumptionData.push({
      clientId: unnathiClient.id, energySourceId: mainGrid.id, recordedById: operators[day % operators.length],
      date, value, unit: 'kWh', cost: value * 7.5,
      shift: ['MORNING', 'AFTERNOON', 'NIGHT'][day % 3],
      hasDeviation,
      deviationPercent: hasDeviation ? Math.round(deviation * 10) / 10 : null,
      deviationSeverity: hasDeviation ? (Math.abs(deviation) > 20 ? 'CRITICAL' : 'WARNING') : null,
      deviationNote: hasDeviation ? `${Math.abs(Math.round(deviation * 10) / 10)}% deviation from daily target` : null,
    });
  }

  for (const entry of consumptionData) { await prisma.consumptionEntry.create({ data: entry }); }
  console.log(`${consumptionData.length} consumption entries created`);

  // ============================================================
  // TRAINING (client-scoped)
  // ============================================================
  const training1 = await prisma.trainingProgram.create({
    data: {
      clientId: unnathiClient.id, title: 'Energy Management — Awareness & Best Practices',
      description: 'Purpose, Scope, Energy Sources, Targets, Action Plan, Monitoring, Continual Improvement',
      type: 'AWARENESS', trainer: 'Suresh Kumar S', scheduledDate: new Date('2025-03-08'),
      duration: 4, location: 'Unnathi CNC Technologies Pvt Ltd, Peenya', maxParticipants: 20,
      status: 'COMPLETED', completionDate: new Date('2025-03-08'),
      notes: 'All 14 attendees rated Satisfactory.',
    },
  });

  await prisma.trainingAttendance.createMany({
    data: [rajaseKharkin, naveenDB, nandanKumar, saadnasukh, prashant, aral, murali, nadhiya, vilas, sumithra, anilThakur, jyothiPrasad, niranjana, raviKumar].map((u, i) => ({
      trainingProgramId: training1.id, userId: u.id, attended: true,
      score: 77 + (i % 12), feedback: 'Satisfactory', certificateIssued: true,
    })),
  });

  await prisma.trainingProgram.create({
    data: {
      clientId: unnathiClient.id, title: 'Energy Management for ZED Certification — Practical Workshop',
      type: 'SKILL_BUILDING', trainer: 'Akshaya Createch', scheduledDate: new Date('2026-03-01'),
      duration: 6, location: 'Unnathi CNC Technologies', maxParticipants: 20, status: 'SCHEDULED',
    },
  });
  await prisma.trainingProgram.create({
    data: {
      clientId: unnathiClient.id, title: 'Energy Monitoring System — User Training',
      type: 'SKILL_BUILDING', trainer: 'Akshaya Createch (Aravind)', scheduledDate: new Date('2026-04-01'),
      duration: 3, location: 'Unnathi CNC Technologies', maxParticipants: 16, status: 'SCHEDULED',
    },
  });
  console.log('Training programs created');

  // ============================================================
  // AUDITS (client-scoped)
  // ============================================================
  const audit1 = await prisma.audit.create({
    data: {
      clientId: unnathiClient.id, title: 'Energy Management Audit — April 2025', type: 'INTERNAL',
      auditDate: new Date('2025-04-16'), leadAuditorId: nadhiya.id,
      scope: 'Comprehensive energy management audit.', status: 'COMPLETED',
      summary: '2 Opportunities for Improvement identified.', completedDate: new Date('2025-04-16'),
      nextAuditDate: new Date('2025-07-16'),
    },
  });
  const audit2 = await prisma.audit.create({
    data: {
      clientId: unnathiClient.id, title: 'Q3 2025 Internal Energy Audit', type: 'INTERNAL',
      auditDate: new Date('2025-07-16'), leadAuditorId: nadhiya.id,
      scope: 'Follow-up on April 2025 findings.', status: 'COMPLETED',
      summary: 'Motion sensor OI still open.', completedDate: new Date('2025-07-18'),
      nextAuditDate: new Date('2026-01-16'),
    },
  });
  await prisma.audit.create({
    data: {
      clientId: unnathiClient.id, title: 'Q1 2026 Internal Energy Audit', type: 'INTERNAL',
      auditDate: new Date('2026-03-15'), leadAuditorId: nadhiya.id,
      scope: 'Periodic energy audit.', status: 'PLANNED', nextAuditDate: new Date('2026-06-15'),
    },
  });

  await prisma.auditFinding.create({ data: { auditId: audit1.id, findingNumber: 1, category: 'OPPORTUNITY', area: 'Lighting Systems', description: 'Motion sensors/timers NOT installed.', recommendation: 'Install in low-traffic areas.', status: 'OPEN', dueDate: new Date('2026-03-31') } });
  const finding2 = await prisma.auditFinding.create({ data: { auditId: audit1.id, findingNumber: 2, category: 'OPPORTUNITY', area: 'HVAC Systems', description: 'Thermostat NOT at energy-efficient range.', recommendation: 'Set to 24-26°C per BEE.', status: 'IN_PROGRESS', dueDate: new Date('2026-02-28') } });
  await prisma.auditFinding.create({ data: { auditId: audit1.id, findingNumber: 3, category: 'OBSERVATION', area: 'Energy Data Monitoring', description: 'Manual monitoring only. No digital system.', recommendation: 'Implement digital energy management.', status: 'OPEN', dueDate: new Date('2026-06-30') } });
  await prisma.auditFinding.create({ data: { auditId: audit2.id, findingNumber: 1, category: 'OBSERVATION', area: 'Follow-up', description: 'Motion sensor still pending. Thermostat partial.', recommendation: 'Expedite implementation.', status: 'OPEN', dueDate: new Date('2026-01-31') } });
  console.log('Audits and findings created');

  // ============================================================
  // CAPAs (client-scoped)
  // ============================================================
  const capa1 = await prisma.cAPA.create({
    data: {
      clientId: unnathiClient.id, capaNumber: 'CAPA-EN-001', type: 'PREVENTIVE', source: 'DEVIATION',
      title: 'Solar Power Production Shortfall Analysis', description: 'Solar fell below 8,000 kWh target in 3/12 months.',
      raisedById: sandeep.id, assignedToId: sandeep.id, priority: 'LOW', status: 'CLOSED',
      rcaMethod: 'FIVE_WHY', rootCause: 'External weather conditions.',
      correctiveAction: 'No action required.', preventiveAction: 'Continue monitoring.',
      actionDueDate: new Date('2025-07-01'), actionCompletedDate: new Date('2025-06-30'),
      verificationDate: new Date('2025-06-30'), verificationResult: 'Q2 2025 all above target. Closed.',
      verifiedBy: 'Suresh Kumar S',
    },
  });
  const capa2 = await prisma.cAPA.create({
    data: {
      clientId: unnathiClient.id, capaNumber: 'CAPA-EN-002', type: 'CORRECTIVE', source: 'DEVIATION',
      title: 'Grid Consumption Spike — Jan 2025', description: 'Jan-25 grid 20,645 kWh — highest in 12 months.',
      raisedById: sandeep.id, assignedToId: murali.id, priority: 'MEDIUM', status: 'CLOSED',
      rcaMethod: 'FIVE_WHY', rootCause: 'Solar shortfall + constant production.',
      correctiveAction: 'Spike explainable.', preventiveAction: 'Schedule intensive ops during peak solar.',
      actionDueDate: new Date('2025-04-01'), actionCompletedDate: new Date('2025-03-28'),
      verificationDate: new Date('2025-06-30'), verificationResult: 'No anomalous spikes. Closed.',
      verifiedBy: 'Suresh Kumar S',
    },
  });
  const capa3 = await prisma.cAPA.create({
    data: {
      clientId: unnathiClient.id, capaNumber: 'CAPA-EN-003', type: 'CORRECTIVE', source: 'AUDIT_FINDING',
      title: 'HVAC Thermostat Optimization', description: 'HVAC thermostats not at energy-efficient ranges.',
      raisedById: nadhiya.id, assignedToId: vilas.id, priority: 'MEDIUM', status: 'IN_IMPLEMENTATION',
      rcaMethod: 'FIVE_WHY', rootCause: 'No HVAC temperature guidelines.',
      correctiveAction: 'Set thermostats to 24°C.', preventiveAction: 'Add HVAC guidelines to plan.',
      actionDueDate: new Date('2026-02-28'),
    },
  });

  await prisma.auditFinding.update({ where: { id: finding2.id }, data: { capaId: capa3.id } });

  await prisma.cAPAComment.createMany({
    data: [
      { capaId: capa1.id, userId: sandeep.id, comment: 'CAPA raised for solar shortfall analysis.', createdAt: new Date('2025-07-01T10:00:00') },
      { capaId: capa1.id, userId: suresh.id, comment: 'Reviewed. Weather-related. Can be closed.', createdAt: new Date('2025-07-06T11:00:00') },
      { capaId: capa2.id, userId: sandeep.id, comment: 'Jan-25 highest in 12 months. Investigating.', createdAt: new Date('2025-02-05T09:00:00') },
      { capaId: capa2.id, userId: murali.id, comment: 'Normal production. Spike from solar shortfall.', createdAt: new Date('2025-02-15T14:00:00') },
      { capaId: capa3.id, userId: nadhiya.id, comment: 'CAPA raised from audit finding.', createdAt: new Date('2025-04-20T10:00:00') },
      { capaId: capa3.id, userId: vilas.id, comment: 'Office thermostats adjusted. Factory in progress.', createdAt: new Date('2025-05-15T14:00:00') },
    ],
  });
  console.log('CAPAs created');

  // ============================================================
  // APP SETTINGS (client-scoped)
  // ============================================================
  await prisma.appSetting.createMany({
    data: [
      { clientId: unnathiClient.id, key: 'company_name', value: 'Unnathi CNC Technologies Pvt Ltd' },
      { clientId: unnathiClient.id, key: 'company_address', value: 'No. 487, D1 & D2, 13th Cross, 4th Phase, Peenya Industrial Area, Bangalore-560 058' },
      { clientId: unnathiClient.id, key: 'company_certifications', value: 'AS9100D, ISO 9001:2015' },
      { clientId: unnathiClient.id, key: 'deviation_threshold_warning', value: '10' },
      { clientId: unnathiClient.id, key: 'deviation_threshold_critical', value: '20' },
      { clientId: unnathiClient.id, key: 'certification', value: 'ZED (Zero Defect Zero Effect)' },
      { clientId: unnathiClient.id, key: 'consultant', value: 'Akshaya Createch' },
      { clientId: unnathiClient.id, key: 'energy_policy_approved_by', value: 'Sandeep G. Parvatikar' },
      { clientId: unnathiClient.id, key: 'energy_policy_date', value: '2025-01-10' },
      { clientId: unnathiClient.id, key: 'solar_monthly_target', value: '8000' },
      { clientId: unnathiClient.id, key: 'grid_monthly_target', value: '22000' },
      { clientId: unnathiClient.id, key: 'consultant_fee_monthly', value: '25000' },
      { clientId: unnathiClient.id, key: 'consultant_engagement_start', value: '2025-01-01' },
    ],
  });

  // ============================================================
  // COMPLIANCE FRAMEWORKS (Phase 2A — Built-in templates)
  // ============================================================

  // --- ZED Bronze ---
  const zedFramework = await prisma.complianceFramework.create({
    data: {
      code: 'ZED_BRONZE', name: 'ZED Bronze Certification', version: '2.0', isBuiltIn: true,
      description: 'Zero Defect Zero Effect — Bronze level. QCI / Ministry of MSME certification for Indian MSMEs.',
    },
  });
  const zedReqs = await Promise.all([
    prisma.frameworkRequirement.create({ data: { frameworkId: zedFramework.id, code: 'ZED-E1', category: 'Energy Management', title: 'Identify all energy sources', description: 'Document all energy sources used in the facility including grid, solar, DG, compressed air.', evidenceGuidance: 'Energy source register with type, location, meter number.', evidenceModule: 'ENERGY_SOURCE', weight: 15, sortOrder: 1, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: zedFramework.id, code: 'ZED-E2', category: 'Energy Management', title: 'Set energy targets and track consumption', description: 'Establish quarterly energy targets per source and track actual consumption against targets.', evidenceGuidance: 'Target register + consumption log with deviation analysis.', evidenceModule: 'CONSUMPTION', weight: 20, sortOrder: 2, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: zedFramework.id, code: 'ZED-E3', category: 'Energy Management', title: 'Conduct energy awareness training', description: 'Train all employees on energy management practices and awareness.', evidenceGuidance: 'Training records with attendance and evaluation.', evidenceModule: 'TRAINING', weight: 15, sortOrder: 3 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: zedFramework.id, code: 'ZED-E4', category: 'Energy Management', title: 'Perform internal energy audits', description: 'Conduct periodic internal energy audits to identify improvement opportunities.', evidenceGuidance: 'Audit reports with findings and recommendations.', evidenceModule: 'AUDIT', weight: 25, sortOrder: 4, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: zedFramework.id, code: 'ZED-E5', category: 'Energy Management', title: 'Implement corrective and preventive actions', description: 'Address audit findings and deviations through structured CAPA process.', evidenceGuidance: 'CAPA records with root cause analysis and closure evidence.', evidenceModule: 'CAPA', weight: 25, sortOrder: 5, isCritical: true } }),
  ]);
  console.log('ZED Bronze framework: 5 requirements');

  // --- ISO 50001 ---
  const isoFramework = await prisma.complianceFramework.create({
    data: {
      code: 'ISO_50001', name: 'ISO 50001:2018 Energy Management System', version: '2018', isBuiltIn: true,
      description: 'International standard for Energy Management Systems. Plan-Do-Check-Act cycle.',
    },
  });
  await Promise.all([
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-4.1', category: 'Context', title: 'Understanding the organization and its context', description: 'Determine external and internal issues relevant to energy management.', weight: 5, sortOrder: 1 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-4.2', category: 'Context', title: 'Needs and expectations of interested parties', description: 'Identify interested parties and their requirements related to energy performance.', weight: 5, sortOrder: 2 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-5.1', category: 'Leadership', title: 'Leadership and commitment', description: 'Top management shall demonstrate leadership for the EnMS.', weight: 5, sortOrder: 3 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-5.2', category: 'Leadership', title: 'Energy policy', description: 'Establish and communicate an energy policy.', evidenceGuidance: 'Documented energy policy signed by top management.', weight: 10, sortOrder: 4, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-6.1', category: 'Planning', title: 'Energy review', description: 'Analyze energy use and consumption, identify significant energy uses (SEUs).', evidenceGuidance: 'Energy review document with SEU analysis.', evidenceModule: 'ENERGY_SOURCE', weight: 10, sortOrder: 5, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-6.2', category: 'Planning', title: 'Energy baseline and EnPIs', description: 'Establish energy baseline and energy performance indicators.', evidenceGuidance: 'Baseline data + EnPI definitions.', evidenceModule: 'CONSUMPTION', weight: 10, sortOrder: 6, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-6.3', category: 'Planning', title: 'Objectives and energy targets', description: 'Set measurable energy objectives and targets.', evidenceModule: 'CONSUMPTION', weight: 10, sortOrder: 7 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-7.2', category: 'Support', title: 'Competence and awareness', description: 'Ensure persons are competent and aware of energy management.', evidenceModule: 'TRAINING', weight: 10, sortOrder: 8 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-8.1', category: 'Operation', title: 'Operational planning and control', description: 'Plan and control processes related to significant energy uses.', weight: 5, sortOrder: 9 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-9.1', category: 'Performance Evaluation', title: 'Monitoring and measurement', description: 'Monitor, measure, analyze and evaluate energy performance.', evidenceModule: 'CONSUMPTION', weight: 10, sortOrder: 10, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-9.2', category: 'Performance Evaluation', title: 'Internal audit', description: 'Conduct internal audits at planned intervals.', evidenceModule: 'AUDIT', weight: 10, sortOrder: 11 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-10.1', category: 'Improvement', title: 'Nonconformity and corrective action', description: 'React to nonconformities, take corrective action.', evidenceModule: 'CAPA', weight: 5, sortOrder: 12 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: isoFramework.id, code: 'ISO-10.2', category: 'Improvement', title: 'Continual improvement', description: 'Continually improve energy performance and the EnMS.', weight: 5, sortOrder: 13 } }),
  ]);
  console.log('ISO 50001 framework: 13 requirements');

  // --- Electrical Safety ---
  const esFramework = await prisma.complianceFramework.create({
    data: {
      code: 'ELECTRICAL_SAFETY', name: 'Electrical Safety Compliance', version: '1.0', isBuiltIn: true,
      description: 'Indian Electricity Rules, IS/IEC standards, CEA Safety Regulations for industrial facilities.',
    },
  });
  await Promise.all([
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-1', category: 'Installation Safety', title: 'Earthing system compliance', description: 'Earth resistance <2 ohm as per IS 3043. Annual testing required.', evidenceGuidance: 'Earth resistance test report.', evidenceModule: 'INSPECTION', weight: 20, sortOrder: 1, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-2', category: 'Installation Safety', title: 'Protection devices installed and tested', description: 'ELCB/MCB/RCBO installed on all circuits. Periodic testing.', evidenceGuidance: 'Protection device inventory + test results.', evidenceModule: 'INSPECTION', weight: 15, sortOrder: 2, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-3', category: 'Installation Safety', title: 'Panel condition and thermography', description: 'Annual thermography of all electrical panels. No hotspots.', evidenceGuidance: 'Thermography report with images.', evidenceModule: 'INSPECTION', weight: 15, sortOrder: 3, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-4', category: 'Statutory Compliance', title: 'CEIG / statutory certifications current', description: 'All required certifications from CEIG, BIS, Fire Dept within validity.', evidenceGuidance: 'Certificate copies with validity dates.', weight: 15, sortOrder: 4, isCritical: true } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-5', category: 'Maintenance', title: 'Preventive maintenance schedule adherence', description: 'Transformer oil testing, panel maintenance, DG service on schedule.', evidenceGuidance: 'Maintenance log with completed dates.', weight: 10, sortOrder: 5 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-6', category: 'Training', title: 'Safety training for electrical workers', description: 'All electrical maintenance staff trained on safety procedures.', evidenceModule: 'TRAINING', weight: 10, sortOrder: 6 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-7', category: 'Incident Management', title: 'Incident tracking and reporting', description: 'All electrical incidents and near-misses logged and investigated.', evidenceGuidance: 'Incident register with RCA.', weight: 10, sortOrder: 7 } }),
    prisma.frameworkRequirement.create({ data: { frameworkId: esFramework.id, code: 'ES-8', category: 'Emergency Preparedness', title: 'Emergency response plan', description: 'Documented emergency response for electrical incidents. Fire extinguishers, first aid, evacuation plan.', weight: 5, sortOrder: 8 } }),
  ]);
  console.log('Electrical Safety framework: 8 requirements');

  // --- Assign frameworks to Unnathi CNC ---
  const cfZed = await prisma.clientFramework.create({
    data: { clientId: unnathiClient.id, frameworkId: zedFramework.id, status: 'ACTIVE', targetDate: new Date('2026-06-30'), score: 75 },
  });
  const cfIso = await prisma.clientFramework.create({
    data: { clientId: unnathiClient.id, frameworkId: isoFramework.id, status: 'ACTIVE', targetDate: new Date('2027-03-31'), score: 45 },
  });
  const cfEs = await prisma.clientFramework.create({
    data: { clientId: unnathiClient.id, frameworkId: esFramework.id, status: 'ACTIVE', targetDate: new Date('2026-09-30'), score: 60 },
  });

  // Seed requirement statuses for ZED
  for (const req of zedReqs) {
    const statuses: Record<string, string> = { 'ZED-E1': 'COMPLIANT', 'ZED-E2': 'COMPLIANT', 'ZED-E3': 'COMPLIANT', 'ZED-E4': 'COMPLIANT', 'ZED-E5': 'IN_PROGRESS' };
    const reqData = await prisma.frameworkRequirement.findUnique({ where: { id: req.id } });
    await prisma.requirementStatus.create({
      data: { clientFrameworkId: cfZed.id, requirementId: req.id, status: statuses[reqData!.code] || 'NOT_STARTED', updatedById: consultant.id },
    });
  }
  console.log('Framework assignments + ZED requirement statuses created');

  // ============================================================
  // INSPECTION TEMPLATES (Phase 2B — Built-in)
  // ============================================================

  const elecTemplate = await prisma.inspectionTemplate.create({
    data: { name: 'Electrical Safety Inspection', category: 'ELECTRICAL', isBuiltIn: true, description: 'Standard electrical safety inspection checklist for industrial facilities.' },
  });
  const elecItems = [
    { section: 'Earthing System', itemText: 'Earth resistance measured and within limits (<2 ohm)', isCritical: true, sortOrder: 1 },
    { section: 'Earthing System', itemText: 'Earth pit condition satisfactory', sortOrder: 2 },
    { section: 'Earthing System', itemText: 'Earth continuity verified on all equipment', sortOrder: 3 },
    { section: 'Protection Devices', itemText: 'All ELCB/MCB/RCBO functional and tested', isCritical: true, sortOrder: 4 },
    { section: 'Protection Devices', itemText: 'Trip settings appropriate for load', sortOrder: 5 },
    { section: 'Protection Devices', itemText: 'Surge protection devices installed', sortOrder: 6 },
    { section: 'Panel Condition', itemText: 'No visible damage or overheating signs', isCritical: true, sortOrder: 7 },
    { section: 'Panel Condition', itemText: 'Proper labeling on all panels and circuits', sortOrder: 8 },
    { section: 'Panel Condition', itemText: 'Panel doors closed and locked', sortOrder: 9 },
    { section: 'Panel Condition', itemText: 'Thermography completed (no hotspots)', isCritical: true, sortOrder: 10 },
    { section: 'Wiring & Cables', itemText: 'No exposed or damaged wiring', isCritical: true, sortOrder: 11 },
    { section: 'Wiring & Cables', itemText: 'Cable trays in good condition', sortOrder: 12 },
    { section: 'Emergency', itemText: 'Emergency stop buttons accessible and functional', sortOrder: 13 },
    { section: 'Emergency', itemText: 'Fire extinguishers available near panels', sortOrder: 14 },
    { section: 'Emergency', itemText: 'Evacuation route signs visible', sortOrder: 15 },
  ];
  for (const item of elecItems) {
    await prisma.inspectionTemplateItem.create({ data: { templateId: elecTemplate.id, ...item, type: 'PASS_FAIL', isCritical: item.isCritical || false } });
  }

  const fireTemplate = await prisma.inspectionTemplate.create({
    data: { name: 'Fire Safety Inspection', category: 'FIRE', isBuiltIn: true, description: 'Basic fire safety inspection for industrial facilities.' },
  });
  const fireItems = [
    { section: 'Fire Detection', itemText: 'Smoke detectors installed and functional', isCritical: true, sortOrder: 1 },
    { section: 'Fire Detection', itemText: 'Fire alarm system tested', sortOrder: 2 },
    { section: 'Fire Extinguishers', itemText: 'All fire extinguishers within validity', isCritical: true, sortOrder: 3 },
    { section: 'Fire Extinguishers', itemText: 'Extinguishers accessible (not blocked)', sortOrder: 4 },
    { section: 'Fire Extinguishers', itemText: 'Correct type for area (ABC, CO2, etc.)', sortOrder: 5 },
    { section: 'Evacuation', itemText: 'Emergency exit paths clear', isCritical: true, sortOrder: 6 },
    { section: 'Evacuation', itemText: 'Exit signs illuminated', sortOrder: 7 },
    { section: 'Evacuation', itemText: 'Assembly point identified and signposted', sortOrder: 8 },
    { section: 'General', itemText: 'Fire NOC current and displayed', isCritical: true, sortOrder: 9 },
    { section: 'General', itemText: 'No flammable materials stored near electrical panels', sortOrder: 10 },
  ];
  for (const item of fireItems) {
    await prisma.inspectionTemplateItem.create({ data: { templateId: fireTemplate.id, ...item, type: 'PASS_FAIL', isCritical: item.isCritical || false } });
  }
  // IS 3043 Earthing Compliance (detailed earthing per IS standard)
  const earthingTemplate = await prisma.inspectionTemplate.create({
    data: { name: 'IS 3043 Earthing Compliance', category: 'ELECTRICAL', isBuiltIn: true, description: 'Comprehensive earthing inspection per IS 3043 standard for industrial installations.' },
  });
  const earthingItems = [
    { section: 'Earth Electrodes', itemText: 'Earth electrode material compliant (GI/Copper per IS 3043)', isCritical: true, sortOrder: 1 },
    { section: 'Earth Electrodes', itemText: 'Minimum 2 earth electrodes per installation', sortOrder: 2 },
    { section: 'Earth Electrodes', itemText: 'Electrode depth as per soil resistivity report', isCritical: true, sortOrder: 3 },
    { section: 'Earth Electrodes', itemText: 'Earth pit accessible with proper cover plate', sortOrder: 4 },
    { section: 'Earth Electrodes', itemText: 'Charcoal/salt/coke backfill maintained', sortOrder: 5 },
    { section: 'Resistance Measurement', itemText: 'Earth resistance ≤ 2Ω (power systems)', isCritical: true, sortOrder: 6 },
    { section: 'Resistance Measurement', itemText: 'Earth resistance ≤ 1Ω (IT equipment)', sortOrder: 7 },
    { section: 'Resistance Measurement', itemText: 'Earth resistance ≤ 5Ω (lightning protection)', sortOrder: 8 },
    { section: 'Resistance Measurement', itemText: 'Measurement taken during dry season', sortOrder: 9 },
    { section: 'Conductors', itemText: 'Earth conductor size as per table in IS 3043', isCritical: true, sortOrder: 10 },
    { section: 'Conductors', itemText: 'No joints in earth conductor below ground', sortOrder: 11 },
    { section: 'Conductors', itemText: 'Green/yellow identification on earth wires', sortOrder: 12 },
    { section: 'Bonding', itemText: 'Equipment bonding conductor connected to main earth bar', isCritical: true, sortOrder: 13 },
    { section: 'Bonding', itemText: 'Metallic water/gas pipes bonded', sortOrder: 14 },
    { section: 'Bonding', itemText: 'Lightning protection system bonded to main earth', sortOrder: 15 },
    { section: 'Documentation', itemText: 'Earth resistance test report available', sortOrder: 16 },
    { section: 'Documentation', itemText: 'Earth layout diagram maintained', sortOrder: 17 },
    { section: 'Documentation', itemText: 'Periodic testing schedule documented', sortOrder: 18 },
  ];
  for (const item of earthingItems) {
    await prisma.inspectionTemplateItem.create({ data: { templateId: earthingTemplate.id, ...item, type: 'PASS_FAIL', isCritical: item.isCritical || false } });
  }

  // Panel & Transformer Inspection
  const panelTemplate = await prisma.inspectionTemplate.create({
    data: { name: 'Panel & Transformer Inspection', category: 'ELECTRICAL', isBuiltIn: true, description: 'Switchboard, panel board, and transformer condition check.' },
  });
  const panelItems = [
    { section: 'Main Panel', itemText: 'Incoming supply voltage within ±6% of nominal', isCritical: true, sortOrder: 1 },
    { section: 'Main Panel', itemText: 'Current balance across phases (< 10% imbalance)', isCritical: true, sortOrder: 2 },
    { section: 'Main Panel', itemText: 'Bus bar connections tight (torque checked)', sortOrder: 3 },
    { section: 'Main Panel', itemText: 'No overheating signs on bus bars or cables', isCritical: true, sortOrder: 4 },
    { section: 'Main Panel', itemText: 'CT/PT metering calibration current', sortOrder: 5 },
    { section: 'Breakers & Protection', itemText: 'ACB/MCCB trip testing done (quarterly)', isCritical: true, sortOrder: 6 },
    { section: 'Breakers & Protection', itemText: 'Relay coordination verified', sortOrder: 7 },
    { section: 'Breakers & Protection', itemText: 'Overcurrent protection settings documented', sortOrder: 8 },
    { section: 'Transformer', itemText: 'Oil level satisfactory (if oil-type)', sortOrder: 9 },
    { section: 'Transformer', itemText: 'Silica gel breather not saturated', sortOrder: 10 },
    { section: 'Transformer', itemText: 'Winding resistance ratio test completed', sortOrder: 11 },
    { section: 'Transformer', itemText: 'Oil BDV test ≥ 30kV (if oil-type)', isCritical: true, sortOrder: 12 },
    { section: 'Environment', itemText: 'Adequate ventilation around transformer', sortOrder: 13 },
    { section: 'Environment', itemText: 'No water ingress in panel room', isCritical: true, sortOrder: 14 },
  ];
  for (const item of panelItems) {
    await prisma.inspectionTemplateItem.create({ data: { templateId: panelTemplate.id, ...item, type: 'PASS_FAIL', isCritical: item.isCritical || false } });
  }

  // General Workplace Safety
  const workplaceTemplate = await prisma.inspectionTemplate.create({
    data: { name: 'Workplace Safety Walkthrough', category: 'GENERAL', isBuiltIn: true, description: 'General workplace safety walkthrough for factories and industrial units.' },
  });
  const workplaceItems = [
    { section: 'PPE', itemText: 'Workers wearing appropriate PPE', isCritical: true, sortOrder: 1 },
    { section: 'PPE', itemText: 'PPE in good condition (no damage)', sortOrder: 2 },
    { section: 'PPE', itemText: 'Safety shoes, helmets, goggles available', sortOrder: 3 },
    { section: 'Housekeeping', itemText: 'Aisles and walkways clear of obstructions', sortOrder: 4 },
    { section: 'Housekeeping', itemText: 'Spill kits available and stocked', sortOrder: 5 },
    { section: 'Housekeeping', itemText: 'Waste segregation followed (hazardous/non-hazardous)', sortOrder: 6 },
    { section: 'Machine Safety', itemText: 'Machine guards in place and functional', isCritical: true, sortOrder: 7 },
    { section: 'Machine Safety', itemText: 'Emergency stop buttons accessible', isCritical: true, sortOrder: 8 },
    { section: 'Machine Safety', itemText: 'Lockout/tagout (LOTO) procedures followed', isCritical: true, sortOrder: 9 },
    { section: 'Signage', itemText: 'Safety signs visible and legible', sortOrder: 10 },
    { section: 'Signage', itemText: 'Chemical hazard labels (GHS/MSDS)', sortOrder: 11 },
    { section: 'First Aid', itemText: 'First aid box available and stocked', sortOrder: 12 },
    { section: 'First Aid', itemText: 'Trained first aider on shift', sortOrder: 13 },
  ];
  for (const item of workplaceItems) {
    await prisma.inspectionTemplateItem.create({ data: { templateId: workplaceTemplate.id, ...item, type: 'PASS_FAIL', isCritical: item.isCritical || false } });
  }

  console.log('Inspection templates created: Electrical (15), Fire (10), IS 3043 Earthing (18), Panel/Transformer (14), Workplace Safety (13)');

  // --- Sample completed inspection ---
  const sampleInspection = await prisma.inspection.create({
    data: {
      clientId: unnathiClient.id, templateId: elecTemplate.id, inspectorId: consultant.id,
      inspectionDate: new Date('2025-12-15'), location: 'Main Factory Floor',
      status: 'COMPLETED', overallResult: 'PARTIAL', score: 80,
      overallNotes: '12 of 15 items passed. 3 items need attention: earth pit maintenance, panel labeling, cable tray condition.',
      completedDate: new Date('2025-12-15'),
    },
  });
  console.log('Sample inspection created');

  // ============================================================
  // CERTIFICATIONS (Phase 2B)
  // ============================================================
  await prisma.certification.createMany({
    data: [
      { clientId: unnathiClient.id, name: 'CEIG Electrical Safety Audit', category: 'ELECTRICAL', issuingBody: 'CEIG Karnataka', certificateNumber: 'CEIG/BLR/2025/1234', issueDate: new Date('2025-06-15'), expiryDate: new Date('2026-06-14'), renewalFrequency: 'ANNUAL', status: 'VALID', reminderDays: 60 },
      { clientId: unnathiClient.id, name: 'Fire NOC', category: 'FIRE', issuingBody: 'Karnataka Fire Department', certificateNumber: 'FIRE/PNY/2025/567', issueDate: new Date('2025-01-10'), expiryDate: new Date('2026-01-09'), renewalFrequency: 'ANNUAL', status: 'EXPIRED', reminderDays: 30 },
      { clientId: unnathiClient.id, name: 'Transformer Oil Test', category: 'EQUIPMENT', issuingBody: 'NABL Accredited Lab', certificateNumber: 'TOT/2025/890', issueDate: new Date('2025-09-01'), expiryDate: new Date('2026-09-01'), renewalFrequency: 'ANNUAL', status: 'VALID', reminderDays: 45 },
      { clientId: unnathiClient.id, name: 'Pressure Vessel BIS Certification', category: 'EQUIPMENT', issuingBody: 'BIS', certificateNumber: 'BIS/PV/2024/456', issueDate: new Date('2024-03-15'), expiryDate: new Date('2026-03-14'), renewalFrequency: 'BIENNIAL', status: 'EXPIRING_SOON', reminderDays: 30, equipmentName: 'Compressed Air Receiver Tank' },
      { clientId: unnathiClient.id, name: 'AS9100D Certification', category: 'OTHER', issuingBody: 'TUV SUD', certificateNumber: 'AS9100/2023/UC001', issueDate: new Date('2023-08-01'), expiryDate: new Date('2026-07-31'), renewalFrequency: 'TRIENNIAL', status: 'VALID', reminderDays: 90, notes: 'Aerospace quality management system' },
    ],
  });
  console.log('5 certifications created');

  // ============================================================
  // INCIDENTS (Phase 2B — sample data)
  // ============================================================
  await prisma.incident.create({
    data: {
      clientId: unnathiClient.id, type: 'ELECTRICAL', severity: 'NEAR_MISS',
      title: 'Sparking observed at CNC-5 panel during startup',
      description: 'Operator noticed sparking at the main disconnect switch of CNC machine #5 during morning startup. No injury. Machine was isolated immediately.',
      location: 'CNC Machine Shop — Bay 5', incidentDate: new Date('2025-11-20'),
      reportedById: vilas.id, immediateAction: 'Machine isolated, electrician called.',
      rootCause: 'Loose terminal connection at main disconnect switch.',
      correctiveAction: 'Terminal re-tightened and torque-verified. Thermography done on all panels.',
      status: 'CLOSED', closedDate: new Date('2025-11-22'), closedById: suresh.id,
    },
  });
  await prisma.incident.create({
    data: {
      clientId: unnathiClient.id, type: 'ELECTRICAL', severity: 'MINOR',
      title: 'ELCB tripping repeatedly on grinding section circuit',
      description: 'ELCB on grinding section circuit tripping 3-4 times per day for the past week. Production disrupted.',
      location: 'Grinding Section', incidentDate: new Date('2026-01-10'),
      reportedById: jyothiPrasad.id, immediateAction: 'Temporary bypass (not recommended). Electrician investigating.',
      rootCause: 'Insulation breakdown on grinding machine motor cable.',
      correctiveAction: 'Cable replaced. ELCB function verified.',
      preventiveAction: 'Added insulation resistance testing to quarterly maintenance schedule.',
      status: 'CLOSED', closedDate: new Date('2026-01-15'), closedById: suresh.id,
    },
  });
  console.log('2 incidents created');

  // ============================================================
  // UTILITY BILLS (Phase 2C — 12 months sample data)
  // ============================================================
  const utilityBillData = [
    { month: 7, year: 2024, unitsConsumed: 13683, demandKVA: 82, powerFactor: 0.89, energyCharges: 92661, demandCharges: 8200, pfPenalty: 4500, fuelSurcharge: 2737, electricityDuty: 4641, totalAmount: 112739 },
    { month: 8, year: 2024, unitsConsumed: 16360, demandKVA: 88, powerFactor: 0.88, energyCharges: 110835, demandCharges: 8800, pfPenalty: 6200, fuelSurcharge: 3272, electricityDuty: 5558, totalAmount: 134665 },
    { month: 9, year: 2024, unitsConsumed: 16169, demandKVA: 86, powerFactor: 0.91, energyCharges: 109545, demandCharges: 8600, pfPenalty: 0, fuelSurcharge: 3234, electricityDuty: 5497, totalAmount: 126876 },
    { month: 10, year: 2024, unitsConsumed: 14929, demandKVA: 84, powerFactor: 0.90, energyCharges: 101122, demandCharges: 8400, pfPenalty: 0, fuelSurcharge: 2986, electricityDuty: 5071, totalAmount: 117579 },
    { month: 11, year: 2024, unitsConsumed: 15999, demandKVA: 87, powerFactor: 0.87, energyCharges: 108393, demandCharges: 8700, pfPenalty: 5800, fuelSurcharge: 3200, electricityDuty: 5440, totalAmount: 131533 },
    { month: 12, year: 2024, unitsConsumed: 17414, demandKVA: 92, powerFactor: 0.86, energyCharges: 117995, demandCharges: 9200, pfPenalty: 7100, fuelSurcharge: 3483, electricityDuty: 5919, totalAmount: 143697 },
    { month: 1, year: 2025, unitsConsumed: 20645, demandKVA: 98, powerFactor: 0.85, energyCharges: 139868, demandCharges: 9800, pfPenalty: 8500, fuelSurcharge: 4129, electricityDuty: 7012, totalAmount: 169309 },
    { month: 2, year: 2025, unitsConsumed: 17100, demandKVA: 89, powerFactor: 0.88, energyCharges: 115875, demandCharges: 8900, pfPenalty: 5900, fuelSurcharge: 3420, electricityDuty: 5814, totalAmount: 139909 },
    { month: 3, year: 2025, unitsConsumed: 17683, demandKVA: 90, powerFactor: 0.89, energyCharges: 119822, demandCharges: 9000, pfPenalty: 4800, fuelSurcharge: 3537, electricityDuty: 6012, totalAmount: 143171 },
    { month: 4, year: 2025, unitsConsumed: 19061, demandKVA: 94, powerFactor: 0.87, energyCharges: 129163, demandCharges: 9400, pfPenalty: 6500, fuelSurcharge: 3812, electricityDuty: 6481, totalAmount: 155356 },
    { month: 5, year: 2025, unitsConsumed: 19783, demandKVA: 96, powerFactor: 0.86, energyCharges: 134030, demandCharges: 9600, pfPenalty: 7300, fuelSurcharge: 3957, electricityDuty: 6726, totalAmount: 161613 },
    { month: 6, year: 2025, unitsConsumed: 16186, demandKVA: 85, powerFactor: 0.92, energyCharges: 109660, demandCharges: 8500, pfPenalty: 0, fuelSurcharge: 3237, electricityDuty: 5503, totalAmount: 126900 },
    // Jul 2025 — Feb 2026 (showing improvement after APFC + VFD savings)
    { month: 7, year: 2025, unitsConsumed: 15200, demandKVA: 82, powerFactor: 0.94, energyCharges: 103000, demandCharges: 8200, pfPenalty: 0, fuelSurcharge: 3040, electricityDuty: 5168, totalAmount: 119408 },
    { month: 8, year: 2025, unitsConsumed: 15800, demandKVA: 84, powerFactor: 0.95, energyCharges: 107100, demandCharges: 8400, pfPenalty: 0, fuelSurcharge: 3160, electricityDuty: 5372, totalAmount: 124032 },
    { month: 9, year: 2025, unitsConsumed: 14900, demandKVA: 80, powerFactor: 0.96, energyCharges: 101000, demandCharges: 8000, pfPenalty: 0, fuelSurcharge: 2980, electricityDuty: 5066, totalAmount: 117046 },
    { month: 10, year: 2025, unitsConsumed: 15500, demandKVA: 83, powerFactor: 0.95, energyCharges: 105100, demandCharges: 8300, pfPenalty: 0, fuelSurcharge: 3100, electricityDuty: 5270, totalAmount: 121770 },
    { month: 11, year: 2025, unitsConsumed: 14600, demandKVA: 78, powerFactor: 0.96, energyCharges: 98900, demandCharges: 7800, pfPenalty: 0, fuelSurcharge: 2920, electricityDuty: 4964, totalAmount: 114584 },
    { month: 12, year: 2025, unitsConsumed: 15100, demandKVA: 81, powerFactor: 0.95, energyCharges: 102300, demandCharges: 8100, pfPenalty: 0, fuelSurcharge: 3020, electricityDuty: 5134, totalAmount: 118554 },
    { month: 1, year: 2026, unitsConsumed: 14800, demandKVA: 79, powerFactor: 0.97, energyCharges: 100300, demandCharges: 7900, pfPenalty: 0, fuelSurcharge: 2960, electricityDuty: 5032, totalAmount: 116192 },
    { month: 2, year: 2026, unitsConsumed: 14200, demandKVA: 76, powerFactor: 0.97, energyCharges: 96250, demandCharges: 7600, pfPenalty: 0, fuelSurcharge: 2840, electricityDuty: 4828, totalAmount: 111518 },
  ];
  for (const bill of utilityBillData) {
    const hasPfPenalty = (bill.pfPenalty || 0) > 0;
    const hasDemandOvershoot = bill.demandKVA > (unnathiClient.contractDemand || 100);
    const prevBill = utilityBillData.find(b => (b.month === bill.month - 1 && b.year === bill.year) || (bill.month === 1 && b.month === 12 && b.year === bill.year - 1));
    const hasAnomaly = prevBill ? Math.abs(bill.totalAmount - prevBill.totalAmount) / prevBill.totalAmount > 0.2 : false;

    await prisma.utilityBill.create({
      data: {
        clientId: unnathiClient.id, ...bill, provider: 'BESCOM', tariffCategory: 'LT_INDUSTRIAL',
        hasPfPenalty, hasDemandOvershoot, hasAnomaly,
        anomalyNote: hasAnomaly ? `${Math.round((bill.totalAmount / (prevBill?.totalAmount || bill.totalAmount) - 1) * 100)}% change from previous month` : null,
        enteredById: sandeep.id,
      },
    });
  }
  console.log('20 utility bills created (Jul 2024 — Feb 2026)');

  // ============================================================
  // SAVINGS MEASURES (Phase 3A)
  // ============================================================
  const vfdMeasure = await prisma.savingsMeasure.create({
    data: {
      clientId: unnathiClient.id, name: 'VFD on CNC Turning Center #2', description: 'Variable Frequency Drive installed on 15HP CNC turning center to reduce energy consumption during partial load operations.',
      category: 'VFD', energySourceId: mainGrid.id, investmentCost: 85000, implementationDate: new Date('2025-01-15'),
      status: 'VERIFIED', estimatedMonthlySavings: 8500, actualMonthlySavings: 9200,
      estimatedKwhSavings: 1133, actualKwhSavings: 1227,
      paybackMonths: 9.2, cumulativeSavings: 46000,
      notes: 'Savings exceeded estimates due to higher partial-load operation hours.',
      createdById: consultant.id,
    },
  });

  const ledMeasure = await prisma.savingsMeasure.create({
    data: {
      clientId: unnathiClient.id, name: 'LED Retrofit — Factory Floor', description: 'Replaced 40 fluorescent tubes (36W) with LED tubes (18W) across the factory floor and office area.',
      category: 'LED', investmentCost: 32000, implementationDate: new Date('2025-03-01'),
      status: 'VERIFIED', estimatedMonthlySavings: 2700, actualMonthlySavings: 2850,
      estimatedKwhSavings: 360, actualKwhSavings: 380,
      paybackMonths: 11.2, cumulativeSavings: 8550,
      createdById: consultant.id,
    },
  });

  const pfMeasure = await prisma.savingsMeasure.create({
    data: {
      clientId: unnathiClient.id, name: 'APFC Panel Installation', description: 'Automatic Power Factor Correction panel (50 kVAR) to maintain PF above 0.95 and avoid BESCOM penalties.',
      category: 'POWER_FACTOR', energySourceId: mainGrid.id, investmentCost: 145000, implementationDate: new Date('2025-06-01'),
      status: 'IMPLEMENTED', estimatedMonthlySavings: 6000, actualMonthlySavings: null,
      estimatedKwhSavings: 0, actualKwhSavings: null,
      notes: 'Estimated savings from avoiding PF penalties (avg ₹5,800/month) plus kVA demand reduction.',
      createdById: consultant.id,
    },
  });

  await prisma.savingsMeasure.create({
    data: {
      clientId: unnathiClient.id, name: 'Solar Rooftop 25 kW', description: 'Proposed rooftop solar installation. 25 kW capacity, estimated generation 100 units/day.',
      category: 'SOLAR', energySourceId: solarPV.id, investmentCost: 1250000, implementationDate: new Date('2025-09-01'),
      status: 'PLANNED', estimatedMonthlySavings: 22500, estimatedKwhSavings: 3000,
      notes: 'MNRE subsidy of 40% expected. Net investment ₹7.5L.',
      createdById: consultant.id,
    },
  });
  console.log('4 savings measures created');

  // Savings entries (monthly actual savings for VFD and LED)
  const vfdEntries = [
    { month: 2, year: 2025, savingsAmount: 8800, kwhSaved: 1173 },
    { month: 3, year: 2025, savingsAmount: 9100, kwhSaved: 1213 },
    { month: 4, year: 2025, savingsAmount: 9500, kwhSaved: 1267 },
    { month: 5, year: 2025, savingsAmount: 9400, kwhSaved: 1253 },
    { month: 6, year: 2025, savingsAmount: 9200, kwhSaved: 1227 },
    { month: 7, year: 2025, savingsAmount: 9300, kwhSaved: 1240 },
    { month: 8, year: 2025, savingsAmount: 9600, kwhSaved: 1280 },
    { month: 9, year: 2025, savingsAmount: 9700, kwhSaved: 1293 },
    { month: 10, year: 2025, savingsAmount: 9500, kwhSaved: 1267 },
    { month: 11, year: 2025, savingsAmount: 9800, kwhSaved: 1307 },
    { month: 12, year: 2025, savingsAmount: 9400, kwhSaved: 1253 },
    { month: 1, year: 2026, savingsAmount: 9900, kwhSaved: 1320 },
    { month: 2, year: 2026, savingsAmount: 10100, kwhSaved: 1347 },
  ];
  for (const entry of vfdEntries) {
    await prisma.savingsEntry.create({ data: { measureId: vfdMeasure.id, ...entry, method: 'CALCULATED' } });
  }

  const ledEntries = [
    { month: 4, year: 2025, savingsAmount: 2700, kwhSaved: 360 },
    { month: 5, year: 2025, savingsAmount: 2900, kwhSaved: 387 },
    { month: 6, year: 2025, savingsAmount: 2850, kwhSaved: 380 },
    { month: 7, year: 2025, savingsAmount: 2800, kwhSaved: 373 },
    { month: 8, year: 2025, savingsAmount: 2900, kwhSaved: 387 },
    { month: 9, year: 2025, savingsAmount: 2850, kwhSaved: 380 },
    { month: 10, year: 2025, savingsAmount: 2900, kwhSaved: 387 },
    { month: 11, year: 2025, savingsAmount: 2850, kwhSaved: 380 },
    { month: 12, year: 2025, savingsAmount: 2800, kwhSaved: 373 },
    { month: 1, year: 2026, savingsAmount: 2900, kwhSaved: 387 },
    { month: 2, year: 2026, savingsAmount: 2950, kwhSaved: 393 },
  ];
  for (const entry of ledEntries) {
    await prisma.savingsEntry.create({ data: { measureId: ledMeasure.id, ...entry, method: 'CALCULATED' } });
  }
  console.log('24 savings entries created');

  // ============================================================
  // ROI CALCULATIONS (Phase 3B)
  // ============================================================
  await prisma.rOICalculation.create({
    data: {
      clientId: unnathiClient.id, name: 'Solar Rooftop 25 kW Analysis', templateType: 'SOLAR',
      inputs: JSON.stringify({ systemSizeKW: 25, costPerKW: 50000, subsidyPercent: 40, tariffRate: 7.5, degradationRate: 0.5, dailyGenerationHrs: 4.5, lifetimeYears: 25 }),
      investmentCost: 1250000, subsidyAmount: 500000, netInvestment: 750000,
      monthlySavings: 22500, annualSavings: 270000, paybackMonths: 33,
      fiveYearSavings: 1350000, tenYearSavings: 2700000, lifetimeSavings: 6750000,
      irr: 28.5, npv: 2850000, co2ReductionKg: 27000,
      status: 'SHARED', createdById: consultant.id,
    },
  });

  await prisma.rOICalculation.create({
    data: {
      clientId: unnathiClient.id, name: 'Compressed Air Leak Repair', templateType: 'COMPRESSED_AIR',
      inputs: JSON.stringify({ compressorKW: 22, leakPercent: 25, targetLeakPercent: 5, operatingHrsPerMonth: 400, tariffRate: 7.5 }),
      investmentCost: 45000, subsidyAmount: 0, netInvestment: 45000,
      monthlySavings: 6600, annualSavings: 79200, paybackMonths: 6.8,
      fiveYearSavings: 396000, irr: 170, npv: 340000, co2ReductionKg: 8400,
      status: 'DRAFT', createdById: consultant.id,
    },
  });

  await prisma.rOICalculation.create({
    data: {
      clientId: unnathiClient.id, name: 'IE3 Motor Replacement (Grinding)', templateType: 'MOTOR',
      inputs: JSON.stringify({ motorHP: 10, oldEfficiency: 85, newEfficiency: 93.6, operatingHrsPerMonth: 350, tariffRate: 7.5, motorCost: 35000 }),
      investmentCost: 35000, subsidyAmount: 0, netInvestment: 35000,
      monthlySavings: 1680, annualSavings: 20160, paybackMonths: 20.8,
      fiveYearSavings: 100800, irr: 52, npv: 62000, co2ReductionKg: 2150,
      status: 'DRAFT', createdById: consultant.id,
    },
  });
  console.log('3 ROI calculations created');

  // ============================================================
  // ACTION PLANS (Phase 3C)
  // ============================================================
  const zedPlan = await prisma.actionPlan.create({
    data: {
      clientId: unnathiClient.id, title: 'ZED Bronze Certification Roadmap',
      description: 'Step-by-step action plan to achieve ZED Bronze certification by Q3 2025.',
      targetDate: new Date('2025-09-30'), status: 'ACTIVE', createdById: consultant.id,
    },
  });

  const actionItems = [
    { title: 'Complete energy source identification and documentation', status: 'DONE', priority: 'HIGH', dueDate: new Date('2025-02-15'), completedAt: new Date('2025-02-10'), assigneeId: sandeep.id, sortOrder: 1 },
    { title: 'Install energy sub-metering for CNC machines', status: 'DONE', priority: 'HIGH', dueDate: new Date('2025-03-01'), completedAt: new Date('2025-02-28'), assigneeId: vilas.id, sortOrder: 2 },
    { title: 'Set energy reduction targets for all sources', status: 'DONE', priority: 'MEDIUM', dueDate: new Date('2025-03-15'), completedAt: new Date('2025-03-12'), assigneeId: sandeep.id, sortOrder: 3 },
    { title: 'Conduct energy awareness training (batch 1)', status: 'DONE', priority: 'HIGH', dueDate: new Date('2025-04-01'), completedAt: new Date('2025-03-28'), assigneeId: suresh.id, sortOrder: 4 },
    { title: 'Install APFC panel for power factor correction', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2025-06-30'), assigneeId: vilas.id, sortOrder: 5 },
    { title: 'Conduct internal energy audit', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2025-07-15'), assigneeId: consultant.id, sortOrder: 6 },
    { title: 'Prepare energy policy document', status: 'PENDING', priority: 'MEDIUM', dueDate: new Date('2025-07-30'), assigneeId: sandeep.id, sortOrder: 7 },
    { title: 'Implement VFD on remaining CNC machines', status: 'PENDING', priority: 'MEDIUM', dueDate: new Date('2025-08-15'), assigneeId: vilas.id, sortOrder: 8 },
    { title: 'Schedule ZED assessment with MSME DI', status: 'PENDING', priority: 'CRITICAL', dueDate: new Date('2025-09-01'), assigneeId: suresh.id, sortOrder: 9 },
  ];
  for (const item of actionItems) {
    await prisma.actionItem.create({ data: { actionPlanId: zedPlan.id, ...item } });
  }

  const safetyPlan = await prisma.actionPlan.create({
    data: {
      clientId: unnathiClient.id, title: 'Electrical Safety Compliance Plan',
      description: 'Actions to address gaps identified in electrical safety audit.',
      targetDate: new Date('2025-08-31'), status: 'ACTIVE', createdById: lnk.id,
    },
  });

  const safetyItems = [
    { title: 'Replace damaged cable trays in grinding section', status: 'DONE', priority: 'CRITICAL', dueDate: new Date('2025-02-28'), completedAt: new Date('2025-02-25'), assigneeId: vilas.id, sortOrder: 1 },
    { title: 'Install earth leakage relay on all main circuits', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2025-06-30'), assigneeId: vilas.id, sortOrder: 2 },
    { title: 'Conduct insulation resistance testing (all motors)', status: 'PENDING', priority: 'HIGH', dueDate: new Date('2025-07-15'), assigneeId: vilas.id, sortOrder: 3 },
    { title: 'Update single-line diagram to reflect current configuration', status: 'PENDING', priority: 'MEDIUM', dueDate: new Date('2025-07-31'), assigneeId: sandeep.id, sortOrder: 4 },
  ];
  for (const item of safetyItems) {
    await prisma.actionItem.create({ data: { actionPlanId: safetyPlan.id, ...item } });
  }
  console.log('2 action plans with 13 items created');

  // ============================================================
  // DOCUMENTS (Phase 3C — sample entries, no actual files)
  // ============================================================
  await prisma.document.create({
    data: {
      clientId: unnathiClient.id, name: 'Energy Policy — Unnathi CNC', category: 'POLICY',
      fileUrl: '/documents/energy-policy-v1.pdf', fileSize: 245000, mimeType: 'application/pdf',
      description: 'Signed energy policy document covering energy management objectives and targets.',
      uploadedById: sandeep.id,
    },
  });
  await prisma.document.create({
    data: {
      clientId: unnathiClient.id, name: 'CEIG Electrical Safety Certificate', category: 'CERTIFICATE',
      fileUrl: '/documents/ceig-cert-2025.pdf', fileSize: 380000, mimeType: 'application/pdf',
      linkedToType: 'CERTIFICATION', description: 'Annual electrical safety audit certificate from CEIG Karnataka.',
      uploadedById: suresh.id,
    },
  });
  await prisma.document.create({
    data: {
      clientId: unnathiClient.id, name: 'Internal Energy Audit Report — Dec 2024', category: 'AUDIT_REPORT',
      fileUrl: '/documents/energy-audit-dec2024.pdf', fileSize: 520000, mimeType: 'application/pdf',
      linkedToType: 'AUDIT', description: 'Internal energy audit findings and recommendations.',
      uploadedById: consultant.id,
    },
  });
  await prisma.document.create({
    data: {
      clientId: unnathiClient.id, name: 'Training Attendance — Energy Awareness Batch 1', category: 'TRAINING_MATERIAL',
      fileUrl: '/documents/training-batch1-attendance.pdf', fileSize: 150000, mimeType: 'application/pdf',
      linkedToType: 'TRAINING', description: 'Signed attendance sheet for energy awareness training.',
      uploadedById: consultant.id,
    },
  });
  await prisma.document.create({
    data: {
      clientId: unnathiClient.id, name: 'VFD Installation Invoice', category: 'OTHER',
      fileUrl: '/documents/vfd-invoice.pdf', fileSize: 95000, mimeType: 'application/pdf',
      linkedToType: 'SAVINGS_MEASURE', description: 'Purchase invoice for VFD installation on CNC Turning Center #2.',
      uploadedById: sandeep.id,
    },
  });
  console.log('5 documents created');

  // ============================================================
  // GOVERNMENT SCHEMES (Phase 4C)
  // ============================================================
  const zedScheme = await prisma.governmentScheme.create({
    data: {
      name: 'ZED Certification Subsidy', shortName: 'ZED', ministry: 'Ministry of MSME',
      description: 'Financial assistance for MSMEs to adopt ZED (Zero Defect Zero Effect) certification. Covers consultancy and certification costs.',
      maxSubsidy: 500000, subsidyPercent: 80, category: 'CERTIFICATION',
      eligibility: 'Registered MSME with Udyam number',
      documentsNeeded: 'Udyam Registration,GST Certificate,PAN Card,Bank Account Details,ZED Assessment Report',
      applicationUrl: 'https://zed.msme.gov.in',
    },
  });
  await prisma.governmentScheme.create({
    data: {
      name: 'PM-KUSUM Solar Scheme', shortName: 'PM-KUSUM', ministry: 'Ministry of New & Renewable Energy',
      description: 'Subsidy for installation of solar pumps and grid-connected solar power plants for farmers and industries.',
      maxSubsidy: 2000000, subsidyPercent: 40, category: 'ENERGY',
      eligibility: 'Farmers, cooperatives, industrial establishments',
      documentsNeeded: 'Land ownership proof,Electricity bill,Aadhaar,Bank details,DPR',
      applicationUrl: 'https://pmkusum.mnre.gov.in',
    },
  });
  await prisma.governmentScheme.create({
    data: {
      name: 'BEE Star Rating for Industries', shortName: 'BEE', ministry: 'Bureau of Energy Efficiency',
      description: 'Recognition program for industries achieving high energy efficiency standards. Provides certification and marketing value.',
      maxSubsidy: null, category: 'ENERGY',
      eligibility: 'Manufacturing units with energy consumption > 500 TOE/year',
      documentsNeeded: 'Energy audit report,Consumption data,Production data,Utility bills',
    },
  });
  await prisma.governmentScheme.create({
    data: {
      name: 'CLCSS - Credit Linked Capital Subsidy', shortName: 'CLCSS', ministry: 'Ministry of MSME',
      description: 'Capital subsidy of 15% for technology upgradation in MSME units. Covers energy-efficient equipment.',
      maxSubsidy: 1500000, subsidyPercent: 15, category: 'EQUIPMENT',
      eligibility: 'Micro and small enterprises',
      documentsNeeded: 'Udyam Registration,Project report,Quotations,Bank loan sanction letter',
    },
  });
  await prisma.governmentScheme.create({
    data: {
      name: 'Karnataka Industrial Policy Incentives', shortName: 'KIP', ministry: 'Karnataka DPIIT',
      description: 'State-level incentives for industries investing in energy efficiency, renewable energy, and technology upgradation.',
      maxSubsidy: 1000000, subsidyPercent: 25, category: 'GENERAL',
      eligibility: 'Industries registered in Karnataka',
      documentsNeeded: 'Factory registration,Investment proof,Employment details,State GST registration',
    },
  });

  // Create a sample scheme application for Unnathi
  await prisma.schemeApplication.create({
    data: {
      clientId: unnathiClient.id, schemeId: zedScheme.id, appliedById: consultant.id,
      status: 'APPLIED', amountApplied: 400000, applicationRef: 'ZED/KA/2025/0234',
      notes: 'Applied for ZED Bronze level subsidy. Documents submitted to DIC office.',
    },
  });
  console.log('5 government schemes + 1 application created');

  // ============================================================
  // RECURRING SCHEDULES (Phase 5+)
  // ============================================================
  await prisma.recurringSchedule.create({
    data: {
      clientId: unnathiClient.id, title: 'Monthly Electrical Safety Inspection', category: 'INSPECTION',
      frequency: 'MONTHLY', dayOfMonth: 15, startDate: new Date('2025-01-15'), reminderDays: 7,
      assignedToId: vilas.id, createdById: consultant.id, description: 'Panel room and factory floor electrical safety check using standard template.',
    },
  });
  await prisma.recurringSchedule.create({
    data: {
      clientId: unnathiClient.id, title: 'Quarterly Earth Resistance Testing', category: 'INSPECTION',
      frequency: 'QUARTERLY', dayOfMonth: 1, startDate: new Date('2025-01-01'), reminderDays: 14,
      assignedToId: vilas.id, createdById: consultant.id, description: 'IS 3043 earth resistance measurement at all earth pits.',
    },
  });
  await prisma.recurringSchedule.create({
    data: {
      clientId: unnathiClient.id, title: 'Monthly Energy Data Entry Reminder', category: 'DATA_ENTRY',
      frequency: 'MONTHLY', dayOfMonth: 5, startDate: new Date('2025-01-05'), reminderDays: 3,
      assignedToId: sandeep.id, createdById: consultant.id, description: 'Enter monthly consumption readings and utility bill data.',
    },
  });
  await prisma.recurringSchedule.create({
    data: {
      clientId: unnathiClient.id, title: 'Annual Internal Energy Audit', category: 'AUDIT',
      frequency: 'ANNUAL', dayOfMonth: 15, monthOfYear: 3, startDate: new Date('2025-03-15'), reminderDays: 30,
      createdById: consultant.id, description: 'Comprehensive internal energy audit covering all energy sources and efficiency measures.',
    },
  });
  await prisma.recurringSchedule.create({
    data: {
      clientId: unnathiClient.id, title: 'Biannual Safety Training Refresher', category: 'TRAINING',
      frequency: 'BIANNUAL', dayOfMonth: 1, monthOfYear: 6, startDate: new Date('2025-06-01'), reminderDays: 14,
      createdById: consultant.id, description: 'Electrical safety and energy awareness refresher for all shop floor employees.',
    },
  });
  console.log('5 recurring schedules created');

  console.log('\n=== Seeding complete! ===\n');
  console.log('Consultant:  aravind@akshayacreatech.com / akshaya123');
  console.log('Client:      sureshkumar@unnathicnc.com / unnathi123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
