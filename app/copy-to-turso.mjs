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
  // IoT Metering tables (sensors before MeterAlert since alerts can reference them)
  'IoTGateway', 'IoTMeter', 'IoTSensor', 'IoTApiKey',
  'MeterReading', 'SensorReading', 'MeterAlert', 'IoTMonthlySummary',
  // Power Quality tables
  'PQEvent', 'PQSnapshot',
  // Compressed Air tables
  'Compressor', 'CAReading',
  // Lead Magnets
  'LeadMagnetSubmission',
  // Q-Apps tables (Drivewave / Vitesco demo)
  'ProductionRecord', 'ProcessExcursion', 'DefectEvent',
  // Asset Context Profile (Intelligence Bundle keystone) — templates first
  'AssetTemplate', 'AssetContextProfile', 'ContextReview',
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

    // Batch-insert in groups so high-volume tables (MeterReading, DefectEvent, etc.)
    // don't eat hours of network round-trips. libSQL accepts up to a few hundred
    // statements per batch; 200 is safe and keeps the per-batch payload small.
    const BATCH = 200;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const stmts = slice.map(row => ({ sql: insertSql, args: cols.map(c => row[c]) }));
      try {
        await turso.batch(stmts, 'write');
        inserted += slice.length;
      } catch (err) {
        console.error(`  ERROR in ${table} batch starting at ${i}: ${err.message}`);
        // Fall back to row-by-row for this batch so we know which row failed
        for (const row of slice) {
          try {
            await turso.execute({ sql: insertSql, args: cols.map(c => row[c]) });
            inserted++;
          } catch (rowErr) {
            console.error(`    Row failed: ${rowErr.message}; first 100 chars: ${JSON.stringify(row).substring(0, 100)}`);
          }
        }
      }
    }
    console.log(`  ${table}: ${inserted}/${rows.length} rows copied`);
  }

  console.log('\nDone! Data copied to Turso.');
  localDb.close();
}

main().catch(console.error);
