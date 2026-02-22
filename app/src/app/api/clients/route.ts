import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/** List all clients accessible by the current user */
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // If user has an organization membership, get all org clients
  if (user.organizationId) {
    const clients = await prisma.client.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      select: {
        id: true, name: true, slug: true, industry: true, accessMode: true,
        _count: { select: { energySources: true, capas: true, audits: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(clients);
  }

  // Otherwise, get clients the user has direct access to
  const access = await prisma.clientAccess.findMany({
    where: { userId: user.id, client: { isActive: true } },
    include: {
      client: {
        select: {
          id: true, name: true, slug: true, industry: true, accessMode: true,
          _count: { select: { energySources: true, capas: true, audits: true } },
        },
      },
    },
  });
  return NextResponse.json(access.map(a => a.client));
}

/** Create a new client (consultants only) */
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.organizationId) return NextResponse.json({ error: 'Only consultants can create clients' }, { status: 403 });
  if (user.orgRole !== 'OWNER' && user.orgRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, address, industry, employeeCount, gridTariffRate, solarTariffRate, dgTariffRate, contractDemand, powerFactorTarget } = body;

  if (!name || !slug) return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });

  // Check slug uniqueness
  const existing = await prisma.client.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });

  const client = await prisma.client.create({
    data: {
      organizationId: user.organizationId,
      name, slug, address, industry, employeeCount,
      gridTariffRate, solarTariffRate, dgTariffRate, contractDemand, powerFactorTarget,
    },
  });

  // Give the creating user admin access to the new client
  await prisma.clientAccess.create({
    data: { userId: user.id, clientId: client.id, role: 'CLIENT_ADMIN' },
  });

  return NextResponse.json(client, { status: 201 });
}
