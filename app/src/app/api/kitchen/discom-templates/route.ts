import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const templates = await prisma.discomTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ state: 'asc' }, { discomName: 'asc' }],
  });

  return NextResponse.json(templates);
}
