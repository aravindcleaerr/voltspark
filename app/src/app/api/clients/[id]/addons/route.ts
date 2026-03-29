import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/** Toggle add-ons for a client. Consultant-only. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.organizationId || !user.orgRole) return NextResponse.json({ error: 'Consultants only' }, { status: 403 });

  const { id } = await params;

  // Verify client belongs to consultant's org
  const client = await prisma.client.findFirst({
    where: { id, organizationId: user.organizationId },
    select: { id: true, enabledAddons: true },
  });
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const body = await request.json();
  const { addon, enabled } = body;

  if (!addon || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'addon (string) and enabled (boolean) required' }, { status: 400 });
  }

  const VALID_ADDONS = ['KITCHEN'];
  if (!VALID_ADDONS.includes(addon)) {
    return NextResponse.json({ error: `Invalid add-on: ${addon}. Valid: ${VALID_ADDONS.join(', ')}` }, { status: 400 });
  }

  let addons: string[] = [];
  try { addons = JSON.parse(client.enabledAddons || '[]'); } catch {}

  if (enabled && !addons.includes(addon)) {
    addons.push(addon);
  } else if (!enabled) {
    addons = addons.filter(a => a !== addon);
  }

  const updated = await prisma.client.update({
    where: { id },
    data: { enabledAddons: JSON.stringify(addons) },
    select: { id: true, name: true, enabledAddons: true },
  });

  return NextResponse.json(updated);
}
