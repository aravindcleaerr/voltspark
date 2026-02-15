import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (process.env.TURSO_DATABASE_URL) {
    // Production: use Turso (libSQL)
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const { createClient } = require('@libsql/client');
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSql(client);
    return new PrismaClient({ adapter });
  } else {
    // Local development: use better-sqlite3
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
