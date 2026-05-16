// Standalone runner for the Manufacturing equipment library. The templates
// are global reference data; this script upserts them without touching tenant
// data — safe to re-run any time the library changes (no full reset needed).
//   npx tsx prisma/seed-asset-templates.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { seedAssetTemplates } from './asset-templates';

function createPrisma() {
  if (process.env.TURSO_DATABASE_URL) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

seedAssetTemplates(prisma)
  .then(n => console.log(`Asset templates upserted: ${n} Manufacturing equipment templates`))
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
