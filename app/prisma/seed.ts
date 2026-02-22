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
    ],
  });

  console.log('\n=== Seeding complete! ===\n');
  console.log('Consultant:  aravind@akshayacreatech.com / akshaya123');
  console.log('Client:      sureshkumar@unnathicnc.com / unnathi123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
