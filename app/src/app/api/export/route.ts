import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/**
 * Data Export — CSV or JSON export for any module.
 * ?module=consumption|bills|savings|training|audits|capas|inspections|incidents|certifications
 * &format=csv|json (default: csv)
 */
export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const module = request.nextUrl.searchParams.get('module') || 'consumption';
  const format = request.nextUrl.searchParams.get('format') || 'csv';

  let data: Record<string, unknown>[] = [];
  let filename = `${module}-export`;

  switch (module) {
    case 'consumption': {
      const entries = await prisma.consumptionEntry.findMany({
        where: { clientId },
        include: { energySource: { select: { name: true, type: true, unit: true } } },
        orderBy: { date: 'desc' },
      });
      data = entries.map(e => ({
        Date: new Date(e.date).toISOString().split('T')[0],
        Source: e.energySource.name,
        Type: e.energySource.type,
        Value: e.value,
        Unit: e.energySource.unit,
        Cost: e.cost || 0,
        MeterReading: e.meterReading || '',
        HasDeviation: e.hasDeviation ? 'Yes' : 'No',
        DeviationPercent: e.deviationPercent || '',
        Notes: e.notes || '',
      }));
      break;
    }
    case 'bills': {
      const bills = await prisma.utilityBill.findMany({
        where: { clientId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      data = bills.map(b => ({
        Month: `${b.year}-${String(b.month).padStart(2, '0')}`,
        Provider: b.provider || '',
        UnitsConsumed: b.unitsConsumed,
        DemandKVA: b.demandKVA || '',
        PowerFactor: b.powerFactor || '',
        EnergyCharges: b.energyCharges || 0,
        DemandCharges: b.demandCharges || 0,
        PFPenalty: b.pfPenalty || 0,
        PFIncentive: b.pfIncentive || 0,
        FuelSurcharge: b.fuelSurcharge || 0,
        ElectricityDuty: b.electricityDuty || 0,
        OtherCharges: b.otherCharges || 0,
        TotalAmount: b.totalAmount,
        IsEstimated: b.isEstimated ? 'Yes' : 'No',
      }));
      break;
    }
    case 'savings': {
      const measures = await prisma.savingsMeasure.findMany({
        where: { clientId },
        include: { energySource: { select: { name: true } }, entries: true },
      });
      data = measures.map(m => ({
        Name: m.name,
        Category: m.category,
        EnergySource: m.energySource?.name || '',
        InvestmentCost: m.investmentCost,
        ImplementationDate: new Date(m.implementationDate).toISOString().split('T')[0],
        Status: m.status,
        EstimatedMonthlySavings: m.estimatedMonthlySavings || '',
        ActualMonthlySavings: m.actualMonthlySavings || '',
        PaybackMonths: m.paybackMonths || '',
        CumulativeSavings: m.cumulativeSavings || '',
        TotalEntries: m.entries.length,
      }));
      break;
    }
    case 'training': {
      const programs = await prisma.trainingProgram.findMany({
        where: { clientId },
        include: { attendance: { include: { user: { select: { name: true } } } } },
      });
      data = programs.map(p => ({
        Title: p.title,
        Type: p.type,
        Trainer: p.trainer || '',
        ScheduledDate: new Date(p.scheduledDate).toISOString().split('T')[0],
        Status: p.status,
        Duration: p.duration || '',
        TotalParticipants: p.attendance.length,
        Attended: p.attendance.filter(a => a.attended).length,
        AttendanceRate: p.attendance.length > 0 ? Math.round((p.attendance.filter(a => a.attended).length / p.attendance.length) * 100) + '%' : 'N/A',
      }));
      break;
    }
    case 'audits': {
      const audits = await prisma.audit.findMany({
        where: { clientId },
        include: { leadAuditor: { select: { name: true } }, _count: { select: { findings: true } } },
      });
      data = audits.map(a => ({
        Title: a.title,
        Type: a.type,
        AuditDate: new Date(a.auditDate).toISOString().split('T')[0],
        LeadAuditor: a.leadAuditor?.name || a.externalAuditor || '',
        Status: a.status,
        Findings: a._count.findings,
        Summary: a.summary || '',
      }));
      break;
    }
    case 'capas': {
      const capas = await prisma.cAPA.findMany({
        where: { clientId },
        include: { raisedBy: { select: { name: true } }, assignedTo: { select: { name: true } } },
      });
      data = capas.map(c => ({
        CAPANumber: c.capaNumber,
        Title: c.title,
        Type: c.type,
        Source: c.source,
        Priority: c.priority,
        Status: c.status,
        RaisedBy: c.raisedBy.name,
        AssignedTo: c.assignedTo?.name || '',
        RootCause: c.rootCause || '',
        CorrectiveAction: c.correctiveAction || '',
        DueDate: c.actionDueDate ? new Date(c.actionDueDate).toISOString().split('T')[0] : '',
      }));
      break;
    }
    case 'incidents': {
      const incidents = await prisma.incident.findMany({
        where: { clientId },
        include: { reportedBy: { select: { name: true } } },
      });
      data = incidents.map(i => ({
        Title: i.title,
        Type: i.type,
        Severity: i.severity,
        Date: new Date(i.incidentDate).toISOString().split('T')[0],
        Location: i.location || '',
        ReportedBy: i.reportedBy.name,
        Status: i.status,
        RootCause: i.rootCause || '',
        CorrectiveAction: i.correctiveAction || '',
      }));
      break;
    }
    case 'certifications': {
      const certs = await prisma.certification.findMany({ where: { clientId } });
      data = certs.map(c => ({
        Name: c.name,
        Category: c.category,
        IssuingBody: c.issuingBody || '',
        CertificateNumber: c.certificateNumber || '',
        IssueDate: c.issueDate ? new Date(c.issueDate).toISOString().split('T')[0] : '',
        ExpiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '',
        Status: c.status,
      }));
      break;
    }
    default:
      return NextResponse.json({ error: 'Invalid module' }, { status: 400 });
  }

  if (format === 'json') {
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });
  }

  // CSV
  if (data.length === 0) {
    return new NextResponse('No data to export', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '');
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(',')
    ),
  ];

  return new NextResponse(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  });
}
