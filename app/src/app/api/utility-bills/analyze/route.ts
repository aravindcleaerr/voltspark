import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

interface BillInsight {
  type: 'PF_PENALTY' | 'DEMAND_OVERSHOOT' | 'COST_SPIKE' | 'COST_TREND' | 'RATE_INCREASE' | 'SAVINGS_OPPORTUNITY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  detail: string;
  amount?: number; // ₹ impact
  month?: string;
}

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const client = await prisma.client.findUnique({
    where: { id: result.clientId },
    select: { contractDemand: true, powerFactorTarget: true },
  });

  const bills = await prisma.utilityBill.findMany({
    where: { clientId: result.clientId },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  if (bills.length < 2) {
    return NextResponse.json({ insights: [], summary: null, message: 'Need at least 2 bills for analysis' });
  }

  const contractDemand = client?.contractDemand || 0;
  const pfTarget = client?.powerFactorTarget || 0.90;
  const insights: BillInsight[] = [];

  // ============================================================
  // 1. PF PENALTY ANALYSIS
  // ============================================================
  let totalPfPenaltyEstimate = 0;
  for (const bill of bills) {
    if (bill.powerFactor && bill.powerFactor < pfTarget) {
      // BESCOM-style penalty: Energy charge × 0.5% per 0.01 below target
      const pfGap = pfTarget - bill.powerFactor;
      const steps = Math.round(pfGap * 100); // number of 0.01 steps below target
      const energyCharges = bill.energyCharges || bill.totalAmount * 0.6; // estimate if not broken down
      const estimatedPenalty = energyCharges * steps * 0.005;
      totalPfPenaltyEstimate += estimatedPenalty;

      const monthLabel = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][bill.month - 1]} ${bill.year}`;

      if (steps >= 5) { // PF gap >= 0.05
        insights.push({
          type: 'PF_PENALTY',
          severity: steps >= 10 ? 'CRITICAL' : 'WARNING',
          title: `Low power factor in ${monthLabel}`,
          detail: `PF ${bill.powerFactor.toFixed(2)} is ${(pfGap * 100).toFixed(0)} points below target ${pfTarget}. Estimated penalty: ₹${Math.round(estimatedPenalty).toLocaleString('en-IN')}. ${bill.pfPenalty ? `Actual penalty on bill: ₹${Math.round(bill.pfPenalty).toLocaleString('en-IN')}` : 'No penalty recorded on bill — verify with DISCOM.'}`,
          amount: estimatedPenalty,
          month: monthLabel,
        });
      }
    }
  }

  // ============================================================
  // 2. DEMAND OVERSHOOT ANALYSIS
  // ============================================================
  let totalDemandOvershootCost = 0;
  if (contractDemand > 0) {
    for (const bill of bills) {
      if (bill.demandKVA && bill.demandKVA > contractDemand) {
        const excess = bill.demandKVA - contractDemand;
        const excessPct = (excess / contractDemand) * 100;
        // Typical penalty: 2x demand charge per excess kVA
        const demandRate = bill.demandCharges && bill.demandKVA ? bill.demandCharges / bill.demandKVA : 200; // default ₹200/kVA
        const penaltyCost = excess * demandRate * 2; // 2x multiplier for excess
        totalDemandOvershootCost += penaltyCost;

        const monthLabel = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][bill.month - 1]} ${bill.year}`;
        insights.push({
          type: 'DEMAND_OVERSHOOT',
          severity: excessPct > 10 ? 'CRITICAL' : 'WARNING',
          title: `Demand overshoot in ${monthLabel}`,
          detail: `Recorded ${bill.demandKVA.toFixed(0)} kVA vs ${contractDemand} kVA contracted (+${excess.toFixed(0)} kVA, ${excessPct.toFixed(0)}% over). Estimated penalty: ₹${Math.round(penaltyCost).toLocaleString('en-IN')}.`,
          amount: penaltyCost,
          month: monthLabel,
        });
      }
    }
  }

  // ============================================================
  // 3. COST TREND ANALYSIS
  // ============================================================
  const recentBills = bills.slice(-6); // Last 6 months
  if (recentBills.length >= 3) {
    // Check for consistent cost increase
    let increases = 0;
    for (let i = 1; i < recentBills.length; i++) {
      if (recentBills[i].totalAmount > recentBills[i - 1].totalAmount) increases++;
    }
    if (increases >= recentBills.length - 1) {
      const firstCost = recentBills[0].totalAmount;
      const lastCost = recentBills[recentBills.length - 1].totalAmount;
      const pctIncrease = ((lastCost - firstCost) / firstCost) * 100;
      insights.push({
        type: 'COST_TREND',
        severity: pctIncrease > 20 ? 'CRITICAL' : 'WARNING',
        title: 'Consistent cost increase trend',
        detail: `Bills have increased ${increases} out of last ${recentBills.length - 1} months. Total increase: ${pctIncrease.toFixed(0)}% (₹${Math.round(firstCost).toLocaleString('en-IN')} → ₹${Math.round(lastCost).toLocaleString('en-IN')}).`,
        amount: lastCost - firstCost,
      });
    }

    // Rate per kWh trend
    const rates = recentBills.filter(b => b.unitsConsumed > 0).map(b => b.totalAmount / b.unitsConsumed);
    if (rates.length >= 3) {
      const avgRate = rates.reduce((s, r) => s + r, 0) / rates.length;
      const latestRate = rates[rates.length - 1];
      if (latestRate > avgRate * 1.15) {
        insights.push({
          type: 'RATE_INCREASE',
          severity: 'WARNING',
          title: 'Effective rate per kWh above average',
          detail: `Current rate ₹${latestRate.toFixed(2)}/kWh is ${(((latestRate - avgRate) / avgRate) * 100).toFixed(0)}% above your 6-month average of ₹${avgRate.toFixed(2)}/kWh. May indicate tariff change or charge structure shift.`,
        });
      }
    }
  }

  // ============================================================
  // 4. ANOMALY DETECTION (Month-over-month spikes)
  // ============================================================
  for (let i = 1; i < bills.length; i++) {
    const prev = bills[i - 1];
    const curr = bills[i];
    if (prev.totalAmount > 0) {
      const changePct = ((curr.totalAmount - prev.totalAmount) / prev.totalAmount) * 100;
      if (Math.abs(changePct) > 30) {
        const monthLabel = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][curr.month - 1]} ${curr.year}`;
        insights.push({
          type: 'COST_SPIKE',
          severity: Math.abs(changePct) > 50 ? 'CRITICAL' : 'WARNING',
          title: `${changePct > 0 ? 'Spike' : 'Drop'} in ${monthLabel}`,
          detail: `Bill ${changePct > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePct).toFixed(0)}% (₹${Math.round(prev.totalAmount).toLocaleString('en-IN')} → ₹${Math.round(curr.totalAmount).toLocaleString('en-IN')}). ${changePct > 30 ? 'Investigate: check meter accuracy, production changes, or billing errors.' : ''}`,
          amount: Math.abs(curr.totalAmount - prev.totalAmount),
          month: monthLabel,
        });
      }
    }
  }

  // ============================================================
  // 5. SAVINGS OPPORTUNITIES
  // ============================================================
  // PF improvement opportunity
  const recentPfBills = bills.slice(-6).filter(b => b.powerFactor !== null);
  if (recentPfBills.length > 0) {
    const avgPf = recentPfBills.reduce((s, b) => s + (b.powerFactor || 0), 0) / recentPfBills.length;
    if (avgPf < pfTarget && avgPf > 0) {
      const avgEnergyCharge = recentPfBills.reduce((s, b) => s + (b.energyCharges || b.totalAmount * 0.6), 0) / recentPfBills.length;
      const pfGap = pfTarget - avgPf;
      const monthlySaving = avgEnergyCharge * Math.round(pfGap * 100) * 0.005;
      insights.push({
        type: 'SAVINGS_OPPORTUNITY',
        severity: 'INFO',
        title: 'APFC panel can eliminate PF penalties',
        detail: `Average PF ${avgPf.toFixed(2)} is below target ${pfTarget}. Installing/upgrading APFC panel to reach ${pfTarget} could save ~₹${Math.round(monthlySaving).toLocaleString('en-IN')}/month (₹${Math.round(monthlySaving * 12).toLocaleString('en-IN')}/year).`,
        amount: monthlySaving * 12,
      });
    }
  }

  // Demand management opportunity
  if (contractDemand > 0) {
    const overshootBills = bills.filter(b => b.demandKVA && b.demandKVA > contractDemand);
    if (overshootBills.length >= 3) {
      insights.push({
        type: 'SAVINGS_OPPORTUNITY',
        severity: 'INFO',
        title: 'Demand management needed',
        detail: `${overshootBills.length} out of ${bills.length} months exceeded contracted demand (${contractDemand} kVA). Consider load scheduling, demand controllers, or revising contract demand with DISCOM.`,
        amount: totalDemandOvershootCost,
      });
    }
  }

  // Sort: CRITICAL first, then WARNING, then INFO
  const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Summary
  const totalBills = bills.length;
  const totalCost = bills.reduce((s, b) => s + b.totalAmount, 0);
  const avgMonthly = totalCost / totalBills;
  const latestBill = bills[bills.length - 1];
  const avgPf = bills.filter(b => b.powerFactor).reduce((s, b) => s + (b.powerFactor || 0), 0) / (bills.filter(b => b.powerFactor).length || 1);
  const pfPenaltyMonths = bills.filter(b => b.hasPfPenalty).length;
  const overshootMonths = bills.filter(b => b.hasDemandOvershoot).length;

  return NextResponse.json({
    insights,
    summary: {
      totalBills,
      totalCost,
      avgMonthly,
      avgPf,
      pfPenaltyMonths,
      overshootMonths,
      totalPfPenaltyEstimate,
      totalDemandOvershootCost,
      totalSavingsOpportunity: totalPfPenaltyEstimate + totalDemandOvershootCost,
      latestMonth: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][latestBill.month - 1]} ${latestBill.year}`,
    },
  });
}
