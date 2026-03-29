import { NextRequest } from 'next/server';
import { prisma } from './prisma';

/**
 * Authenticate API requests from IoT gateways using API key.
 * Expects header: Authorization: Bearer vsi_<key>
 * Returns gatewayId + clientId on success, error Response on failure.
 */
export async function requireIoTApiKey(
  request: NextRequest
): Promise<{ gatewayId: string; clientId: string } | { error: Response }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer vsi_')) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const fullKey = authHeader.slice(7); // remove "Bearer "
  const prefix = fullKey.slice(0, 12); // "vsi_" + 8 chars

  const apiKey = await prisma.ioTApiKey.findFirst({
    where: { keyPrefix: prefix, isActive: true },
    include: { gateway: { select: { id: true, clientId: true, isActive: true } } },
  });

  if (!apiKey || !apiKey.gateway.isActive) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Simple comparison (MVP; upgrade to bcrypt later)
  if (apiKey.keyHash !== fullKey) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Update last used + gateway online status (fire-and-forget)
  prisma.ioTApiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  prisma.ioTGateway.update({
    where: { id: apiKey.gateway.id },
    data: { lastSeenAt: new Date(), isOnline: true },
  }).catch(() => {});

  return { gatewayId: apiKey.gateway.id, clientId: apiKey.gateway.clientId };
}

/**
 * Generate a new API key for an IoT gateway.
 * Returns the full key (show to user once) and the hash/prefix for storage.
 */
export function generateIoTApiKey(): { fullKey: string; keyHash: string; keyPrefix: string } {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 32; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  const fullKey = `vsi_${random}`;
  return {
    fullKey,
    keyHash: fullKey, // MVP: store plaintext; upgrade to bcrypt later
    keyPrefix: fullKey.slice(0, 12),
  };
}
