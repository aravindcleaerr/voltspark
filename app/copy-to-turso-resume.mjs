// Resume copy: idempotent INSERT OR IGNORE for the high-volume tables and Q-Apps.
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';

const localDb = new Database('./dev.db', { readonly: true });
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tables = ['MeterReading', 'ProductionRecord', 'ProcessExcursion', 'DefectEvent'];

async function main() {
  for (const table of tables) {
    const rows = localDb.prepare(`SELECT * FROM "${table}"`).all();
    if (rows.length === 0) { console.log(`  ${table}: 0 rows`); continue; }
    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => '?').join(', ');
    const colNames = cols.map(c => `"${c}"`).join(', ');
    const insertSql = `INSERT OR IGNORE INTO "${table}" (${colNames}) VALUES (${placeholders})`;

    const BATCH = 200;
    let inserted = 0;
    const t0 = Date.now();
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const stmts = slice.map(row => ({ sql: insertSql, args: cols.map(c => row[c]) }));
      try {
        await turso.batch(stmts, 'write');
        inserted += slice.length;
      } catch (err) {
        // Fallback row-by-row so a single bad row doesn't kill the batch
        for (const row of slice) {
          try { await turso.execute({ sql: insertSql, args: cols.map(c => row[c]) }); inserted++; } catch (_) { }
        }
      }
      if (i % (BATCH * 25) === 0 && i > 0) {
        const pct = Math.round(100 * (i + slice.length) / rows.length);
        const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
        process.stdout.write(`  ${table}: ${pct}% (${inserted}/${rows.length}, ${elapsed}s)\n`);
      }
    }
    const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`  ${table}: ${inserted}/${rows.length} done in ${elapsed}s`);
  }
  console.log('Done.');
  localDb.close();
}

main().catch(e => { console.error(e); process.exit(1); });
