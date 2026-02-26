import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const calculations = await prisma.rOICalculation.findMany({
    where: { clientId },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Summary
  const totalProposedInvestment = calculations.reduce((s, c) => s + c.investmentCost, 0);
  const totalProposedSavings = calculations.reduce((s, c) => s + c.annualSavings, 0);
  const totalSubsidies = calculations.reduce((s, c) => s + (c.subsidyAmount || 0), 0);
  const avgPayback = calculations.length > 0
    ? calculations.reduce((s, c) => s + c.paybackMonths, 0) / calculations.length
    : 0;

  return NextResponse.json({
    calculations,
    summary: {
      totalProposedInvestment,
      totalProposedSavings,
      totalSubsidies,
      avgPayback: Math.round(avgPayback * 10) / 10,
      count: calculations.length,
    },
  });
}

// ROI calculation templates with formulas
const TEMPLATES: Record<string, { label: string; fields: { key: string; label: string; unit: string; defaultValue?: number }[] }> = {
  SOLAR: {
    label: 'Solar Rooftop',
    fields: [
      { key: 'systemSizeKW', label: 'System Size', unit: 'kW' },
      { key: 'costPerKW', label: 'Cost per kW', unit: '₹', defaultValue: 50000 },
      { key: 'subsidyPercent', label: 'Subsidy', unit: '%', defaultValue: 40 },
      { key: 'tariffRate', label: 'Grid Tariff', unit: '₹/kWh' },
      { key: 'dailyGenerationHrs', label: 'Avg. Daily Sun Hours', unit: 'hrs', defaultValue: 4.5 },
      { key: 'degradationRate', label: 'Annual Degradation', unit: '%', defaultValue: 0.5 },
      { key: 'lifetimeYears', label: 'System Lifetime', unit: 'years', defaultValue: 25 },
    ],
  },
  VFD: {
    label: 'VFD Installation',
    fields: [
      { key: 'motorHP', label: 'Motor Size', unit: 'HP' },
      { key: 'loadPercent', label: 'Avg. Load', unit: '%', defaultValue: 60 },
      { key: 'operatingHrsPerMonth', label: 'Operating Hours', unit: 'hrs/month', defaultValue: 400 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'vfdCost', label: 'VFD Cost', unit: '₹' },
      { key: 'savingsPercent', label: 'Expected Savings', unit: '%', defaultValue: 30 },
    ],
  },
  LED: {
    label: 'LED Lighting Retrofit',
    fields: [
      { key: 'fixtureCount', label: 'Number of Fixtures', unit: 'nos' },
      { key: 'oldWattage', label: 'Old Wattage per Fixture', unit: 'W' },
      { key: 'newWattage', label: 'New LED Wattage', unit: 'W' },
      { key: 'operatingHrsPerDay', label: 'Operating Hours', unit: 'hrs/day', defaultValue: 12 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'costPerFixture', label: 'Cost per LED Fixture', unit: '₹', defaultValue: 800 },
    ],
  },
  POWER_FACTOR: {
    label: 'Power Factor Correction',
    fields: [
      { key: 'currentPF', label: 'Current Power Factor', unit: '' },
      { key: 'targetPF', label: 'Target Power Factor', unit: '', defaultValue: 0.98 },
      { key: 'monthlyDemandKVA', label: 'Monthly Demand', unit: 'kVA' },
      { key: 'avgMonthlyPenalty', label: 'Avg. Monthly PF Penalty', unit: '₹' },
      { key: 'panelCost', label: 'APFC Panel Cost', unit: '₹' },
    ],
  },
  COMPRESSED_AIR: {
    label: 'Compressed Air Optimization',
    fields: [
      { key: 'compressorKW', label: 'Compressor Power', unit: 'kW' },
      { key: 'leakPercent', label: 'Current Leak Rate', unit: '%', defaultValue: 25 },
      { key: 'targetLeakPercent', label: 'Target Leak Rate', unit: '%', defaultValue: 5 },
      { key: 'operatingHrsPerMonth', label: 'Operating Hours', unit: 'hrs/month', defaultValue: 400 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'repairCost', label: 'Leak Repair Cost', unit: '₹' },
    ],
  },
  MOTOR: {
    label: 'IE3 Motor Replacement',
    fields: [
      { key: 'motorHP', label: 'Motor Size', unit: 'HP' },
      { key: 'oldEfficiency', label: 'Old Motor Efficiency', unit: '%', defaultValue: 85 },
      { key: 'newEfficiency', label: 'New Motor Efficiency', unit: '%', defaultValue: 93.6 },
      { key: 'operatingHrsPerMonth', label: 'Operating Hours', unit: 'hrs/month', defaultValue: 350 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'motorCost', label: 'New Motor Cost', unit: '₹' },
    ],
  },
  TRANSFORMER: {
    label: 'Transformer Replacement',
    fields: [
      { key: 'ratingKVA', label: 'Transformer Rating', unit: 'kVA' },
      { key: 'oldNoLoadLoss', label: 'Old No-Load Loss', unit: 'W' },
      { key: 'newNoLoadLoss', label: 'New No-Load Loss', unit: 'W' },
      { key: 'oldLoadLoss', label: 'Old Load Loss (at full load)', unit: 'W' },
      { key: 'newLoadLoss', label: 'New Load Loss (at full load)', unit: 'W' },
      { key: 'avgLoadPercent', label: 'Avg. Loading', unit: '%', defaultValue: 60 },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '₹/kWh' },
      { key: 'transformerCost', label: 'New Transformer Cost', unit: '₹' },
    ],
  },
};

function calculateROI(templateType: string, inputs: Record<string, number>) {
  const CO2_PER_KWH = 0.82; // kg CO2 per kWh (Indian grid average)

  switch (templateType) {
    case 'SOLAR': {
      const { systemSizeKW, costPerKW = 50000, subsidyPercent = 40, tariffRate, dailyGenerationHrs = 4.5, lifetimeYears = 25 } = inputs;
      const investmentCost = systemSizeKW * costPerKW;
      const subsidyAmount = investmentCost * (subsidyPercent / 100);
      const netInvestment = investmentCost - subsidyAmount;
      const monthlyKwh = systemSizeKW * dailyGenerationHrs * 30;
      const monthlySavings = monthlyKwh * tariffRate;
      const annualSavings = monthlySavings * 12;
      const paybackMonths = netInvestment / monthlySavings;
      return {
        investmentCost, subsidyAmount, netInvestment, monthlySavings: Math.round(monthlySavings),
        annualSavings: Math.round(annualSavings), paybackMonths: Math.round(paybackMonths * 10) / 10,
        fiveYearSavings: Math.round(annualSavings * 5), tenYearSavings: Math.round(annualSavings * 10),
        lifetimeSavings: Math.round(annualSavings * lifetimeYears * 0.9), // rough degradation
        irr: annualSavings > 0 ? Math.round((annualSavings / netInvestment) * 100 * 10) / 10 : 0,
        npv: Math.round(annualSavings * lifetimeYears * 0.6 - netInvestment), // simplified
        co2ReductionKg: Math.round(monthlyKwh * 12 * CO2_PER_KWH),
      };
    }
    case 'VFD': {
      const { motorHP, loadPercent = 60, operatingHrsPerMonth = 400, tariffRate, vfdCost, savingsPercent = 30 } = inputs;
      const motorKW = motorHP * 0.746;
      const monthlyKwh = motorKW * (loadPercent / 100) * operatingHrsPerMonth;
      const kwhSaved = monthlyKwh * (savingsPercent / 100);
      const monthlySavings = kwhSaved * tariffRate;
      const paybackMonths = vfdCost / monthlySavings;
      return {
        investmentCost: vfdCost, subsidyAmount: 0, netInvestment: vfdCost,
        monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(monthlySavings * 12),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        fiveYearSavings: Math.round(monthlySavings * 60), tenYearSavings: Math.round(monthlySavings * 120),
        lifetimeSavings: Math.round(monthlySavings * 180),
        irr: Math.round((monthlySavings * 12 / vfdCost) * 100 * 10) / 10,
        npv: Math.round(monthlySavings * 120 - vfdCost),
        co2ReductionKg: Math.round(kwhSaved * 12 * CO2_PER_KWH),
      };
    }
    case 'LED': {
      const { fixtureCount, oldWattage, newWattage, operatingHrsPerDay = 12, tariffRate, costPerFixture = 800 } = inputs;
      const investmentCost = fixtureCount * costPerFixture;
      const dailySavingsKwh = fixtureCount * (oldWattage - newWattage) / 1000 * operatingHrsPerDay;
      const monthlySavings = dailySavingsKwh * 30 * tariffRate;
      const paybackMonths = investmentCost / monthlySavings;
      return {
        investmentCost, subsidyAmount: 0, netInvestment: investmentCost,
        monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(monthlySavings * 12),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        fiveYearSavings: Math.round(monthlySavings * 60), tenYearSavings: Math.round(monthlySavings * 120),
        lifetimeSavings: Math.round(monthlySavings * 120), // LED ~10yr life
        irr: Math.round((monthlySavings * 12 / investmentCost) * 100 * 10) / 10,
        npv: Math.round(monthlySavings * 120 - investmentCost),
        co2ReductionKg: Math.round(dailySavingsKwh * 365 * CO2_PER_KWH),
      };
    }
    case 'POWER_FACTOR': {
      const { avgMonthlyPenalty, panelCost } = inputs;
      const monthlySavings = avgMonthlyPenalty;
      const paybackMonths = panelCost / monthlySavings;
      return {
        investmentCost: panelCost, subsidyAmount: 0, netInvestment: panelCost,
        monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(monthlySavings * 12),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        fiveYearSavings: Math.round(monthlySavings * 60), tenYearSavings: Math.round(monthlySavings * 120),
        lifetimeSavings: Math.round(monthlySavings * 180),
        irr: Math.round((monthlySavings * 12 / panelCost) * 100 * 10) / 10,
        npv: Math.round(monthlySavings * 120 - panelCost),
        co2ReductionKg: 0,
      };
    }
    case 'COMPRESSED_AIR': {
      const { compressorKW, leakPercent = 25, targetLeakPercent = 5, operatingHrsPerMonth = 400, tariffRate, repairCost } = inputs;
      const investmentCost = repairCost;
      const kwhSaved = compressorKW * ((leakPercent - targetLeakPercent) / 100) * operatingHrsPerMonth;
      const monthlySavings = kwhSaved * tariffRate;
      const paybackMonths = investmentCost / monthlySavings;
      return {
        investmentCost, subsidyAmount: 0, netInvestment: investmentCost,
        monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(monthlySavings * 12),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        fiveYearSavings: Math.round(monthlySavings * 60), tenYearSavings: Math.round(monthlySavings * 120),
        lifetimeSavings: Math.round(monthlySavings * 60), // 5yr typical
        irr: Math.round((monthlySavings * 12 / investmentCost) * 100 * 10) / 10,
        npv: Math.round(monthlySavings * 60 - investmentCost),
        co2ReductionKg: Math.round(kwhSaved * 12 * CO2_PER_KWH),
      };
    }
    case 'MOTOR': {
      const { motorHP, oldEfficiency = 85, newEfficiency = 93.6, operatingHrsPerMonth = 350, tariffRate, motorCost } = inputs;
      const motorKW = motorHP * 0.746;
      const oldConsumption = motorKW / (oldEfficiency / 100) * operatingHrsPerMonth;
      const newConsumption = motorKW / (newEfficiency / 100) * operatingHrsPerMonth;
      const kwhSaved = oldConsumption - newConsumption;
      const monthlySavings = kwhSaved * tariffRate;
      const paybackMonths = motorCost / monthlySavings;
      return {
        investmentCost: motorCost, subsidyAmount: 0, netInvestment: motorCost,
        monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(monthlySavings * 12),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        fiveYearSavings: Math.round(monthlySavings * 60), tenYearSavings: Math.round(monthlySavings * 120),
        lifetimeSavings: Math.round(monthlySavings * 240), // 20yr motor life
        irr: Math.round((monthlySavings * 12 / motorCost) * 100 * 10) / 10,
        npv: Math.round(monthlySavings * 120 - motorCost),
        co2ReductionKg: Math.round(kwhSaved * 12 * CO2_PER_KWH),
      };
    }
    case 'TRANSFORMER': {
      const { oldNoLoadLoss, newNoLoadLoss, oldLoadLoss, newLoadLoss, avgLoadPercent = 60, tariffRate, transformerCost } = inputs;
      const loadFactor = avgLoadPercent / 100;
      const oldLossKw = (oldNoLoadLoss + oldLoadLoss * loadFactor * loadFactor) / 1000;
      const newLossKw = (newNoLoadLoss + newLoadLoss * loadFactor * loadFactor) / 1000;
      const kwhSaved = (oldLossKw - newLossKw) * 24 * 30; // continuous operation
      const monthlySavings = kwhSaved * tariffRate;
      const paybackMonths = transformerCost / monthlySavings;
      return {
        investmentCost: transformerCost, subsidyAmount: 0, netInvestment: transformerCost,
        monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(monthlySavings * 12),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        fiveYearSavings: Math.round(monthlySavings * 60), tenYearSavings: Math.round(monthlySavings * 120),
        lifetimeSavings: Math.round(monthlySavings * 300), // 25yr life
        irr: Math.round((monthlySavings * 12 / transformerCost) * 100 * 10) / 10,
        npv: Math.round(monthlySavings * 120 - transformerCost),
        co2ReductionKg: Math.round(kwhSaved * 12 * CO2_PER_KWH),
      };
    }
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const body = await request.json();

  // If body has 'calculate: true', just return the calculation without saving
  if (body.calculate) {
    const outputs = calculateROI(body.templateType, body.inputs);
    if (!outputs) return NextResponse.json({ error: 'Unknown template type' }, { status: 400 });
    return NextResponse.json({ outputs, templates: TEMPLATES });
  }

  // Save a calculation
  const outputs = calculateROI(body.templateType, body.inputs);
  if (!outputs) return NextResponse.json({ error: 'Unknown template type' }, { status: 400 });

  const calc = await prisma.rOICalculation.create({
    data: {
      clientId,
      name: body.name,
      templateType: body.templateType,
      inputs: JSON.stringify(body.inputs),
      ...outputs,
      status: body.status || 'DRAFT',
      createdById: user.id,
    },
  });

  return NextResponse.json(calc, { status: 201 });
}
