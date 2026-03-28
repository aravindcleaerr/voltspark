import { NextRequest } from 'next/server';
import { prisma } from './prisma';

/**
 * Authenticate API requests from Titan meters using API key.
 * Expects header: Authorization: Bearer vsk_<key>
 * Returns kitchenId on success, error Response on failure.
 */
export async function requireApiKey(
  request: NextRequest
): Promise<{ kitchenId: string } | { error: Response }> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer vsk_')) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const fullKey = authHeader.slice(7); // remove "Bearer "
  const prefix = fullKey.slice(0, 12); // "vsk_" + 8 chars

  const apiKey = await prisma.kitchenApiKey.findFirst({
    where: { keyPrefix: prefix, isActive: true },
  });

  if (!apiKey) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Simple comparison (for MVP; use bcrypt in production)
  // The keyHash stores the full key for now
  if (apiKey.keyHash !== fullKey) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Update last used timestamp (fire-and-forget)
  prisma.kitchenApiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return { kitchenId: apiKey.kitchenId };
}

/**
 * Generate a new API key for a kitchen.
 * Returns the full key (show to user once) and the hash/prefix for storage.
 */
export function generateApiKey(): { fullKey: string; keyHash: string; keyPrefix: string } {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 32; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  const fullKey = `vsk_${random}`;
  return {
    fullKey,
    keyHash: fullKey, // MVP: store plaintext; upgrade to bcrypt later
    keyPrefix: fullKey.slice(0, 12),
  };
}
