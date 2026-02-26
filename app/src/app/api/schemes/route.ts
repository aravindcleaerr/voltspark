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

  const [schemes, applications, client, certifications] = await Promise.all([
    prisma.governmentScheme.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.schemeApplication.findMany({
      where: { clientId },
      include: { scheme: { select: { name: true, shortName: true } }, appliedBy: { select: { name: true } } },
    }),
    prisma.client.findUnique({
      where: { id: clientId },
      select: { industry: true, employeeCount: true, address: true },
    }),
    prisma.certification.findMany({
      where: { clientId, status: 'VALID' },
      select: { name: true, category: true },
    }),
  ]);

  // Auto-eligibility matching
  const clientCerts = certifications.map(c => c.name.toLowerCase());
  const clientIndustry = client?.industry?.toLowerCase() || '';
  const clientAddress = client?.address?.toLowerCase() || '';
  const clientSize = client?.employeeCount || 0;

  const schemesWithEligibility = schemes.map(s => {
    let eligible = true;
    let matchScore = 0;
    const reasons: string[] = [];

    if (s.eligibility) {
      try {
        const criteria = JSON.parse(s.eligibility);
        // Industry match
        if (criteria.industry) {
          const industries = (Array.isArray(criteria.industry) ? criteria.industry : [criteria.industry]).map((i: string) => i.toLowerCase());
          if (clientIndustry && industries.some((i: string) => clientIndustry.includes(i) || i === 'all')) {
            matchScore += 30;
            reasons.push('Industry match');
          } else if (clientIndustry) {
            eligible = false;
          }
        } else {
          matchScore += 15; // No industry restriction
        }
        // Size match
        if (criteria.size) {
          const { min, max } = criteria.size;
          if (clientSize > 0) {
            if ((!min || clientSize >= min) && (!max || clientSize <= max)) {
              matchScore += 25;
              reasons.push('Size eligible');
            } else {
              eligible = false;
            }
          }
        } else {
          matchScore += 10;
        }
        // State match
        if (criteria.state) {
          const states = (Array.isArray(criteria.state) ? criteria.state : [criteria.state]).map((st: string) => st.toLowerCase());
          if (states.includes('all') || states.some((st: string) => clientAddress.includes(st))) {
            matchScore += 20;
            reasons.push('Location eligible');
          } else if (clientAddress) {
            eligible = false;
          }
        } else {
          matchScore += 10;
        }
        // Certification match
        if (criteria.certifications) {
          const required = (Array.isArray(criteria.certifications) ? criteria.certifications : [criteria.certifications]).map((c: string) => c.toLowerCase());
          const hasCerts = required.some((rc: string) => clientCerts.some(cc => cc.includes(rc)));
          if (hasCerts) {
            matchScore += 25;
            reasons.push('Certification match');
          }
        } else {
          matchScore += 10;
        }
      } catch {
        matchScore = 50; // Can't parse, assume neutral
      }
    } else {
      matchScore = 70; // No eligibility criteria = open to all
      reasons.push('Open eligibility');
    }

    return { ...s, eligible, matchScore, matchReasons: reasons };
  });

  // Sort: eligible first, then by matchScore desc
  schemesWithEligibility.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return b.matchScore - a.matchScore;
  });

  // Summary
  const totalSubsidiesApplied = applications.reduce((s, a) => s + (a.amountApplied || 0), 0);
  const totalSubsidiesApproved = applications.reduce((s, a) => s + (a.amountApproved || 0), 0);
  const totalSubsidiesDisbursed = applications.reduce((s, a) => s + (a.amountDisbursed || 0), 0);

  return NextResponse.json({
    schemes: schemesWithEligibility,
    applications,
    summary: {
      totalSchemes: schemes.length,
      appliedCount: applications.filter(a => !['IDENTIFIED', 'DOCUMENTS_READY'].includes(a.status)).length,
      approvedCount: applications.filter(a => ['APPROVED', 'DISBURSED'].includes(a.status)).length,
      totalSubsidiesApplied,
      totalSubsidiesApproved,
      totalSubsidiesDisbursed,
      eligibleCount: schemesWithEligibility.filter(s => s.eligible && s.matchScore >= 50).length,
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
