import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const frameworks = await prisma.complianceFramework.findMany({
    where: {
      OR: [
        { isBuiltIn: true },
        { organizationId: result.user.organizationId },
      ],
    },
    include: {
      _count: { select: { requirements: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(frameworks);
}
