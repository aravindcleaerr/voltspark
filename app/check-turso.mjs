import { createClient } from '@libsql/client';
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r = await client.execute("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_libsql_%' AND name NOT LIKE 'libsql_%' ORDER BY name");
console.log(`${r.rows.length} tables on Turso:`);
console.log(r.rows.map(x => x.name).join(', '));
