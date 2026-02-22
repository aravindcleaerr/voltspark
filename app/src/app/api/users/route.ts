import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  // Get all users who have access to this client
  const access = await prisma.clientAccess.findMany({
    where: { clientId: result.clientId },
    include: { user: { select: { id: true, name: true, email: true, department: true, employeeId: true, isActive: true } } },
  });

  const users = access.map(a => ({
    id: a.user.id,
    name: a.user.name,
    email: a.user.email,
    role: a.role,
    department: a.user.department,
    employeeId: a.user.employeeId,
    isActive: a.user.isActive,
  }));

  return NextResponse.json(users);
}
