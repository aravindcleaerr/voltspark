import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // List all user tables (filter out sqlite internals)
  const r = await client.execute("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_libsql_%' AND name NOT LIKE 'libsql_%' ORDER BY name");
  const tables = r.rows.map(row => row.name);
  console.log(`Found ${tables.length} tables to drop:\n  ${tables.join(', ')}`);

  // Disable FK constraints during drop, then DELETE + DROP each
  await client.execute('PRAGMA foreign_keys=OFF');
  for (const t of tables) {
    try {
      await client.execute(`DELETE FROM "${t}"`);
      await client.execute(`DROP TABLE IF EXISTS "${t}"`);
      console.log(`  dropped: ${t}`);
    } catch (err) {
      console.error(`  FAIL on ${t}: ${err.message}`);
    }
  }
  await client.execute('PRAGMA foreign_keys=ON');
  console.log('All tables dropped.');
}

main().catch(e => { console.error(e); process.exit(1); });
