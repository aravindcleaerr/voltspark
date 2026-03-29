import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';

const localDb = new Database('./dev.db', { readonly: true });
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Tables in dependency order (parents before children)
const tables = [
  'Organization', 'User', 'Membership', 'Client', 'ClientAccess',
  'EnergySource', 'EnergyTarget', 'ConsumptionEntry',
  'TrainingProgram', 'TrainingAttendance',
  'Audit', 'AuditFinding',
  'CAPA', 'CAPAComment',
  'AuditLog', 'AppSetting',
  // Phase 2 tables
  'ComplianceFramework', 'FrameworkRequirement', 'ClientFramework', 'RequirementStatus',
  'InspectionTemplate', 'InspectionTemplateItem', 'Inspection', 'InspectionResponse',
  'Incident', 'Certification', 'UtilityBill',
  // Phase 3 tables
  'SavingsMeasure', 'SavingsEntry', 'ROICalculation',
  'ActionPlan', 'ActionItem', 'Document',
  // Phase 4 tables
  'Notification', 'GovernmentScheme', 'SchemeApplication', 'ShareableView',
  // Phase 5+ tables
  'RecurringSchedule',
  // Kitchen Intelligence tables
  'DiscomTemplate', 'Kitchen', 'KitchenZone', 'KitchenApiKey',
  'TitanReading', 'DemandEvent', 'MonthlyKitchenSummary',
  // IoT Metering tables
  'IoTGateway', 'IoTMeter', 'IoTApiKey',
  'MeterReading', 'MeterAlert', 'IoTMonthlySummary',
];

async function main() {
  console.log('Copying local SQLite data to Turso...\n');

  for (const table of tables) {
    const rows = localDb.prepare(`SELECT * FROM "${table}"`).all();
    if (rows.length === 0) {
      console.log(`  ${table}: 0 rows (skipped)`);
      continue;
    }

    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => '?').join(', ');
    const colNames = cols.map(c => `"${c}"`).join(', ');
    const insertSql = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`;

    let inserted = 0;
    for (const row of rows) {
      const values = cols.map(c => row[c]);
      try {
        await turso.execute({ sql: insertSql, args: values });
        inserted++;
      } catch (err) {
        console.error(`  ERROR in ${table}: ${err.message}`);
        console.error(`  Row:`, JSON.stringify(row).substring(0, 100));
      }
    }
    console.log(`  ${table}: ${inserted}/${rows.length} rows copied`);
  }

  console.log('\nDone! Data copied to Turso.');
  localDb.close();
}

main().catch(console.error);
