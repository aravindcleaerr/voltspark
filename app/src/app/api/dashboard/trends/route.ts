import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  // Generate last 12 month keys
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const [utilityBills, consumptionEntries, savingsEntries, incidents, inspections] = await Promise.all([
    prisma.utilityBill.findMany({
      where: { clientId, OR: months.map(m => ({ year: parseInt(m.split('-')[0]), month: parseInt(m.split('-')[1]) })) },
      select: { year: true, month: true, totalAmount: true, unitsConsumed: true, powerFactor: true, demandKVA: true },
    }),
    prisma.consumptionEntry.findMany({
      where: { clientId, date: { gte: twelveMonthsAgo } },
      select: { date: true, value: true, cost: true },
    }),
    prisma.savingsEntry.findMany({
      where: { measure: { clientId }, OR: months.map(m => ({ year: parseInt(m.split('-')[0]), month: parseInt(m.split('-')[1]) })) },
      select: { year: true, month: true, savingsAmount: true, kwhSaved: true },
    }),
    prisma.incident.findMany({
      where: { clientId, incidentDate: { gte: twelveMonthsAgo } },
      select: { incidentDate: true, severity: true },
    }),
    prisma.inspection.findMany({
      where: { clientId, inspectionDate: { gte: twelveMonthsAgo } },
      select: { inspectionDate: true, score: true, status: true },
    }),
  ]);

  // Build monthly cost & consumption from utility bills
  const billMap: Record<string, { cost: number; units: number; pf: number | null; demand: number | null }> = {};
  for (const b of utilityBills) {
    const key = `${b.year}-${String(b.month).padStart(2, '0')}`;
    billMap[key] = { cost: b.totalAmount, units: b.unitsConsumed, pf: b.powerFactor, demand: b.demandKVA };
  }

  // Build monthly consumption from entries (aggregate by month)
  const entryMap: Record<string, { totalValue: number; totalCost: number; count: number }> = {};
  for (const e of consumptionEntries) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!entryMap[key]) entryMap[key] = { totalValue: 0, totalCost: 0, count: 0 };
    entryMap[key].totalValue += e.value;
    entryMap[key].totalCost += e.cost || 0;
    entryMap[key].count++;
  }

  // Build monthly savings
  const savingsMap: Record<string, { amount: number; kwh: number }> = {};
  for (const s of savingsEntries) {
    const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
    if (!savingsMap[key]) savingsMap[key] = { amount: 0, kwh: 0 };
    savingsMap[key].amount += s.savingsAmount;
    savingsMap[key].kwh += s.kwhSaved || 0;
  }

  // Build monthly incidents
  const incidentMap: Record<string, { total: number; critical: number }> = {};
  for (const inc of incidents) {
    const d = new Date(inc.incidentDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!incidentMap[key]) incidentMap[key] = { total: 0, critical: 0 };
    incidentMap[key].total++;
    if (inc.severity === 'MAJOR' || inc.severity === 'FATAL') incidentMap[key].critical++;
  }

  // Build monthly inspections
  const inspectionMap: Record<string, { count: number; avgScore: number | null; passed: number }> = {};
  for (const insp of inspections) {
    const d = new Date(insp.inspectionDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!inspectionMap[key]) inspectionMap[key] = { count: 0, avgScore: null, passed: 0 };
    inspectionMap[key].count++;
    if (insp.score !== null) {
      const prev = inspectionMap[key].avgScore;
      inspectionMap[key].avgScore = prev !== null ? (prev * (inspectionMap[key].count - 1) + insp.score) / inspectionMap[key].count : insp.score;
    }
    if (insp.status === 'COMPLETED') inspectionMap[key].passed++;
  }

  // Assemble monthly trend data
  const monthly = months.map(m => {
    const bill = billMap[m];
    const entry = entryMap[m];
    const saving = savingsMap[m];
    const incident = incidentMap[m];
    const inspection = inspectionMap[m];
    const label = new Date(parseInt(m.split('-')[0]), parseInt(m.split('-')[1]) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

    return {
      month: m,
      label,
      cost: bill?.cost || entry?.totalCost || 0,
      units: bill?.units || entry?.totalValue || 0,
      powerFactor: bill?.pf || null,
      demand: bill?.demand || null,
      savings: saving?.amount || 0,
      kwhSaved: saving?.kwh || 0,
      incidents: incident?.total || 0,
      criticalIncidents: incident?.critical || 0,
      inspections: inspection?.count || 0,
      inspectionScore: inspection?.avgScore ? Math.round(inspection.avgScore) : null,
    };
  });

  // YoY comparison
  const currentYear = months.slice(6); // last 6 months
  const prevYearKeys = currentYear.map(m => {
    const [y, mo] = m.split('-');
    return `${parseInt(y) - 1}-${mo}`;
  });

  const currentCost = currentYear.reduce((s, m) => s + (billMap[m]?.cost || entryMap[m]?.totalCost || 0), 0);
  const currentUnits = currentYear.reduce((s, m) => s + (billMap[m]?.units || entryMap[m]?.totalValue || 0), 0);

  // Fetch previous year bills for YoY
  const prevBills = await prisma.utilityBill.findMany({
    where: { clientId, OR: prevYearKeys.map(m => ({ year: parseInt(m.split('-')[0]), month: parseInt(m.split('-')[1]) })) },
    select: { year: true, month: true, totalAmount: true, unitsConsumed: true },
  });
  const prevCost = prevBills.reduce((s, b) => s + b.totalAmount, 0);
  const prevUnits = prevBills.reduce((s, b) => s + b.unitsConsumed, 0);

  const yoy = {
    costChange: prevCost > 0 ? Math.round(((currentCost - prevCost) / prevCost) * 100) : null,
    unitsChange: prevUnits > 0 ? Math.round(((currentUnits - prevUnits) / prevUnits) * 100) : null,
    currentCost,
    previousCost: prevCost,
    currentUnits,
    previousUnits: prevUnits,
  };

  return NextResponse.json({ monthly, yoy });
}
