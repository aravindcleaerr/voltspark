import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const client = await prisma.client.findUnique({
    where: { id: result.clientId },
    select: { id: true, name: true, slug: true, enabledAddons: true, industry: true },
  });

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  return NextResponse.json(client);
}
