import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

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

  // Users
  const suresh = await prisma.user.create({
    data: { employeeId: 'UCNC-001', name: 'Suresh Kumar', email: 'sureshkumar@unnathicnc.com', passwordHash: hash, role: 'ADMIN', department: 'Management' },
  });
  const sandeep = await prisma.user.create({
    data: { employeeId: 'UCNC-002', name: 'Sandeep Reddy', email: 'sandeep@unnathicnc.com', passwordHash: hash, role: 'MANAGER', department: 'Production' },
  });
  const rajesh = await prisma.user.create({
    data: { employeeId: 'UCNC-003', name: 'Rajesh Kumar', email: 'rajesh@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'CNC Operations' },
  });
  const venkatesh = await prisma.user.create({
    data: { employeeId: 'UCNC-004', name: 'Venkatesh S', email: 'venkatesh@unnathicnc.com', passwordHash: hash, role: 'EMPLOYEE', department: 'Maintenance' },
  });
  const ramesh = await prisma.user.create({
    data: { employeeId: 'UCNC-005', name: 'Ramesh Babu', email: 'ramesh@unnathicnc.com', passwordHash: hash, role: 'MANAGER', department: 'Quality' },
  });

  console.log('Users created');

  // Energy Sources
  const mainGrid = await prisma.energySource.create({
    data: { name: 'Main Grid Supply', type: 'ELECTRICITY', unit: 'kWh', description: 'BESCOM electricity supply - main transformer', location: 'Main Factory', meterNumber: 'EB-001' },
  });
  const dgSet = await prisma.energySource.create({
    data: { name: 'DG Set', type: 'ELECTRICITY', unit: 'kWh', description: '125 KVA Diesel Generator for backup', location: 'Generator Room', meterNumber: 'DG-001' },
  });
  const diesel = await prisma.energySource.create({
    data: { name: 'Diesel (DG Fuel)', type: 'FUEL', unit: 'Liters', description: 'Diesel for generator set', location: 'Fuel Storage', meterNumber: 'FL-001' },
  });
  const compressedAir = await prisma.energySource.create({
    data: { name: 'Compressed Air System', type: 'COMPRESSED_AIR', unit: 'm³', description: 'Atlas Copco compressor for CNC machines', location: 'Compressor Room', meterNumber: 'CA-001' },
  });
  const lpg = await prisma.energySource.create({
    data: { name: 'LPG (Canteen)', type: 'GAS', unit: 'kg', description: 'LPG cylinders for factory canteen', location: 'Canteen', meterNumber: 'LP-001' },
  });
  const coolantPump = await prisma.energySource.create({
    data: { name: 'Coolant Pump System', type: 'ELECTRICITY', unit: 'kWh', description: 'Coolant circulation pumps for CNC machines', location: 'CNC Machine Shop', meterNumber: 'CP-001' },
  });

  console.log('Energy sources created');

  // Targets - Q1 2026
  await prisma.energyTarget.create({
    data: { energySourceId: mainGrid.id, period: '2026-Q1', periodType: 'QUARTERLY', targetValue: 45000, unit: 'kWh', baselineValue: 48000, reductionPercent: 6.25, actualValue: 32000, isActive: true },
  });
  await prisma.energyTarget.create({
    data: { energySourceId: dgSet.id, period: '2026-Q1', periodType: 'QUARTERLY', targetValue: 3000, unit: 'kWh', baselineValue: 3500, reductionPercent: 14.3, actualValue: 1800, isActive: true },
  });
  await prisma.energyTarget.create({
    data: { energySourceId: diesel.id, period: '2026-Q1', periodType: 'QUARTERLY', targetValue: 500, unit: 'Liters', baselineValue: 600, reductionPercent: 16.7, actualValue: 280, isActive: true },
  });
  await prisma.energyTarget.create({
    data: { energySourceId: compressedAir.id, period: '2026-Q1', periodType: 'QUARTERLY', targetValue: 9000, unit: 'm³', baselineValue: 10000, reductionPercent: 10, actualValue: 5500, isActive: true },
  });
  await prisma.energyTarget.create({
    data: { energySourceId: lpg.id, period: '2026-Q1', periodType: 'QUARTERLY', targetValue: 90, unit: 'kg', baselineValue: 100, reductionPercent: 10, actualValue: 55, isActive: true },
  });
  await prisma.energyTarget.create({
    data: { energySourceId: coolantPump.id, period: '2026-Q1', periodType: 'QUARTERLY', targetValue: 4500, unit: 'kWh', baselineValue: 5000, reductionPercent: 10, actualValue: 2800, isActive: true },
  });

  console.log('Targets created');

  // Consumption Entries - 2 months of daily data for main grid
  const consumptionData: any[] = [];
  const startDate = new Date('2025-12-01');
  for (let day = 0; day < 60; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    if (date.getDay() === 0) continue; // Skip Sundays

    const baseValue = 500;
    let value = baseValue + (Math.random() - 0.5) * 80;
    let hasDeviation = false;
    let deviationPercent: number | null = null;
    let deviationSeverity: string | null = null;
    let deviationNote: string | null = null;

    // Intentional deviations on specific days
    if (day === 15) { value = 680; }
    if (day === 35) { value = 720; }
    if (day === 50) { value = 650; }

    const dailyTarget = 45000 / 90;
    const deviation = ((value - dailyTarget) / dailyTarget) * 100;
    if (Math.abs(deviation) > 10) {
      hasDeviation = true;
      deviationPercent = Math.round(deviation * 10) / 10;
      deviationSeverity = Math.abs(deviation) > 20 ? 'CRITICAL' : 'WARNING';
      deviationNote = `${deviationPercent}% deviation from target - ${deviationSeverity === 'CRITICAL' ? 'immediate action required' : 'review recommended'}`;
    }

    consumptionData.push({
      energySourceId: mainGrid.id,
      recordedById: [rajesh.id, sandeep.id, venkatesh.id][day % 3],
      date,
      value: Math.round(value * 10) / 10,
      unit: 'kWh',
      shift: ['MORNING', 'AFTERNOON', 'NIGHT'][day % 3],
      hasDeviation,
      deviationPercent,
      deviationSeverity,
      deviationNote,
    });
  }

  // Diesel entries (weekly)
  for (let week = 0; week < 8; week++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + week * 7);
    consumptionData.push({
      energySourceId: diesel.id,
      recordedById: venkatesh.id,
      date,
      value: Math.round((30 + Math.random() * 20) * 10) / 10,
      unit: 'Liters',
      hasDeviation: false,
    });
  }

  // Compressed air entries (every 2 days)
  for (let day = 0; day < 40; day += 2) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    consumptionData.push({
      energySourceId: compressedAir.id,
      recordedById: rajesh.id,
      date,
      value: Math.round((90 + Math.random() * 30) * 10) / 10,
      unit: 'm³',
      shift: 'MORNING',
      hasDeviation: false,
    });
  }

  for (const entry of consumptionData) {
    await prisma.consumptionEntry.create({ data: entry });
  }

  console.log(`${consumptionData.length} consumption entries created`);

  // Training Programs
  const training1 = await prisma.trainingProgram.create({
    data: {
      title: 'Energy Conservation Awareness Program',
      description: 'Introduction to energy management principles, ZED requirements, and daily energy-saving practices for shop floor employees.',
      type: 'AWARENESS',
      trainer: 'Akshaya Createch (Lakshminarasimhan K)',
      scheduledDate: new Date('2025-12-15'),
      duration: 3,
      location: 'Conference Room, Factory Floor',
      maxParticipants: 30,
      status: 'COMPLETED',
      completionDate: new Date('2025-12-15'),
      notes: 'Conducted by Akshaya Createch as part of ZED certification preparation',
    },
  });
  const training2 = await prisma.trainingProgram.create({
    data: {
      title: 'CNC Machine Energy Optimization',
      description: 'Hands-on training on optimizing CNC machine parameters for energy efficiency without compromising quality.',
      type: 'SKILL_BUILDING',
      trainer: 'Sandeep Reddy',
      scheduledDate: new Date('2026-02-10'),
      duration: 4,
      location: 'CNC Machine Shop',
      maxParticipants: 15,
      status: 'SCHEDULED',
    },
  });
  const training3 = await prisma.trainingProgram.create({
    data: {
      title: 'Energy Monitoring & Reporting Refresher',
      description: 'Refresher on using the energy management system for daily consumption recording and deviation analysis.',
      type: 'REFRESHER',
      trainer: 'Akshaya Createch (Aravind)',
      scheduledDate: new Date('2026-03-01'),
      duration: 2,
      location: 'Conference Room',
      maxParticipants: 20,
      status: 'SCHEDULED',
    },
  });

  // Attendance for completed training
  await prisma.trainingAttendance.createMany({
    data: [
      { trainingProgramId: training1.id, userId: suresh.id, attended: true, score: 92, feedback: 'Very informative' },
      { trainingProgramId: training1.id, userId: sandeep.id, attended: true, score: 88, feedback: 'Good practical examples' },
      { trainingProgramId: training1.id, userId: rajesh.id, attended: true, score: 85 },
      { trainingProgramId: training1.id, userId: venkatesh.id, attended: true, score: 78, feedback: 'Need more time on monitoring tools' },
      { trainingProgramId: training1.id, userId: ramesh.id, attended: false },
    ],
  });

  console.log('Training programs and attendance created');

  // Audits
  const audit1 = await prisma.audit.create({
    data: {
      title: 'Q4 2025 Internal Energy Audit',
      type: 'INTERNAL',
      auditDate: new Date('2025-12-20'),
      leadAuditorId: ramesh.id,
      scope: 'Review of all energy sources, consumption patterns, deviation analysis, and corrective actions taken. Verify compliance with ZED energy management requirements.',
      status: 'COMPLETED',
      summary: 'Audit revealed 3 findings. Main concern is compressed air system leakage. Overall energy management system is progressing well.',
      completedDate: new Date('2025-12-22'),
      nextAuditDate: new Date('2026-03-20'),
    },
  });

  await prisma.audit.create({
    data: {
      title: 'Q1 2026 Internal Energy Audit',
      type: 'INTERNAL',
      auditDate: new Date('2026-03-20'),
      leadAuditorId: ramesh.id,
      scope: 'Follow-up on Q4 findings, review Q1 consumption targets, verify training compliance.',
      status: 'PLANNED',
      nextAuditDate: new Date('2026-06-20'),
    },
  });

  // Findings for audit 1
  const finding1 = await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingNumber: 1,
      category: 'MINOR_NC',
      area: 'Compressor Room',
      description: 'Compressed air system has multiple leaks at joint connections. Estimated 15% air loss leading to excess energy consumption by the compressor.',
      evidence: 'Ultrasonic leak detection performed. 6 leak points identified.',
      recommendation: 'Repair all identified leak points. Implement monthly leak detection schedule.',
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-02-15'),
    },
  });

  await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingNumber: 2,
      category: 'OBSERVATION',
      area: 'CNC Machine Shop',
      description: 'CNC machines left running during lunch breaks. Standby power consumption estimated at 12 kWh/day.',
      recommendation: 'Implement shutdown procedure during extended breaks. Add reminder signage.',
      status: 'OPEN',
      dueDate: new Date('2026-02-28'),
    },
  });

  await prisma.auditFinding.create({
    data: {
      auditId: audit1.id,
      findingNumber: 3,
      category: 'OPPORTUNITY',
      area: 'Factory Lighting',
      description: 'Office and factory areas still using conventional tube lights. LED conversion would reduce lighting energy by ~40%.',
      recommendation: 'Plan phased LED replacement starting with high-usage areas.',
      status: 'OPEN',
      dueDate: new Date('2026-03-31'),
    },
  });

  console.log('Audits and findings created');

  // CAPAs
  const capa1 = await prisma.cAPA.create({
    data: {
      capaNumber: 'CAPA-001',
      type: 'CORRECTIVE',
      source: 'AUDIT_FINDING',
      sourceReference: 'Audit Finding #1 - Q4 2025',
      title: 'Compressed Air System Leak Repair',
      description: 'Multiple compressed air leaks identified during Q4 2025 internal audit. 6 leak points at joint connections causing estimated 15% air loss and excess compressor energy consumption.',
      raisedById: ramesh.id,
      assignedToId: venkatesh.id,
      priority: 'HIGH',
      status: 'IN_IMPLEMENTATION',
      rcaMethod: 'FIVE_WHY',
      rcaDetails: 'Why 1: Why is the compressor running excessively? - Because there are air leaks in the system.\nWhy 2: Why are there air leaks? - Because pipe joint connections have deteriorated.\nWhy 3: Why have the joints deteriorated? - Because they have not been inspected or maintained regularly.\nWhy 4: Why is there no regular inspection? - Because there was no preventive maintenance schedule for the compressed air system.\nWhy 5: Why was there no PM schedule? - Because compressed air was not included in the energy management scope until ZED certification.',
      rootCause: 'Lack of preventive maintenance schedule for compressed air system pipe joints, resulting in deteriorated connections and air leakage.',
      correctiveAction: 'Repair all 6 identified leak points using appropriate sealant and replacement joints. 4 of 6 completed.',
      preventiveAction: 'Implement monthly ultrasonic leak detection schedule. Add compressed air system to preventive maintenance plan.',
      actionDueDate: new Date('2026-02-15'),
    },
  });

  const capa2 = await prisma.cAPA.create({
    data: {
      capaNumber: 'CAPA-002',
      type: 'PREVENTIVE',
      source: 'DEVIATION',
      sourceReference: 'December 2025 consumption spike',
      title: 'Energy Consumption Spike Investigation',
      description: 'Multiple days in December 2025 showed >20% deviation from daily target for main grid consumption. Pattern suggests systematic issue rather than one-off occurrence.',
      raisedById: sandeep.id,
      assignedToId: sandeep.id,
      priority: 'MEDIUM',
      status: 'RCA_IN_PROGRESS',
      rcaMethod: 'FIVE_WHY',
      rcaDetails: 'Why 1: Why did consumption spike in December? - Investigation in progress.\nWhy 2: (Pending)\nWhy 3: (Pending)\nWhy 4: (Pending)\nWhy 5: (Pending)',
      actionDueDate: new Date('2026-02-28'),
    },
  });

  // CAPA Comments
  await prisma.cAPAComment.createMany({
    data: [
      { capaId: capa1.id, userId: ramesh.id, comment: 'CAPA raised based on internal audit finding #1. Assigning to Venkatesh for maintenance action.', createdAt: new Date('2025-12-22T10:00:00') },
      { capaId: capa1.id, userId: venkatesh.id, comment: 'Completed ultrasonic inspection. All 6 leak points mapped. Ordering replacement joints.', createdAt: new Date('2025-12-28T14:00:00') },
      { capaId: capa1.id, userId: venkatesh.id, comment: 'Replacement parts received. Started repair work. 2 of 6 joints replaced so far.', createdAt: new Date('2026-01-10T09:00:00') },
      { capaId: capa1.id, userId: venkatesh.id, comment: '4 of 6 leak points repaired. Remaining 2 require system shutdown - scheduled for next weekend.', createdAt: new Date('2026-01-25T16:00:00') },
      { capaId: capa1.id, userId: suresh.id, comment: 'Good progress. Please ensure completion before the February deadline.', createdAt: new Date('2026-01-26T11:00:00') },
      { capaId: capa2.id, userId: sandeep.id, comment: 'Starting investigation into December consumption spikes. Will analyze production logs vs energy data.', createdAt: new Date('2026-01-05T09:00:00') },
      { capaId: capa2.id, userId: sandeep.id, comment: 'Initial analysis suggests spikes correlate with overtime shifts. Need to verify with production schedule.', createdAt: new Date('2026-01-15T14:00:00') },
    ],
  });

  // Update finding with CAPA reference
  await prisma.auditFinding.update({
    where: { id: finding1.id },
    data: { capaId: capa1.id },
  });

  console.log('CAPAs and comments created');

  // App Settings
  await prisma.appSetting.createMany({
    data: [
      { key: 'company_name', value: 'Unnathi CNC Technologies Pvt Ltd' },
      { key: 'deviation_threshold_warning', value: '10' },
      { key: 'deviation_threshold_critical', value: '20' },
      { key: 'certification', value: 'ZED (Zero Defect Zero Effect)' },
      { key: 'consultant', value: 'Akshaya Createch' },
    ],
  });

  console.log('App settings created');
  console.log('Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
