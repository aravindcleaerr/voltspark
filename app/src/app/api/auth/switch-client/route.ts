import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/** Verify user has access to the requested client and return the data needed for session update */
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 });

  // Verify user has access
  const access = await prisma.clientAccess.findUnique({
    where: { userId_clientId: { userId: user.id, clientId } },
    include: { client: { select: { slug: true, name: true, isActive: true } } },
  });

  if (!access || !access.client.isActive) {
    // If user is a consultant in the org, they have implicit access
    if (user.organizationId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, organizationId: user.organizationId, isActive: true },
        select: { slug: true, name: true },
      });
      if (client) {
        return NextResponse.json({
          activeClientId: clientId,
          activeClientSlug: client.slug,
          activeClientName: client.name,
          clientRole: 'CLIENT_ADMIN', // Consultants get admin access
        });
      }
    }
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.json({
    activeClientId: clientId,
    activeClientSlug: access.client.slug,
    activeClientName: access.client.name,
    clientRole: access.role,
  });
}
