import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/** GET — list inspection templates (built-in + organization-specific) */
export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const orgId = (result as any).organizationId || null;

  const templates = await prisma.inspectionTemplate.findMany({
    where: {
      OR: [
        { isBuiltIn: true },
        ...(orgId ? [{ organizationId: orgId }] : []),
      ],
    },
    include: { _count: { select: { items: true, inspections: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(templates);
}

/** POST — create a new inspection template with items */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const orgId = (result as any).organizationId || null;
  const body = await request.json();
  const { name, category, description, items } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'name and category required' }, { status: 400 });
  }

  const template = await prisma.inspectionTemplate.create({
    data: {
      name,
      category,
      description: description || null,
      isBuiltIn: false,
      organizationId: orgId,
      items: items && items.length > 0 ? {
        create: items.map((item: any, i: number) => ({
          section: item.section || 'General',
          itemText: item.itemText,
          helpText: item.helpText || null,
          type: item.type || 'PASS_FAIL',
          isCritical: item.isCritical || false,
          sortOrder: i,
        })),
      } : undefined,
    },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json(template, { status: 201 });
}
