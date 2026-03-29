import { NextResponse } from 'next/server';
import { prisma } from './prisma';

/** Check if a client has a specific add-on enabled. Returns error response if not. */
export async function requireAddon(
  clientId: string,
  addon: string
): Promise<{ ok: true } | { error: Response }> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { enabledAddons: true },
  });

  if (!client) {
    return { error: NextResponse.json({ error: 'Client not found' }, { status: 404 }) };
  }

  try {
    const addons: string[] = JSON.parse(client.enabledAddons || '[]');
    if (!addons.includes(addon)) {
      return {
        error: NextResponse.json(
          { error: `${addon} module is not enabled for this client` },
          { status: 403 }
        ),
      };
    }
  } catch {
    return {
      error: NextResponse.json(
        { error: `${addon} module is not enabled for this client` },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}
