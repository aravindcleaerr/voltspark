import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/**
 * Government Schemes & Subsidies API
 * GET — list schemes + client applications
 * POST — apply to a scheme / update application status
 */
export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const [schemes, applications] = await Promise.all([
    prisma.governmentScheme.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.schemeApplication.findMany({
      where: { clientId },
      include: { scheme: { select: { name: true, shortName: true } }, appliedBy: { select: { name: true } } },
    }),
  ]);

  // Summary
  const totalSubsidiesApplied = applications.reduce((s, a) => s + (a.amountApplied || 0), 0);
  const totalSubsidiesApproved = applications.reduce((s, a) => s + (a.amountApproved || 0), 0);
  const totalSubsidiesDisbursed = applications.reduce((s, a) => s + (a.amountDisbursed || 0), 0);

  return NextResponse.json({
    schemes,
    applications,
    summary: {
      totalSchemes: schemes.length,
      appliedCount: applications.filter(a => !['IDENTIFIED', 'DOCUMENTS_READY'].includes(a.status)).length,
      approvedCount: applications.filter(a => ['APPROVED', 'DISBURSED'].includes(a.status)).length,
      totalSubsidiesApplied,
      totalSubsidiesApproved,
      totalSubsidiesDisbursed,
    },
  });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const body = await request.json();

  // Update existing application
  if (body.applicationId) {
    const app = await prisma.schemeApplication.update({
      where: { id: body.applicationId },
      data: {
        status: body.status || undefined,
        applicationRef: body.applicationRef || undefined,
        amountApplied: body.amountApplied !== undefined ? body.amountApplied : undefined,
        amountApproved: body.amountApproved !== undefined ? body.amountApproved : undefined,
        amountDisbursed: body.amountDisbursed !== undefined ? body.amountDisbursed : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });
    return NextResponse.json(app);
  }

  // Create new application
  const app = await prisma.schemeApplication.create({
    data: {
      clientId,
      schemeId: body.schemeId,
      appliedById: user.id,
      status: body.status || 'IDENTIFIED',
      amountApplied: body.amountApplied || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(app, { status: 201 });
}
