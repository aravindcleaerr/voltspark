import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { sendEmail, inviteEmail } from '@/lib/email';

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

/** POST — invite a new user to the current client */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  // Only admins can invite
  if (user.clientRole !== 'CLIENT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Only admins can invite users' }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, role, department, employeeId } = body;

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email required' }, { status: 400 });
  }

  // Check if user already exists
  let existingUser = await prisma.user.findUnique({ where: { email } });

  // Generate temp password
  const tempPassword = `VS${Math.random().toString(36).slice(2, 8)}!`;
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  if (existingUser) {
    // Check if already has access to this client
    const existingAccess = await prisma.clientAccess.findUnique({
      where: { userId_clientId: { userId: existingUser.id, clientId } },
    });
    if (existingAccess) {
      return NextResponse.json({ error: 'User already has access to this workspace' }, { status: 409 });
    }
    // Grant access to this client
    await prisma.clientAccess.create({
      data: { userId: existingUser.id, clientId, role: role || 'EMPLOYEE' },
    });
  } else {
    // Create new user
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { organizationId: true },
    });

    existingUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        department: department || null,
        employeeId: employeeId || null,
        clientAccess: { create: { clientId, role: role || 'EMPLOYEE' } },
        memberships: client?.organizationId ? { create: { organizationId: client.organizationId, role: 'MEMBER' } } : undefined,
      },
    });
  }

  // Send invite email
  const clientInfo = await prisma.client.findUnique({
    where: { id: clientId },
    select: { name: true, organization: { select: { name: true } } },
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'https://volt-spark.vercel.app';
  const emailContent = inviteEmail({
    inviterName: user.name,
    inviterOrg: clientInfo?.organization?.name || 'VoltSpark',
    clientName: clientInfo?.name || 'Workspace',
    role: role || 'EMPLOYEE',
    loginUrl: `${baseUrl}/login`,
    tempPassword,
    email,
  });

  await sendEmail({ to: email, ...emailContent }).catch(() => {});

  return NextResponse.json({ id: existingUser.id, name, email, role: role || 'EMPLOYEE', invited: true }, { status: 201 });
}
