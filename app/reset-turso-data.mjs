import { createClient } from '@libsql/client';
const c = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const r = await c.execute("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_libsql_%' AND name NOT LIKE 'libsql_%' ORDER BY name");
const tables = r.rows.map(row => row.name);
console.log(`Wiping ${tables.length} tables...`);
await c.execute('PRAGMA foreign_keys=OFF');
for (const t of tables) {
  try {
    await c.execute(`DELETE FROM "${t}"`);
    console.log(`  cleared: ${t}`);
  } catch (e) { console.error(`  FAIL: ${t}: ${e.message}`); }
}
await c.execute('PRAGMA foreign_keys=ON');
console.log('Done.');
