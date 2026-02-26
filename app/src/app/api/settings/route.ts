import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const rows = await prisma.appSetting.findMany({
    where: { clientId: result.clientId },
  });
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const body = await request.json();
  const { settings } = body;

  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'settings object required' }, { status: 400 });
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.appSetting.upsert({
      where: { clientId_key: { clientId, key } },
      update: { value: String(value) },
      create: { clientId, key, value: String(value) },
    });
  }

  return NextResponse.json({ ok: true });
}
