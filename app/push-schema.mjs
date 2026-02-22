import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = readFileSync('turso-migration.sql', 'utf-8');

// Split by semicolons, strip comment lines, filter empty
const statements = sql
  .split(';')
  .map(s => s.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
  .filter(s => s.length > 0);

console.log(`Executing ${statements.length} statements against Turso...`);

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 70);
    console.log(`  OK: ${preview}...`);
  } catch (err) {
    console.error(`  FAIL: ${stmt.replace(/\s+/g, ' ').substring(0, 70)}...`);
    console.error(`  Error: ${err.message}`);
  }
}

console.log('Schema push complete!');
