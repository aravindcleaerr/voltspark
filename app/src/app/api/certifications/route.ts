import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const certifications = await prisma.certification.findMany({
    where: { clientId: result.clientId },
    orderBy: { expiryDate: 'asc' },
  });

  return NextResponse.json(certifications);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  if (result.user.clientRole === 'VIEWER' || result.user.clientRole === 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, category, issuingBody, certificateNumber, issueDate, expiryDate, renewalFrequency, reminderDays, equipmentName, notes } = body;

  if (!name || !category || !issuingBody || !issueDate || !expiryDate) {
    return NextResponse.json({ error: 'name, category, issuingBody, issueDate, and expiryDate are required' }, { status: 400 });
  }

  // Determine status based on expiry
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let status = 'VALID';
  if (daysUntilExpiry < 0) status = 'EXPIRED';
  else if (daysUntilExpiry <= (reminderDays || 30)) status = 'EXPIRING_SOON';

  const cert = await prisma.certification.create({
    data: {
      clientId: result.clientId,
      name,
      category,
      issuingBody,
      certificateNumber: certificateNumber || undefined,
      issueDate: new Date(issueDate),
      expiryDate: expiry,
      renewalFrequency: renewalFrequency || undefined,
      reminderDays: reminderDays || 30,
      status,
      equipmentName: equipmentName || undefined,
      notes: notes || undefined,
    },
  });

  return NextResponse.json(cert, { status: 201 });
}
