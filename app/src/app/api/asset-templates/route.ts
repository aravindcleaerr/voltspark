import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { serializeTemplate } from '@/lib/acp';

// The equipment library — global reference data shared across all tenants.
// Optionally filtered by ?bundle=MANUFACTURING.
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bundle = request.nextUrl.searchParams.get('bundle');
  const templates = await prisma.assetTemplate.findMany({
    where: bundle ? { bundleType: bundle } : undefined,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(templates.map(serializeTemplate));
}
